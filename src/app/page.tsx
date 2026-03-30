import Link from "next/link";

function MicrophoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="w-5 h-5 text-teal-primary"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const features = [
  {
    icon: "🔒",
    title: "Helt anonymt",
    description:
      "Ingen innlogging, ingen sporing. Kunden scanner QR-koden og snakker fritt — det er alt.",
  },
  {
    icon: "🤖",
    title: "AI-analyse",
    description:
      "Automatisk transkripsjon, sentimentanalyse og kategorisering av tilbakemeldinger.",
  },
  {
    icon: "📊",
    title: "Trender over tid",
    description:
      "Se hvordan mat, service og atmosfære scorer over uker og måneder.",
  },
  {
    icon: "📱",
    title: "QR-koder",
    description:
      "Generer unike QR-koder for hver lokasjon. Skriv ut og plasser på bordet.",
  },
];

const plans = [
  {
    name: "Free",
    price: "0",
    period: "for alltid",
    description: "Prøv StemmeBox helt gratis",
    features: [
      "5 meldinger per måned",
      "1 lokasjon",
      "Grunnleggende transkripsjon",
      "QR-kode",
    ],
    cta: "Kom i gang gratis",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "499",
    period: "per måned",
    description: "For restauranter som vil forstå kundene sine",
    features: [
      "Ubegrenset meldinger",
      "1 lokasjon",
      "AI-analyse og sentiment",
      "Trendrapporter",
      "Ukentlig oppsummering",
      "E-postvarsler",
    ],
    cta: "Start Pro",
    highlighted: true,
  },
  {
    name: "Business",
    price: "999",
    period: "per måned",
    description: "For kjeder og flere lokasjoner",
    features: [
      "Alt i Pro",
      "Opptil 10 lokasjoner",
      "Sammenlign lokasjoner",
      "Team-tilgang",
      "API-tilgang",
      "Prioritert support",
    ],
    cta: "Start Business",
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-warm-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MicrophoneIcon className="w-7 h-7 text-teal-primary" />
            <span className="text-xl font-heading font-bold text-warm-900">
              StemmeBox
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm text-warm-600">
            <a href="#features" className="hover:text-warm-900 transition">
              Funksjoner
            </a>
            <a href="#pricing" className="hover:text-warm-900 transition">
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

      {/* Hero */}
      <section className="py-20 sm:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-teal-primary/10 text-teal-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span>🎙️</span>
            <span>Stemme-feedback for norske restauranter</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-heading font-bold text-warm-900 leading-tight mb-6">
            Hør hva kundene
            <br />
            <span className="text-teal-primary">virkelig</span> mener
          </h1>
          <p className="text-lg sm:text-xl text-warm-500 max-w-2xl mx-auto mb-10">
            La gjestene gi ærlig tilbakemelding med stemmen — helt anonymt.
            AI-en vår analyserer, kategoriserer og viser deg trendene som betyr
            noe.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-teal-primary text-white px-8 py-3.5 rounded-xl text-lg font-medium hover:bg-teal-dark transition shadow-lg shadow-teal-primary/20"
            >
              Start gratis
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto text-warm-600 px-8 py-3.5 rounded-xl text-lg font-medium hover:bg-warm-100 transition"
            >
              Se hvordan det fungerer ↓
            </a>
          </div>
        </div>

        {/* Illustration */}
        <div className="max-w-3xl mx-auto mt-16">
          <div className="bg-warm-900 rounded-2xl p-8 sm:p-12 text-center shadow-2xl">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <p className="text-warm-400 text-sm mb-4">Trykk for å gi tilbakemelding</p>
            <div className="w-24 h-24 rounded-full bg-teal-primary/20 border-4 border-teal-primary flex items-center justify-center mx-auto mb-4 animate-pulse">
              <MicrophoneIcon className="w-10 h-10 text-teal-primary" />
            </div>
            <p className="text-warm-500 text-xs">Helt anonymt · Maks 60 sekunder</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-warm-900 mb-4">
              Alt du trenger for bedre tilbakemeldinger
            </h2>
            <p className="text-warm-500 text-lg max-w-2xl mx-auto">
              Fra QR-kode til innsikt — StemmeBox gjør hele prosessen enkel og
              anonym.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-warm-50 rounded-xl p-6 hover:shadow-md transition"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-heading font-semibold text-warm-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-warm-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-warm-900 mb-4">
              Så enkelt fungerer det
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: "Skriv ut QR-koden",
                desc: "Generer en unik QR-kode for hver lokasjon og plasser den på bordet.",
              },
              {
                step: "2",
                title: "Kunden snakker",
                desc: "Gjesten scanner koden og spiller inn en kort stemmemelding — helt anonymt.",
              },
              {
                step: "3",
                title: "Du får innsikt",
                desc: "AI-en transkriberer, analyserer og kategoriserer tilbakemeldingen automatisk.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-teal-primary text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-heading font-semibold text-warm-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-warm-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-warm-900 mb-4">
              Enkel og rettferdig prising
            </h2>
            <p className="text-warm-500 text-lg">
              Start gratis, oppgrader når du er klar.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 ${
                  plan.highlighted
                    ? "bg-warm-900 text-white ring-4 ring-teal-primary shadow-2xl scale-105"
                    : "bg-warm-50 text-warm-900"
                }`}
              >
                <h3 className="text-lg font-heading font-semibold mb-1">
                  {plan.name}
                </h3>
                <p
                  className={`text-sm mb-4 ${
                    plan.highlighted ? "text-warm-400" : "text-warm-500"
                  }`}
                >
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-heading font-bold">
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm ${
                      plan.highlighted ? "text-warm-400" : "text-warm-500"
                    }`}
                  >
                    kr/{plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5">
                        {plan.highlighted ? (
                          <svg
                            className="w-5 h-5 text-teal-light"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <CheckIcon />
                        )}
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block text-center py-3 rounded-xl font-medium transition ${
                    plan.highlighted
                      ? "bg-teal-primary text-white hover:bg-teal-light"
                      : "bg-warm-200 text-warm-800 hover:bg-warm-300"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
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
    </div>
  );
}
