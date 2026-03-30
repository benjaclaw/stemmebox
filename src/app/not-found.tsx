import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50 px-4">
      <div className="text-center">
        <p className="text-6xl mb-4">🔍</p>
        <h1 className="text-3xl font-heading font-bold text-warm-900 mb-2">
          Siden finnes ikke
        </h1>
        <p className="text-warm-500 mb-6">
          Vi fant ikke siden du lette etter.
        </p>
        <Link
          href="/"
          className="bg-teal-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-teal-dark transition text-sm"
        >
          Gå til forsiden
        </Link>
      </div>
    </div>
  );
}
