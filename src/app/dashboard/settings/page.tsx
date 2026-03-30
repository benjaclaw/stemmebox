export default function SettingsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-warm-900">
          Innstillinger
        </h1>
        <p className="text-warm-500 text-sm mt-1">
          Administrer bedriften din
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 border border-warm-200">
          <h2 className="text-lg font-heading font-semibold text-warm-900 mb-4">
            Bedriftsinformasjon
          </h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1.5">
                Bedriftsnavn
              </label>
              <input
                type="text"
                defaultValue="Min Restaurant"
                className="w-full px-4 py-2.5 rounded-lg border border-warm-300 focus:outline-none focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-warm-200">
          <h2 className="text-lg font-heading font-semibold text-warm-900 mb-4">
            Abonnement
          </h2>
          <div className="flex items-center gap-3">
            <span className="bg-warm-100 text-warm-700 px-3 py-1 rounded-full text-sm font-medium">
              Free
            </span>
            <span className="text-sm text-warm-500">
              5 meldinger per måned
            </span>
          </div>
          <button className="mt-4 text-sm text-teal-primary hover:underline font-medium">
            Oppgrader til Pro →
          </button>
        </div>
      </div>
    </div>
  );
}
