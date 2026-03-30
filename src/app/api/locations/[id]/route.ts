import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "name er påkrevd" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { error } = await supabase
      .from("locations")
      .update({ name: name.trim() })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Location PATCH error:", err);
    return NextResponse.json(
      { error: "Kunne ikke oppdatere" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = createServiceClient();

    // Delete recordings for this location first (cascade)
    const { data: recordings } = await supabase
      .from("recordings")
      .select("id, audio_url")
      .eq("location_id", id);

    if (recordings && recordings.length > 0) {
      // Delete audio files from storage
      const filePaths = recordings
        .filter((r) => r.audio_url?.includes("/recordings/"))
        .map((r) => {
          const path = r.audio_url.split("/recordings/").pop();
          return path ? decodeURIComponent(path) : null;
        })
        .filter(Boolean) as string[];

      if (filePaths.length > 0) {
        await supabase.storage.from("recordings").remove(filePaths);
      }

      // Delete recordings (cascades to analyses + categories)
      await supabase
        .from("recordings")
        .delete()
        .eq("location_id", id);
    }

    // Delete location
    const { error } = await supabase
      .from("locations")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Location DELETE error:", err);
    return NextResponse.json(
      { error: "Kunne ikke slette lokasjon" },
      { status: 500 }
    );
  }
}
