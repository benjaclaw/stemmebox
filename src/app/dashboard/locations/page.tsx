"use client";

import { useState, useCallback } from "react";
import { generateQRCodeSVG, svgToDataUrl } from "@/lib/qr";

interface Location {
  id: string;
  name: string;
  slug: string;
}

const DEMO_LOCATIONS: Location[] = [
  {
    id: "1",
    name: "Hovedlokasjon",
    slug: "demo-restaurant",
  },
];

export default function LocationsPage() {
  const [locations] = useState<Location[]>(DEMO_LOCATIONS);

  const getRecordUrl = useCallback((slug: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/r/${slug}`;
    }
    return `/r/${slug}`;
  }, []);

  function downloadQR(location: Location) {
    const url = getRecordUrl(location.slug);
    const svg = generateQRCodeSVG(url, 512);

    // Convert SVG to canvas then PNG
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
        <button className="bg-teal-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-dark transition">
          + Ny lokasjon
        </button>
      </div>

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
                <h3 className="font-heading font-semibold text-warm-900 mb-1">
                  {location.name}
                </h3>
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
    </div>
  );
}
