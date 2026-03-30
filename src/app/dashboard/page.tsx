export default function DashboardOverview() {
  const stats = [
    { label: "Totalt meldinger", value: "0", icon: "🎙️" },
    { label: "Denne uken", value: "0", icon: "📅" },
    { label: "Gjennomsnitt sentiment", value: "—", icon: "😊" },
    { label: "Lokasjoner", value: "1", icon: "📍" },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-warm-900">
          Oversikt
        </h1>
        <p className="text-warm-500 text-sm mt-1">
          Velkommen til StemmeBox-dashboardet ditt
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-5 border border-warm-200"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="text-2xl font-heading font-bold text-warm-900">
              {stat.value}
            </p>
            <p className="text-sm text-warm-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 border border-warm-200">
        <h2 className="text-lg font-heading font-semibold text-warm-900 mb-4">
          Siste tilbakemeldinger
        </h2>
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🎙️</p>
          <p className="text-warm-500">
            Ingen tilbakemeldinger ennå. Del QR-koden din med kundene for å
            komme i gang!
          </p>
        </div>
      </div>
    </div>
  );
}
