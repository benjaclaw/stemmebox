export default function TrendsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-warm-900">
          Trender
        </h1>
        <p className="text-warm-500 text-sm mt-1">
          Sentiment og kategorier over tid
        </p>
      </div>

      <div className="bg-white rounded-xl border border-warm-200">
        <div className="p-6 text-center py-16">
          <p className="text-4xl mb-3">📈</p>
          <p className="text-warm-500 mb-4">
            Ikke nok data for trender ennå
          </p>
          <p className="text-warm-400 text-sm">
            Trendgrafer for mat, service, atmosfære og pris vil vises her når du
            har fått noen tilbakemeldinger.
          </p>
        </div>
      </div>
    </div>
  );
}
