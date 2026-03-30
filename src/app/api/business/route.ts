import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function PATCH(request: NextRequest) {
  try {
    const { businessId, name } = await request.json();

    if (!businessId || !name) {
      return NextResponse.json(
        { error: "businessId og name er påkrevd" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { error } = await supabase
      .from("businesses")
      .update({ name })
      .eq("id", businessId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Business PATCH error:", err);
    return NextResponse.json(
      { error: "Kunne ikke oppdatere" },
      { status: 500 }
    );
  }
}
