import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "StemmeBox — Anonym stemme-feedback for bedrifter",
    template: "%s | StemmeBox",
  },
  description:
    "La kundene dine gi ærlig tilbakemelding med stemmen. QR-kode → innspilling → AI-analyse. Helt anonymt.",
  openGraph: {
    title: "StemmeBox — Anonym stemme-feedback for bedrifter",
    description:
      "La kundene dine gi ærlig tilbakemelding med stemmen. QR-kode → innspilling → AI-analyse. Helt anonymt.",
    url: "https://stemmebox.vercel.app",
    siteName: "StemmeBox",
    locale: "nb_NO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StemmeBox — Anonym stemme-feedback",
    description:
      "La kundene gi ærlig tilbakemelding med stemmen. Helt anonymt.",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nb">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
