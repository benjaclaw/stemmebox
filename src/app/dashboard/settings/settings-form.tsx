"use client";

import { useState } from "react";

export default function SettingsForm({
  businessId,
  initialName,
}: {
  businessId: string;
  initialName: string;
}) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!businessId || !name.trim()) return;

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/business", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, name: name.trim() }),
      });

      if (!res.ok) throw new Error("Failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Kunne ikke lagre endringene");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium text-warm-700 mb-1.5">
          Bedriftsnavn
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-warm-300 focus:outline-none focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition text-sm"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-teal-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-dark transition disabled:opacity-50"
        >
          {saving ? "Lagrer..." : "Lagre endringer"}
        </button>
        {saved && (
          <span className="text-green-600 text-sm">Lagret!</span>
        )}
        {error && <span className="text-red-500 text-sm">{error}</span>}
      </div>
    </form>
  );
}
