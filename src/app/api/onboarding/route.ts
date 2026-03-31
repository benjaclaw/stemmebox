import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
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
    const { businessName, industry, locationName, locationAddress } =
      await request.json();

    if (!businessName?.trim() || !industry || !locationName?.trim()) {
      return NextResponse.json(
        { error: "Bedriftsnavn, bransje og lokasjonsnavn er påkrevd." },
        { status: 400 }
      );
    }

    // Authenticate user via cookies
    const supabaseAuth = await createServerClient();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Du må være logget inn. Prøv å logge inn på nytt." },
        { status: 401 }
      );
    }

    // Use service role client to bypass RLS
    const supabase = createServiceClient();

    // Generate unique business slug
    const baseSlug = slugify(businessName);
    let slug = baseSlug;
    let attempt = 0;

    while (true) {
      const { data: existing } = await supabase
        .from("businesses")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (!existing) break;
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    // Create business
    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .insert({ name: businessName.trim(), slug })
      .select("id")
      .single();

    if (bizError) {
      return NextResponse.json(
        { error: "Kunne ikke opprette bedrift: " + bizError.message },
        { status: 500 }
      );
    }

    // Create membership
    const { error: memberError } = await supabase.from("members").insert({
      user_id: user.id,
      business_id: business.id,
      role: "owner",
    });

    if (memberError) {
      return NextResponse.json(
        { error: "Kunne ikke opprette medlemskap: " + memberError.message },
        { status: 500 }
      );
    }

    // Create free plan
    const { error: planError } = await supabase.from("plans").insert({
      business_id: business.id,
      plan_type: "free",
      status: "active",
    });

    if (planError) {
      return NextResponse.json(
        { error: "Kunne ikke opprette plan: " + planError.message },
        { status: 500 }
      );
    }

    // Generate unique location slug
    const baseLocSlug = slugify(`${businessName}-${locationName}`);
    let locationSlug = baseLocSlug;
    let locAttempt = 0;

    while (true) {
      const { data: existing } = await supabase
        .from("locations")
        .select("id")
        .eq("slug", locationSlug)
        .maybeSingle();

      if (!existing) break;
      locAttempt++;
      locationSlug = `${baseLocSlug}-${locAttempt}`;
    }

    // Create location
    const { error: locError } = await supabase.from("locations").insert({
      business_id: business.id,
      name: locationName.trim(),
      address: locationAddress?.trim() || null,
      slug: locationSlug,
    });

    if (locError) {
      return NextResponse.json(
        { error: "Kunne ikke opprette lokasjon: " + locError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ slug, locationSlug });
  } catch {
    return NextResponse.json(
      { error: "En uventet feil oppstod. Prøv igjen." },
      { status: 500 }
    );
  }
}
