import type { Metadata } from "next";
export const metadata: Metadata = { title: "Feedback" };
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

const categoryLabels: Record<string, string> = {
  food: "Mat",
  service: "Service",
  atmosphere: "Atmosfære",
  price: "Pris",
  other: "Annet",
};

const PAGE_SIZE = 10;

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; page?: string }>;
}) {
  const { filter = "all", page = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const biz = await getUserBusiness();
  const supabase = await createServerClient();

  interface RecordingRow {
    id: string;
    transcript: string | null;
    duration_seconds: number | null;
    created_at: string;
    status: string;
    analyses: {
      overall_sentiment: string;
      sentiment_score: number;
      analysis_categories: { category: string; sentiment: string }[];
    }[] | null;
  }

  let recordings: RecordingRow[] = [];
  let totalCount = 0;

  if (biz) {
    const { data: locations } = await supabase
      .from("locations")
      .select("id")
      .eq("business_id", biz.businessId);

    const locationIds = locations?.map((l) => l.id) ?? [];

    if (locationIds.length > 0) {
      // Build query
      let query = supabase
        .from("recordings")
        .select(
          "id, transcript, duration_seconds, created_at, status, analyses(overall_sentiment, sentiment_score, analysis_categories(category, sentiment))",
          { count: "exact" }
        )
        .in("location_id", locationIds)
        .order("created_at", { ascending: false });

      // Apply sentiment filter via a subquery approach
      // We need to fetch all and filter if needed, or use a smarter approach
      const { data, count } = await query
        .range((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE - 1);

      let filtered = (data ?? []) as RecordingRow[];

      if (filter === "positive" || filter === "negative" || filter === "neutral") {
        filtered = filtered.filter((r) => {
          const a = Array.isArray(r.analyses) ? r.analyses[0] : null;
          return a?.overall_sentiment === filter;
        });
      }

      recordings = filtered;
      totalCount = count ?? 0;
    }
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-warm-900">
          Feedback
        </h1>
        <p className="text-warm-500 text-sm mt-1">
          Alle stemme-tilbakemeldinger fra kundene dine
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "all", label: "Alle" },
          { key: "positive", label: "Positive" },
          { key: "neutral", label: "Nøytrale" },
          { key: "negative", label: "Negative" },
        ].map((f) => (
          <Link
            key={f.key}
            href={`/dashboard/feedback?filter=${f.key}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === f.key
                ? "bg-teal-primary text-white"
                : "bg-white text-warm-600 border border-warm-200 hover:bg-warm-50"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {recordings.length === 0 ? (
        <div className="bg-white rounded-xl border border-warm-200">
          <div className="p-6 text-center py-16">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-warm-500 mb-4">Ingen tilbakemeldinger ennå</p>
            <p className="text-warm-400 text-sm">
              Når kundene dine begynner å gi tilbakemeldinger via QR-koden, vil
              de vises her.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-warm-200 divide-y divide-warm-100">
            {recordings.map((rec) => {
              const analysis = Array.isArray(rec.analyses) ? rec.analyses[0] : null;
              const categories = analysis?.analysis_categories ?? [];

              return (
                <Link
                  key={rec.id}
                  href={`/dashboard/feedback/${rec.id}`}
                  className="block p-4 hover:bg-warm-50 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-warm-400">
                        {new Date(rec.created_at).toLocaleDateString("nb-NO", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {rec.duration_seconds && (
                        <span className="text-xs text-warm-400">
                          {Math.floor(rec.duration_seconds / 60)}:
                          {(rec.duration_seconds % 60)
                            .toString()
                            .padStart(2, "0")}
                        </span>
                      )}
                    </div>
                    {analysis && (
                      <SentimentBadge
                        sentiment={analysis.overall_sentiment}
                      />
                    )}
                  </div>
                  <p className="text-sm text-warm-700 line-clamp-2 mb-2">
                    {rec.transcript ||
                      (rec.status === "pending" || rec.status === "processing"
                        ? "Behandler..."
                        : "Transkripsjon utilgjengelig")}
                  </p>
                  {categories.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {categories.map((cat, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 rounded bg-warm-100 text-warm-600"
                        >
                          {categoryLabels[cat.category] ?? cat.category}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {currentPage > 1 && (
                <Link
                  href={`/dashboard/feedback?filter=${filter}&page=${currentPage - 1}`}
                  className="px-3 py-2 rounded-lg border border-warm-200 text-sm text-warm-600 hover:bg-warm-50"
                >
                  Forrige
                </Link>
              )}
              <span className="text-sm text-warm-500">
                Side {currentPage} av {totalPages}
              </span>
              {currentPage < totalPages && (
                <Link
                  href={`/dashboard/feedback?filter=${filter}&page=${currentPage + 1}`}
                  className="px-3 py-2 rounded-lg border border-warm-200 text-sm text-warm-600 hover:bg-warm-50"
                >
                  Neste
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
