export const dynamic = "force-dynamic";
import { createServerClient } from "@/lib/supabase/server";
import { getUserBusiness } from "@/lib/supabase/auth-helpers";

const categoryLabels: Record<string, string> = {
  food: "Mat",
  service: "Service",
  atmosphere: "Atmosfære",
  price: "Pris",
  other: "Annet",
};

function sentimentColor(sentiment: string) {
  switch (sentiment) {
    case "positive":
      return "bg-green-500";
    case "negative":
      return "bg-red-500";
    default:
      return "bg-yellow-500";
  }
}

export default async function TrendsPage() {
  const biz = await getUserBusiness();
  const supabase = createServerClient();

  interface DayData {
    date: string;
    avg: number;
    count: number;
  }
  let dailyData: DayData[] = [];

  interface WeekData {
    week: string;
    avg: number;
    count: number;
  }
  let weeklyData: WeekData[] = [];

  interface CategoryData {
    category: string;
    positive: number;
    neutral: number;
    negative: number;
  }
  let categoryData: CategoryData[] = [];

  if (biz) {
    const { data: locations } = await supabase
      .from("locations")
      .select("id")
      .eq("business_id", biz.businessId);

    const locationIds = locations?.map((l) => l.id) ?? [];

    if (locationIds.length > 0) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get all recordings with analyses from last 30 days
      const { data: recordings } = await supabase
        .from("recordings")
        .select(
          "id, created_at, analyses(sentiment_score, overall_sentiment, analysis_categories(category, sentiment))"
        )
        .in("location_id", locationIds)
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      if (recordings && recordings.length > 0) {
        // Daily sentiment data
        const dailyMap = new Map<string, { sum: number; count: number }>();
        const weeklyMap = new Map<string, { sum: number; count: number }>();
        const catMap = new Map<
          string,
          { positive: number; neutral: number; negative: number }
        >();

        for (const rec of recordings) {
          const analyses = Array.isArray(rec.analyses) ? rec.analyses : [];
          const analysis = analyses[0] as {
            sentiment_score: number;
            overall_sentiment: string;
            analysis_categories?: { category: string; sentiment: string }[];
          } | undefined;
          if (!analysis) continue;

          const date = new Date(rec.created_at).toISOString().split("T")[0];
          const d = dailyMap.get(date) ?? { sum: 0, count: 0 };
          d.sum += analysis.sentiment_score;
          d.count += 1;
          dailyMap.set(date, d);

          // Weekly
          const recDate = new Date(rec.created_at);
          const weekStart = new Date(recDate);
          weekStart.setDate(recDate.getDate() - recDate.getDay() + 1);
          const weekKey = weekStart.toISOString().split("T")[0];
          const w = weeklyMap.get(weekKey) ?? { sum: 0, count: 0 };
          w.sum += analysis.sentiment_score;
          w.count += 1;
          weeklyMap.set(weekKey, w);

          // Categories
          const cats = analysis.analysis_categories ?? [];
          for (const cat of cats) {
            const c = catMap.get(cat.category) ?? {
              positive: 0,
              neutral: 0,
              negative: 0,
            };
            if (cat.sentiment === "positive") c.positive++;
            else if (cat.sentiment === "negative") c.negative++;
            else c.neutral++;
            catMap.set(cat.category, c);
          }
        }

        dailyData = Array.from(dailyMap.entries()).map(([date, d]) => ({
          date,
          avg: d.sum / d.count,
          count: d.count,
        }));

        weeklyData = Array.from(weeklyMap.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([week, w]) => ({
            week,
            avg: w.sum / w.count,
            count: w.count,
          }));

        categoryData = Array.from(catMap.entries()).map(([category, c]) => ({
          category,
          ...c,
        }));
      }
    }
  }

  const hasData = dailyData.length > 0;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-warm-900">
          Trender
        </h1>
        <p className="text-warm-500 text-sm mt-1">
          Sentiment og kategorier over tid (siste 30 dager)
        </p>
      </div>

      {!hasData ? (
        <div className="bg-white rounded-xl border border-warm-200">
          <div className="p-6 text-center py-16">
            <p className="text-4xl mb-3">📈</p>
            <p className="text-warm-500 mb-4">
              Ikke nok data for trender ennå
            </p>
            <p className="text-warm-400 text-sm">
              Trendgrafer vil vises her når du har fått noen tilbakemeldinger.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Daily sentiment bar chart */}
          <div className="bg-white rounded-xl p-6 border border-warm-200">
            <h2 className="text-lg font-heading font-semibold text-warm-900 mb-4">
              Daglig sentiment
            </h2>
            <div className="flex items-end gap-1 h-40">
              {dailyData.map((d) => {
                const heightPct = Math.max(d.avg * 100, 5);
                const color =
                  d.avg >= 0.6
                    ? "bg-green-500"
                    : d.avg >= 0.4
                      ? "bg-yellow-500"
                      : "bg-red-500";
                return (
                  <div
                    key={d.date}
                    className="flex-1 flex flex-col items-center gap-1 min-w-0"
                  >
                    <span className="text-[10px] text-warm-400">
                      {(d.avg * 100).toFixed(0)}%
                    </span>
                    <div
                      className={`w-full max-w-[32px] rounded-t ${color}`}
                      style={{ height: `${heightPct}%` }}
                      title={`${d.date}: ${(d.avg * 100).toFixed(0)}% (${d.count} meldinger)`}
                    />
                    <span className="text-[9px] text-warm-400 truncate w-full text-center">
                      {new Date(d.date + "T00:00:00").toLocaleDateString("nb-NO", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly averages */}
          <div className="bg-white rounded-xl p-6 border border-warm-200">
            <h2 className="text-lg font-heading font-semibold text-warm-900 mb-4">
              Ukentlig gjennomsnitt
            </h2>
            <div className="space-y-3">
              {weeklyData.map((w) => {
                const pct = w.avg * 100;
                const color =
                  pct >= 60
                    ? "bg-green-500"
                    : pct >= 40
                      ? "bg-yellow-500"
                      : "bg-red-500";
                return (
                  <div key={w.week}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-warm-600">
                        Uke fra{" "}
                        {new Date(w.week + "T00:00:00").toLocaleDateString("nb-NO", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <span className="text-warm-500">
                        {pct.toFixed(0)}% ({w.count} meldinger)
                      </span>
                    </div>
                    <div className="w-full bg-warm-100 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category breakdown */}
          <div className="bg-white rounded-xl p-6 border border-warm-200">
            <h2 className="text-lg font-heading font-semibold text-warm-900 mb-4">
              Kategorifordeling
            </h2>
            <div className="space-y-4">
              {categoryData.map((cat) => {
                const total = cat.positive + cat.neutral + cat.negative;
                return (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-medium text-warm-800">
                        {categoryLabels[cat.category] ?? cat.category}
                      </span>
                      <span className="text-warm-400">{total} omtaler</span>
                    </div>
                    <div className="flex gap-0.5 h-5 rounded overflow-hidden">
                      {cat.positive > 0 && (
                        <div
                          className={`${sentimentColor("positive")} flex items-center justify-center text-[10px] text-white font-medium`}
                          style={{
                            width: `${(cat.positive / total) * 100}%`,
                          }}
                        >
                          {cat.positive}
                        </div>
                      )}
                      {cat.neutral > 0 && (
                        <div
                          className={`${sentimentColor("neutral")} flex items-center justify-center text-[10px] text-white font-medium`}
                          style={{
                            width: `${(cat.neutral / total) * 100}%`,
                          }}
                        >
                          {cat.neutral}
                        </div>
                      )}
                      {cat.negative > 0 && (
                        <div
                          className={`${sentimentColor("negative")} flex items-center justify-center text-[10px] text-white font-medium`}
                          style={{
                            width: `${(cat.negative / total) * 100}%`,
                          }}
                        >
                          {cat.negative}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-4 mt-1 text-[11px] text-warm-400">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        Positiv
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-yellow-500" />
                        Nøytral
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        Negativ
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
