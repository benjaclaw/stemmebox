import Link from "next/link";
import { MicrophoneIcon } from "./MicrophoneIcon";

export function Footer() {
  return (
    <footer className="border-t border-warm-200 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MicrophoneIcon className="w-5 h-5 text-teal-primary" />
            <span className="font-heading font-bold text-warm-900">
              StemmeBox
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-warm-500">
            <Link href="/privacy" className="hover:text-warm-900 transition">
              Personvern
            </Link>
            <Link href="/terms" className="hover:text-warm-900 transition">
              Vilkår
            </Link>
          </div>
          <p className="text-sm text-warm-400">
            © 2026 StemmeBox. Alle rettigheter forbeholdt.
          </p>
        </div>
      </div>
    </footer>
  );
}
