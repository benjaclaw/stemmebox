"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ recordingId }: { recordingId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/recordings/${recordingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/dashboard/feedback");
      } else {
        alert("Kunne ikke slette tilbakemeldingen");
        setDeleting(false);
        setConfirming(false);
      }
    } catch {
      alert("Noe gikk galt");
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 disabled:opacity-50"
        >
          {deleting ? "Sletter..." : "Bekreft slett"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 border border-warm-300 text-warm-600 rounded-lg text-sm hover:bg-warm-50"
        >
          Avbryt
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="px-3 py-1.5 border border-red-200 text-red-500 rounded-lg text-sm hover:bg-red-50 transition"
    >
      Slett
    </button>
  );
}
