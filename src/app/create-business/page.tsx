"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateBusinessPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [locationName, setLocationName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // TODO: Save to Supabase when connected
    // For now, redirect to dashboard
    console.log("Creating business:", { businessName, locationName });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🏢</div>
          <h1 className="text-2xl font-heading font-bold text-warm-900">
            Sett opp bedriften din
          </h1>
          <p className="text-warm-500 text-sm mt-1">
            Fortell oss litt om bedriften din for å komme i gang
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-8 shadow-sm border border-warm-200"
        >
          <div className="space-y-5">
            <div>
              <label
                htmlFor="businessName"
                className="block text-sm font-medium text-warm-700 mb-1.5"
              >
                Bedriftsnavn
              </label>
              <input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-warm-300 focus:outline-none focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition text-sm"
                placeholder="F.eks. Havfruen Restaurant"
              />
            </div>

            <div>
              <label
                htmlFor="locationName"
                className="block text-sm font-medium text-warm-700 mb-1.5"
              >
                Første lokasjon
              </label>
              <input
                id="locationName"
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-warm-300 focus:outline-none focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition text-sm"
                placeholder="F.eks. Karl Johans gate 12, Oslo"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-teal-primary text-white py-2.5 rounded-lg font-medium hover:bg-teal-dark transition disabled:opacity-50"
          >
            {loading ? "Oppretter..." : "Opprett bedrift"}
          </button>
        </form>
      </div>
    </div>
  );
}
