import type { Metadata } from "next";
export const metadata: Metadata = { title: "Innstillinger" };
export const dynamic = "force-dynamic";
import { createServerClient } from "@/lib/supabase/server";
import { getUserBusiness } from "@/lib/supabase/auth-helpers";
import SettingsForm from "./settings-form";

export default async function SettingsPage() {
  const biz = await getUserBusiness();
  const supabase = await createServerClient();

  let businessName = "";
  let planType = "free";
  let members: { id: string; role: string; user_id: string }[] = [];

  if (biz) {
    businessName = biz.businessName;

    // Get plan
    const { data: plan } = await supabase
      .from("plans")
      .select("plan_type")
      .eq("business_id", biz.businessId)
      .single();

    if (plan) {
      planType = plan.plan_type;
    }

    // Get members
    const { data: memberRows } = await supabase
      .from("members")
      .select("id, role, user_id")
      .eq("business_id", biz.businessId);

    members = memberRows ?? [];
  }

  const planLabels: Record<string, string> = {
    free: "Free",
    pro: "Pro (499 kr/mnd)",
    business: "Business (999 kr/mnd)",
  };

  const planLimits: Record<string, string> = {
    free: "5 meldinger per måned",
    pro: "Ubegrenset + AI-innsikt",
    business: "Flere lokasjoner + integrasjoner",
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-warm-900">
          Innstillinger
        </h1>
        <p className="text-warm-500 text-sm mt-1">
          Administrer bedriften din
        </p>
      </div>

      <div className="space-y-6">
        {/* Business info */}
        <div className="bg-white rounded-xl p-6 border border-warm-200">
          <h2 className="text-lg font-heading font-semibold text-warm-900 mb-4">
            Bedriftsinformasjon
          </h2>
          <SettingsForm
            businessId={biz?.businessId ?? ""}
            initialName={businessName}
          />
        </div>

        {/* Plan */}
        <div className="bg-white rounded-xl p-6 border border-warm-200">
          <h2 className="text-lg font-heading font-semibold text-warm-900 mb-4">
            Abonnement
          </h2>
          <div className="flex items-center gap-3">
            <span className="bg-warm-100 text-warm-700 px-3 py-1 rounded-full text-sm font-medium">
              {planLabels[planType] ?? planType}
            </span>
            <span className="text-sm text-warm-500">
              {planLimits[planType] ?? ""}
            </span>
          </div>
          {planType === "free" && (
            <button className="mt-4 text-sm text-teal-primary hover:underline font-medium">
              Oppgrader til Pro →
            </button>
          )}
        </div>

        {/* Team */}
        <div className="bg-white rounded-xl p-6 border border-warm-200">
          <h2 className="text-lg font-heading font-semibold text-warm-900 mb-4">
            Team
          </h2>
          {members.length === 0 ? (
            <p className="text-warm-500 text-sm">Ingen teammedlemmer ennå</p>
          ) : (
            <div className="space-y-2">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between py-2 border-b border-warm-100 last:border-0"
                >
                  <span className="text-sm text-warm-700">{m.user_id}</span>
                  <span className="text-xs bg-warm-100 text-warm-600 px-2 py-0.5 rounded-full capitalize">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          )}
          <button
            disabled
            className="mt-4 text-sm text-warm-400 cursor-not-allowed"
          >
            Inviter teammedlem (kommer snart)
          </button>
        </div>
      </div>
    </div>
  );
}
