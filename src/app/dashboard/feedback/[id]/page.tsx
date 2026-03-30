export const dynamic = "force-dynamic";
import { createServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import DeleteButton from "./delete-button";

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
      return "text-green-600";
    case "negative":
      return "text-red-600";
    default:
      return "text-yellow-600";
  }
}

function sentimentBg(sentiment: string) {
  switch (sentiment) {
    case "positive":
      return "bg-green-50 border-green-200";
    case "negative":
      return "bg-red-50 border-red-200";
    default:
      return "bg-yellow-50 border-yellow-200";
  }
}

function sentimentLabel(sentiment: string) {
  switch (sentiment) {
    case "positive":
      return "Positiv";
    case "negative":
      return "Negativ";
    default:
      return "Nøytral";
  }
}

export default async function FeedbackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServerClient();

  const { data: recording } = await supabase
    .from("recordings")
    .select(
      "id, audio_url, transcript, duration_seconds, created_at, status, analyses(id, overall_sentiment, sentiment_score, summary, analysis_categories(category, sentiment, excerpt))"
    )
    .eq("id", id)
    .single();

  if (!recording) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-warm-500">Tilbakemelding ikke funnet</p>
          <Link
            href="/dashboard/feedback"
            className="text-teal-primary hover:underline text-sm mt-2 inline-block"
          >
            ← Tilbake til feedback
          </Link>
        </div>
      </div>
    );
  }

  const analysis = Array.isArray(recording.analyses)
    ? recording.analyses[0]
    : null;
  const categories = (analysis as { analysis_categories?: { category: string; sentiment: string; excerpt: string }[] })?.analysis_categories ?? [];

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <Link
        href="/dashboard/feedback"
        className="text-sm text-warm-500 hover:text-warm-700 mb-6 inline-block"
      >
        ← Tilbake til feedback
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-warm-900">
            Tilbakemelding
          </h1>
          <p className="text-warm-400 text-sm mt-1">
            {new Date(recording.created_at).toLocaleDateString("nb-NO", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {recording.duration_seconds &&
              ` · ${Math.floor(recording.duration_seconds / 60)}:${(recording.duration_seconds % 60).toString().padStart(2, "0")}`}
          </p>
        </div>
        <DeleteButton recordingId={recording.id} />
      </div>

      {/* Audio player */}
      {recording.audio_url && (
        <div className="bg-white rounded-xl p-4 border border-warm-200 mb-6">
          <p className="text-sm font-medium text-warm-700 mb-2">
            Originalopptak
          </p>
          <audio src={recording.audio_url} controls className="w-full" />
        </div>
      )}

      {/* Transcript */}
      <div className="bg-white rounded-xl p-6 border border-warm-200 mb-6">
        <h2 className="text-lg font-heading font-semibold text-warm-900 mb-3">
          Transkripsjon
        </h2>
        <p className="text-warm-700 leading-relaxed">
          {recording.transcript ||
            (recording.status === "pending" || recording.status === "processing"
              ? "Transkriberer..."
              : "Transkripsjon utilgjengelig")}
        </p>
      </div>

      {/* Sentiment analysis */}
      {analysis && (
        <div
          className={`rounded-xl p-6 border mb-6 ${sentimentBg(analysis.overall_sentiment)}`}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-heading font-semibold text-warm-900">
              Sentiment
            </h2>
            <div className="flex items-center gap-2">
              <span
                className={`text-2xl font-bold ${sentimentColor(analysis.overall_sentiment)}`}
              >
                {(analysis.sentiment_score * 100).toFixed(0)}%
              </span>
              <span
                className={`text-sm font-medium ${sentimentColor(analysis.overall_sentiment)}`}
              >
                {sentimentLabel(analysis.overall_sentiment)}
              </span>
            </div>
          </div>
          {analysis.summary && (
            <p className="text-warm-700 text-sm">{analysis.summary}</p>
          )}
        </div>
      )}

      {/* Category breakdown */}
      {categories.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-warm-200">
          <h2 className="text-lg font-heading font-semibold text-warm-900 mb-4">
            Kategorier
          </h2>
          <div className="space-y-4">
            {categories.map((cat, i) => (
              <div
                key={i}
                className={`rounded-lg p-4 border ${sentimentBg(cat.sentiment)}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-warm-900 text-sm">
                    {categoryLabels[cat.category] ?? cat.category}
                  </span>
                  <span
                    className={`text-xs font-medium ${sentimentColor(cat.sentiment)}`}
                  >
                    {sentimentLabel(cat.sentiment)}
                  </span>
                </div>
                {cat.excerpt && (
                  <p className="text-warm-600 text-sm italic">
                    &ldquo;{cat.excerpt}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
