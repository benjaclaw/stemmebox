export default function FeedbackPage() {
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

      <div className="bg-white rounded-xl border border-warm-200">
        <div className="p-6 text-center py-16">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-warm-500 mb-4">
            Ingen tilbakemeldinger ennå
          </p>
          <p className="text-warm-400 text-sm">
            Når kundene dine begynner å gi tilbakemeldinger via QR-koden, vil de
            vises her.
          </p>
        </div>
      </div>
    </div>
  );
}
