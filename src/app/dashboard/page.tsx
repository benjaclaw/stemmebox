export const dynamic = "force-dynamic";
import { createServerClient } from "@/lib/supabase/server";
import { getUserBusiness } from "@/lib/supabase/auth-helpers";
import Link from "next/link";

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const colors: Record<string, string> = {
    positive: "bg-green-100 text-green-700",
    neutral: "bg-yellow-100 text-yellow-700",
    negative: "bg-red-100 text-red-700",
  };
  const labels: Record<string, string> = {
    positive: "Positiv",
    neutral: "Nøytral",
    negative: "Negativ",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[sentiment] ?? "bg-warm-100 text-warm-600"}`}
    >
      {labels[sentiment] ?? sentiment}
    </span>
  );
}

export default async function DashboardOverview() {
  const biz = await getUserBusiness();
  const supabase = createServerClient();

  let totalRecordings = 0;
  let thisWeekCount = 0;
  let avgSentiment: number | null = null;
  let locationCount = 0;
  interface RecentFeedback {
    id: string;
    transcript: string | null;
    created_at: string;
    analyses: { overall_sentiment: string; sentiment_score: number }[] | null;
  }
  let recentFeedback: RecentFeedback[] = [];

  if (biz) {
    // Get location IDs for this business
    const { data: locations } = await supabase
      .from("locations")
      .select("id")
      .eq("business_id", biz.businessId);

    const locationIds = locations?.map((l) => l.id) ?? [];
    locationCount = locationIds.length;

    if (locationIds.length > 0) {
      // Total recordings
      const { count } = await supabase
        .from("recordings")
        .select("id", { count: "exact", head: true })
        .in("location_id", locationIds);
      totalRecordings = count ?? 0;

      // This week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: weekCount } = await supabase
        .from("recordings")
        .select("id", { count: "exact", head: true })
        .in("location_id", locationIds)
        .gte("created_at", weekAgo.toISOString());
      thisWeekCount = weekCount ?? 0;

      // Average sentiment
      const { data: analyses } = await supabase
        .from("analyses")
        .select("sentiment_score, recording_id")
        .in(
          "recording_id",
          (
            await supabase
              .from("recordings")
              .select("id")
              .in("location_id", locationIds)
          ).data?.map((r) => r.id) ?? []
        );

      if (analyses && analyses.length > 0) {
        const sum = analyses.reduce((a, b) => a + b.sentiment_score, 0);
        avgSentiment = sum / analyses.length;
      }

      // Recent feedback (last 5)
      const { data: recent } = await supabase
        .from("recordings")
        .select("id, transcript, created_at, analyses(overall_sentiment, sentiment_score)")
        .in("location_id", locationIds)
        .order("created_at", { ascending: false })
        .limit(5);

      recentFeedback = (recent ?? []) as RecentFeedback[];
    }
  }

  const stats = [
    { label: "Totalt meldinger", value: String(totalRecordings), icon: "🎙️" },
    { label: "Denne uken", value: String(thisWeekCount), icon: "📅" },
    {
      label: "Gjennomsnitt sentiment",
      value: avgSentiment !== null ? `${(avgSentiment * 100).toFixed(0)}%` : "—",
      icon: "😊",
    },
    { label: "Lokasjoner", value: String(locationCount), icon: "📍" },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-warm-900">
          Oversikt
        </h1>
        <p className="text-warm-500 text-sm mt-1">
          Velkommen til StemmeBox-dashboardet ditt
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-5 border border-warm-200"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="text-2xl font-heading font-bold text-warm-900">
              {stat.value}
            </p>
            <p className="text-sm text-warm-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 border border-warm-200">
        <h2 className="text-lg font-heading font-semibold text-warm-900 mb-4">
          Siste tilbakemeldinger
        </h2>

        {recentFeedback.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🎙️</p>
            <p className="text-warm-500">
              Ingen tilbakemeldinger ennå. Del QR-koden din med kundene for å
              komme i gang!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentFeedback.map((fb) => {
              const analysis = Array.isArray(fb.analyses) ? fb.analyses[0] : null;
              return (
                <Link
                  key={fb.id}
                  href={`/dashboard/feedback/${fb.id}`}
                  className="block p-4 rounded-lg border border-warm-100 hover:border-warm-300 transition"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-warm-400">
                      {new Date(fb.created_at).toLocaleDateString("nb-NO", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {analysis && (
                      <SentimentBadge sentiment={analysis.overall_sentiment} />
                    )}
                  </div>
                  <p className="text-sm text-warm-700 line-clamp-2">
                    {fb.transcript || "Venter på transkripsjon..."}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
