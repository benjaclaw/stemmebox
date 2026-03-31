"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error, data } = await getSupabase().auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // If session exists, email confirmation is disabled — go straight to onboarding
    if (data.session) {
      router.push("/create-business");
      return;
    }

    // Email confirmation required — show success message
    setSuccess(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-warm-50">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-heading font-bold text-warm-900">
            Opprett konto
          </h1>
          <p className="text-warm-500 text-sm mt-1">
            Kom i gang med StemmeBox på under 2 minutter
          </p>
        </div>

        {success ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-warm-200 text-center">
            <div className="text-4xl mb-4">📧</div>
            <h2 className="text-lg font-heading font-semibold text-warm-900 mb-2">
              Sjekk e-posten din
            </h2>
            <p className="text-warm-500 text-sm mb-6">
              Vi har sendt en bekreftelseslenke til <strong>{email}</strong>. Klikk på lenken for å aktivere kontoen din.
            </p>
            <Link
              href="/login"
              className="text-teal-primary hover:underline font-medium text-sm"
            >
              Gå til innlogging
            </Link>
          </div>
        ) : (
        <>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-warm-200">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-warm-700 mb-1.5">
                E-post
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-warm-300 focus:outline-none focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition text-sm"
                placeholder="din@epost.no"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-warm-700 mb-1.5">
                Passord
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2.5 rounded-lg border border-warm-300 focus:outline-none focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition text-sm"
                placeholder="Minst 6 tegn"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-teal-primary text-white py-2.5 rounded-lg font-medium hover:bg-teal-dark transition disabled:opacity-50"
          >
            {loading ? "Oppretter konto..." : "Opprett konto"}
          </button>
        </form>

        <p className="text-center text-sm text-warm-500 mt-6">
          Har du allerede en konto?{" "}
          <Link href="/login" className="text-teal-primary hover:underline font-medium">
            Logg inn
          </Link>
        </p>
        </>
        )}
      </div>
      </main>
      <Footer />
    </div>
  );
}
