"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50 px-4">
      <div className="text-center">
        <p className="text-6xl mb-4">⚠️</p>
        <h1 className="text-2xl font-heading font-bold text-warm-900 mb-2">
          Noe gikk galt
        </h1>
        <p className="text-warm-500 mb-6">
          En uventet feil oppstod. Prøv igjen.
        </p>
        <button
          onClick={reset}
          className="bg-teal-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-teal-dark transition text-sm"
        >
          Prøv igjen
        </button>
      </div>
    </div>
  );
}
