"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";

type RecordingState = "idle" | "recording" | "preview" | "submitting" | "done";

export default function RecordPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [state, setState] = useState<RecordingState>("idle");
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const MAX_DURATION = 60;

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopRecording();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [stopRecording, audioUrl]);

  async function startRecording() {
    try {
      setError(null);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setState("preview");
      };

      mediaRecorder.start();
      setState("recording");
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= MAX_DURATION - 1) {
            stopRecording();
            return MAX_DURATION;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      setError("Kunne ikke starte mikrofonen. Gi nettleseren tilgang til mikrofonen din.");
    }
  }

  function handleToggleRecording() {
    if (state === "recording") {
      stopRecording();
    } else {
      startRecording();
    }
  }

  function handleDiscard() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setDuration(0);
    setState("idle");
  }

  async function handleSubmit() {
    setState("submitting");
    // TODO: Upload to Supabase Storage
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setState("done");
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  // Decode slug for display
  const businessName = decodeURIComponent(slug)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  if (state === "done") {
    return (
      <div className="min-h-screen bg-warm-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-6">🙏</div>
          <h1 className="text-3xl font-heading font-bold text-white mb-3">
            Takk for tilbakemeldingen!
          </h1>
          <p className="text-warm-400 text-lg">
            Din stemme hjelper oss å bli bedre.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-900 flex flex-col items-center justify-center px-4">
      {/* Business name */}
      <div className="text-center mb-12">
        <p className="text-warm-500 text-sm mb-1">Gi tilbakemelding til</p>
        <h1 className="text-2xl font-heading font-bold text-white">
          {businessName}
        </h1>
      </div>

      {/* Record button */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Pulsing ring when recording */}
        {state === "recording" && (
          <>
            <div className="absolute w-44 h-44 rounded-full bg-teal-primary/10 animate-ping" />
            <div className="absolute w-36 h-36 rounded-full bg-teal-primary/20 animate-pulse" />
          </>
        )}

        {state === "idle" || state === "recording" ? (
          <button
            onClick={handleToggleRecording}
            className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all ${
              state === "recording"
                ? "bg-red-500 hover:bg-red-600 scale-110"
                : "bg-teal-primary hover:bg-teal-light hover:scale-105"
            }`}
          >
            {state === "recording" ? (
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg
                className="w-12 h-12 text-white"
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
            )}
          </button>
        ) : null}
      </div>

      {/* Timer */}
      {(state === "recording" || state === "preview") && (
        <div className="text-center mb-6">
          <p className="text-3xl font-heading font-bold text-white tabular-nums">
            {formatTime(duration)}
          </p>
          {state === "recording" && (
            <p className="text-warm-500 text-sm mt-1">
              Maks {MAX_DURATION} sekunder
            </p>
          )}
        </div>
      )}

      {/* Preview */}
      {state === "preview" && audioUrl && (
        <div className="w-full max-w-sm space-y-4">
          <audio src={audioUrl} controls className="w-full" />
          <div className="flex gap-3">
            <button
              onClick={handleDiscard}
              className="flex-1 py-3 rounded-xl border border-warm-600 text-warm-400 hover:bg-warm-800 transition font-medium text-sm"
            >
              Prøv igjen
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 rounded-xl bg-teal-primary text-white hover:bg-teal-light transition font-medium text-sm"
            >
              Send inn
            </button>
          </div>
        </div>
      )}

      {/* Submitting */}
      {state === "submitting" && (
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-warm-400 text-sm">Sender tilbakemelding...</p>
        </div>
      )}

      {/* Idle hint */}
      {state === "idle" && (
        <p className="text-warm-500 text-sm text-center">
          Trykk på knappen for å starte innspilling
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-lg max-w-sm text-center">
          {error}
        </div>
      )}

      {/* Footer */}
      <div className="absolute bottom-6 text-center">
        <p className="text-warm-600 text-xs">
          Helt anonymt · Ingen sporing · Drevet av StemmeBox
        </p>
      </div>
    </div>
  );
}
