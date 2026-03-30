import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[æ]/g, "ae")
    .replace(/[ø]/g, "o")
    .replace(/[å]/g, "a")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function POST(request: NextRequest) {
  try {
    const { businessId, name, address } = await request.json();

    if (!businessId || !name) {
      return NextResponse.json(
        { error: "businessId og name er påkrevd" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Get business slug for location slug prefix
    const { data: business } = await supabase
      .from("businesses")
      .select("slug")
      .eq("id", businessId)
      .single();

    const baseSlug = slugify(`${business?.slug ?? ""}-${name}`);
    let slug = baseSlug;
    let attempt = 0;

    while (true) {
      const { data: existing } = await supabase
        .from("locations")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (!existing) break;
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    const { data: location, error } = await supabase
      .from("locations")
      .insert({
        business_id: businessId,
        name: name.trim(),
        address: address?.trim() || null,
        slug,
      })
      .select("id, name, slug, address")
      .single();

    if (error) throw error;

    return NextResponse.json(location, { status: 201 });
  } catch (err) {
    console.error("Location POST error:", err);
    return NextResponse.json(
      { error: "Kunne ikke opprette lokasjon" },
      { status: 500 }
    );
  }
}
