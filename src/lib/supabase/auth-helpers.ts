import { createServerClient } from "./server";

export async function getUserBusiness() {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: member } = await supabase
    .from("members")
    .select("business_id, role, businesses(id, name, slug)")
    .eq("user_id", user.id)
    .single();

  if (!member) return null;

  const business = member.businesses as unknown as {
    id: string;
    name: string;
    slug: string;
  };

  return {
    userId: user.id,
    businessId: member.business_id as string,
    role: member.role as string,
    businessName: business?.name ?? "",
    businessSlug: business?.slug ?? "",
  };
}
