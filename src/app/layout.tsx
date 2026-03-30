import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StemmeBox — Anonym stemme-feedback for restauranter",
  description:
    "La kundene dine gi ærlig tilbakemelding med stemmen. QR-kode → innspilling → AI-analyse. Helt anonymt.",
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
