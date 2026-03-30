import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = createServiceClient();

    // Get recording to find the audio file path
    const { data: recording } = await supabase
      .from("recordings")
      .select("id, audio_url")
      .eq("id", id)
      .single();

    if (!recording) {
      return NextResponse.json(
        { error: "Ikke funnet" },
        { status: 404 }
      );
    }

    // Delete audio from storage if URL contains our bucket
    if (recording.audio_url?.includes("/recordings/")) {
      const path = recording.audio_url.split("/recordings/").pop();
      if (path) {
        await supabase.storage.from("recordings").remove([decodeURIComponent(path)]);
      }
    }

    // Delete recording (cascades to analyses + categories)
    const { error } = await supabase
      .from("recordings")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json(
      { error: "Kunne ikke slette" },
      { status: 500 }
    );
  }
}
