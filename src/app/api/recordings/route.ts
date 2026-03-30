import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audio = formData.get("audio") as File | null;
    const slug = formData.get("slug") as string | null;
    const durationStr = formData.get("duration") as string | null;

    if (!audio || !slug) {
      return NextResponse.json(
        { error: "Audio og slug er påkrevd" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Look up location from slug
    const { data: location, error: locationError } = await supabase
      .from("locations")
      .select("id")
      .eq("slug", slug)
      .single();

    if (locationError || !location) {
      return NextResponse.json(
        { error: "Lokasjon ikke funnet" },
        { status: 404 }
      );
    }

    // Upload audio to Supabase Storage
    const fileName = `${location.id}/${Date.now()}-${crypto.randomUUID()}.webm`;
    const arrayBuffer = await audio.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("recordings")
      .upload(fileName, buffer, {
        contentType: audio.type || "audio/webm",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Kunne ikke laste opp lydfil" },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("recordings")
      .getPublicUrl(fileName);

    // Insert recording row
    const duration = durationStr ? parseInt(durationStr, 10) : null;
    const { data: recording, error: insertError } = await supabase
      .from("recordings")
      .insert({
        location_id: location.id,
        audio_url: urlData.publicUrl,
        duration_seconds: duration,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: "Kunne ikke lagre innspilling" },
        { status: 500 }
      );
    }

    // Trigger async analysis (fire and forget)
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.nextUrl.origin;

    fetch(`${baseUrl}/api/recordings/${recording.id}/analyze`, {
      method: "POST",
    }).catch((err) => console.error("Failed to trigger analysis:", err));

    return NextResponse.json({ id: recording.id }, { status: 201 });
  } catch (err) {
    console.error("Recordings POST error:", err);
    return NextResponse.json(
      { error: "Noe gikk galt" },
      { status: 500 }
    );
  }
}
