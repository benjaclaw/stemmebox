"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase/client";
import { generateQRCodeSVG, svgToDataUrl } from "@/lib/qr";

const INDUSTRIES = [
  { value: "restaurant", label: "Restaurant" },
  { value: "cafe", label: "Kafé" },
  { value: "hairdresser", label: "Frisør" },
  { value: "gym", label: "Treningssenter" },
  { value: "hotel", label: "Hotell" },
  { value: "other", label: "Annet" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[æ]/g, "ae")
    .replace(/[ø]/g, "o")
    .replace(/[å]/g, "a")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default function CreateBusinessPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");

  // Step 2
  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");

  // Step 3 — result
  const [locationSlug, setLocationSlug] = useState("");

  async function handleStep1() {
    if (!businessName.trim() || !industry) return;
    setStep(2);
  }

  async function handleStep2() {
    if (!locationName.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabase();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Du må være logget inn. Prøv å logge inn på nytt.");
        setLoading(false);
        return;
      }

      // Generate unique slug
      const baseSlug = slugify(businessName);
      let slug = baseSlug;
      let attempt = 0;

      while (true) {
        const { data: existing } = await supabase
          .from("businesses")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();

        if (!existing) break;
        attempt++;
        slug = `${baseSlug}-${attempt}`;
      }

      // Create business
      const { data: business, error: bizError } = await supabase
        .from("businesses")
        .insert({ name: businessName.trim(), slug })
        .select("id")
        .single();

      if (bizError) throw bizError;

      // Create membership
      const { error: memberError } = await supabase.from("members").insert({
        user_id: user.id,
        business_id: business.id,
        role: "owner",
      });

      if (memberError) throw memberError;

      // Create free plan
      const { error: planError } = await supabase.from("plans").insert({
        business_id: business.id,
        plan_type: "free",
        status: "active",
      });

      if (planError) throw planError;

      // Create location with slug
      const locSlug = slugify(`${businessName}-${locationName}`);
      let finalLocSlug = locSlug;
      let locAttempt = 0;

      while (true) {
        const { data: existing } = await supabase
          .from("locations")
          .select("id")
          .eq("slug", finalLocSlug)
          .maybeSingle();

        if (!existing) break;
        locAttempt++;
        finalLocSlug = `${locSlug}-${locAttempt}`;
      }

      const { error: locError } = await supabase.from("locations").insert({
        business_id: business.id,
        name: locationName.trim(),
        address: locationAddress.trim() || null,
        slug: finalLocSlug,
      });

      if (locError) throw locError;

      setLocationSlug(finalLocSlug);
      setStep(3);
    } catch (err) {
      console.error("Create business error:", err);
      setError("Noe gikk galt. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  }

  function getRecordUrl() {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/r/${locationSlug}`;
    }
    return `/r/${locationSlug}`;
  }

  function downloadQR() {
    const url = getRecordUrl();
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
      link.download = `qr-${locationSlug}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = svgToDataUrl(svg);
  }

  const steps = [
    { num: 1, label: "Bedrift" },
    { num: 2, label: "Lokasjon" },
    { num: 3, label: "Ferdig" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50 px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step > s.num
                      ? "bg-teal-primary text-white"
                      : step === s.num
                        ? "bg-teal-primary text-white ring-4 ring-teal-primary/20"
                        : "bg-warm-200 text-warm-500"
                  }`}
                >
                  {step > s.num ? (
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    s.num
                  )}
                </div>
                <span
                  className={`text-xs mt-1.5 font-medium ${
                    step >= s.num ? "text-teal-primary" : "text-warm-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 transition-all ${
                    step > s.num ? "bg-teal-primary" : "bg-warm-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Business info */}
        {step === 1 && (
          <div className="animate-in fade-in">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-heading font-bold text-warm-900">
                Fortell oss om bedriften din
              </h1>
              <p className="text-warm-500 text-sm mt-1">
                Vi trenger bare litt info for å komme i gang
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-warm-200">
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
                    className="w-full px-4 py-2.5 rounded-lg border border-warm-300 focus:outline-none focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition text-sm"
                    placeholder="F.eks. Havfruen Restaurant"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-1.5">
                    Bransje
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {INDUSTRIES.map((ind) => (
                      <button
                        key={ind.value}
                        type="button"
                        onClick={() => setIndustry(ind.value)}
                        className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition ${
                          industry === ind.value
                            ? "border-teal-primary bg-teal-primary/10 text-teal-primary"
                            : "border-warm-200 text-warm-600 hover:border-warm-300 hover:bg-warm-50"
                        }`}
                      >
                        {ind.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleStep1}
                disabled={!businessName.trim() || !industry}
                className="w-full mt-6 bg-teal-primary text-white py-2.5 rounded-lg font-medium hover:bg-teal-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Neste
              </button>
            </div>
          </div>
        )}

        {/* Step 2: First location */}
        {step === 2 && (
          <div className="animate-in fade-in">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-heading font-bold text-warm-900">
                Legg til din første lokasjon
              </h1>
              <p className="text-warm-500 text-sm mt-1">
                Kunder vil scanne QR-koden på denne lokasjonen
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-warm-200">
              {error && (
                <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="locationName"
                    className="block text-sm font-medium text-warm-700 mb-1.5"
                  >
                    Navn på lokasjon
                  </label>
                  <input
                    id="locationName"
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-warm-300 focus:outline-none focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition text-sm"
                    placeholder="F.eks. Hovedrestauranten"
                    autoFocus
                  />
                </div>

                <div>
                  <label
                    htmlFor="locationAddress"
                    className="block text-sm font-medium text-warm-700 mb-1.5"
                  >
                    Adresse <span className="text-warm-400">(valgfritt)</span>
                  </label>
                  <input
                    id="locationAddress"
                    type="text"
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-warm-300 focus:outline-none focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition text-sm"
                    placeholder="F.eks. Karl Johans gate 12, Oslo"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2.5 rounded-lg border border-warm-300 text-warm-600 hover:bg-warm-50 transition text-sm font-medium"
                >
                  Tilbake
                </button>
                <button
                  onClick={handleStep2}
                  disabled={!locationName.trim() || loading}
                  className="flex-1 bg-teal-primary text-white py-2.5 rounded-lg font-medium hover:bg-teal-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Oppretter...
                    </span>
                  ) : (
                    "Opprett bedrift"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="animate-in fade-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-2xl font-heading font-bold text-warm-900">
                Alt er klart!
              </h1>
              <p className="text-warm-500 text-sm mt-1">
                {businessName} er opprettet. Her er QR-koden din.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-warm-200">
              {/* QR Code */}
              <div className="bg-warm-50 rounded-xl p-6 flex items-center justify-center mb-6">
                <div
                  dangerouslySetInnerHTML={{
                    __html: generateQRCodeSVG(getRecordUrl(), 200),
                  }}
                  className="w-[200px] h-[200px]"
                />
              </div>

              <p className="text-center text-sm text-warm-500 mb-2">
                Skriv ut denne QR-koden og plasser den på bordet
              </p>
              <p className="text-center text-xs text-warm-400 mb-6 break-all">
                {getRecordUrl()}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={downloadQR}
                  className="flex-1 bg-warm-900 text-white py-2.5 rounded-lg font-medium hover:bg-warm-800 transition text-sm"
                >
                  Last ned QR-kode
                </button>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="flex-1 bg-teal-primary text-white py-2.5 rounded-lg font-medium hover:bg-teal-dark transition text-sm"
                >
                  Gå til dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
