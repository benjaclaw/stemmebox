import Link from "next/link";
import { MicrophoneIcon } from "./MicrophoneIcon";

export function Header() {
  return (
    <nav className="border-b border-warm-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <MicrophoneIcon className="w-7 h-7 text-teal-primary" />
          <span className="text-xl font-heading font-bold text-warm-900">
            StemmeBox
          </span>
        </Link>
        <div className="hidden sm:flex items-center gap-6 text-sm text-warm-600">
          <a href="/#features" className="hover:text-warm-900 transition">
            Funksjoner
          </a>
          <a href="/#pricing" className="hover:text-warm-900 transition">
            Priser
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-warm-600 hover:text-warm-900 transition"
          >
            Logg inn
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-teal-primary text-white px-4 py-2 rounded-lg hover:bg-teal-dark transition font-medium"
          >
            Kom i gang
          </Link>
        </div>
      </div>
    </nav>
  );
}
