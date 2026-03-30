"use client";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <p className="text-4xl mb-3">⚠️</p>
        <h2 className="text-lg font-heading font-semibold text-warm-900 mb-2">
          Kunne ikke laste inn data
        </h2>
        <p className="text-warm-500 text-sm mb-4">
          Prøv å laste siden på nytt.
        </p>
        <button
          onClick={reset}
          className="bg-teal-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-dark transition"
        >
          Prøv igjen
        </button>
      </div>
    </div>
  );
}
