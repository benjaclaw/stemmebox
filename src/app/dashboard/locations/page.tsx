"use client";

import { useState, useCallback, useEffect } from "react";
import { generateQRCodeSVG, svgToDataUrl } from "@/lib/qr";
import { getSupabase } from "@/lib/supabase/client";

interface Location {
  id: string;
  name: string;
  slug: string;
  address: string | null;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);

  // Add modal
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [adding, setAdding] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadLocations();
  }, []);

  async function loadLocations() {
    setLoading(true);
    const supabase = getSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: member } = await supabase
      .from("members")
      .select("business_id")
      .eq("user_id", user.id)
      .single();

    if (!member) {
      setLoading(false);
      return;
    }

    setBusinessId(member.business_id);

    const { data } = await supabase
      .from("locations")
      .select("id, name, slug, address")
      .eq("business_id", member.business_id)
      .order("created_at", { ascending: true });

    setLocations(data ?? []);
    setLoading(false);
  }

  const getRecordUrl = useCallback((slug: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/r/${slug}`;
    }
    return `/r/${slug}`;
  }, []);

  function downloadQR(location: Location) {
    const url = getRecordUrl(location.slug);
    const svg = generateQRCodeSVG(url, 512);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);

      const link = document.createElement("a");
      link.download = `qr-${location.slug}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = svgToDataUrl(svg);
  }

  async function handleAdd() {
    if (!newName.trim() || !businessId) return;
    setAdding(true);

    try {
      const res = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          name: newName.trim(),
          address: newAddress.trim() || null,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const location = await res.json();
      setLocations((prev) => [...prev, location]);
      setShowAdd(false);
      setNewName("");
      setNewAddress("");
    } catch {
      alert("Kunne ikke opprette lokasjon");
    } finally {
      setAdding(false);
    }
  }

  async function handleEdit(id: string) {
    if (!editName.trim()) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/locations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });

      if (!res.ok) throw new Error("Failed");

      setLocations((prev) =>
        prev.map((l) => (l.id === id ? { ...l, name: editName.trim() } : l))
      );
      setEditingId(null);
    } catch {
      alert("Kunne ikke oppdatere lokasjon");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);

    try {
      const res = await fetch(`/api/locations/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed");

      setLocations((prev) => prev.filter((l) => l.id !== id));
      setConfirmDeleteId(null);
    } catch {
      alert("Kunne ikke slette lokasjon");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-teal-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-bold text-warm-900">
            Lokasjoner
          </h1>
          <p className="text-warm-500 text-sm mt-1">
            Administrer lokasjoner og QR-koder
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-teal-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-dark transition"
        >
          + Ny lokasjon
        </button>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-heading font-semibold text-warm-900 mb-4">
              Ny lokasjon
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1.5">
                  Navn
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-warm-300 focus:outline-none focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition text-sm"
                  placeholder="F.eks. Avdeling Sentrum"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1.5">
                  Adresse <span className="text-warm-400">(valgfritt)</span>
                </label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-warm-300 focus:outline-none focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition text-sm"
                  placeholder="F.eks. Storgata 1, Oslo"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAdd(false);
                  setNewName("");
                  setNewAddress("");
                }}
                className="flex-1 py-2.5 rounded-lg border border-warm-300 text-warm-600 hover:bg-warm-50 transition text-sm font-medium"
              >
                Avbryt
              </button>
              <button
                onClick={handleAdd}
                disabled={!newName.trim() || adding}
                className="flex-1 bg-teal-primary text-white py-2.5 rounded-lg font-medium hover:bg-teal-dark transition disabled:opacity-50 text-sm"
              >
                {adding ? "Oppretter..." : "Opprett"}
              </button>
            </div>
          </div>
        </div>
      )}

      {locations.length === 0 ? (
        <div className="bg-white rounded-xl border border-warm-200 p-6 text-center py-16">
          <p className="text-4xl mb-3">📍</p>
          <p className="text-warm-500 mb-4">Ingen lokasjoner ennå</p>
          <button
            onClick={() => setShowAdd(true)}
            className="text-teal-primary hover:underline text-sm font-medium"
          >
            Legg til din første lokasjon
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => {
            const url = getRecordUrl(location.slug);
            const svg = generateQRCodeSVG(url, 200);

            return (
              <div
                key={location.id}
                className="bg-white rounded-xl border border-warm-200 overflow-hidden"
              >
                <div className="p-6">
                  {editingId === location.id ? (
                    <div className="mb-4">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-warm-300 focus:outline-none focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition text-sm mb-2"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(location.id)}
                          disabled={saving}
                          className="text-sm text-teal-primary hover:underline font-medium"
                        >
                          {saving ? "Lagrer..." : "Lagre"}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-sm text-warm-500 hover:underline"
                        >
                          Avbryt
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-heading font-semibold text-warm-900">
                        {location.name}
                      </h3>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingId(location.id);
                            setEditName(location.name);
                          }}
                          className="text-warm-400 hover:text-warm-600 p-1"
                          title="Rediger"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        {confirmDeleteId === location.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(location.id)}
                              disabled={deletingId === location.id}
                              className="text-xs text-red-500 hover:underline font-medium"
                            >
                              {deletingId === location.id ? "..." : "Bekreft"}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs text-warm-400 hover:underline"
                            >
                              Nei
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(location.id)}
                            className="text-warm-400 hover:text-red-500 p-1"
                            title="Slett"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {location.address && (
                    <p className="text-xs text-warm-400 mb-1">{location.address}</p>
                  )}
                  <p className="text-sm text-warm-500 mb-4 break-all">
                    {url}
                  </p>

                  {/* QR Code */}
                  <div className="bg-warm-50 rounded-lg p-4 flex items-center justify-center mb-4">
                    <div
                      dangerouslySetInnerHTML={{ __html: svg }}
                      className="w-[160px] h-[160px]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadQR(location)}
                      className="flex-1 bg-teal-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-dark transition"
                    >
                      Last ned PNG
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(url)}
                      className="px-3 py-2 rounded-lg border border-warm-300 text-warm-600 hover:bg-warm-100 transition text-sm"
                    >
                      Kopier lenke
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
