# StemmeBox

Anonym stemme-feedback for norske restauranter og servicebedrifter.

## Konsept
Kunde skanner QR-kode → spiller inn 30-60 sek stemmemelding → AI transkriberer, analyserer sentiment og kategoriserer (mat, service, atmosfære, pris). Bedriftseier får dashboard med trender, ukentlig AI-oppsummering og varsler ved kritiske meldinger. Helt anonymt for kunden.

## Stack
- **Frontend:** Next.js 14 + shadcn/ui + Tailwind CSS
- **Backend:** Supabase (auth, postgres, storage for audio)
- **AI:** OpenAI Whisper (transkripsjon) + Gemini (sentiment/kategorisering)
- **Hosting:** Vercel
- **QR:** Dynamisk QR-kode per lokasjon

## Forretningsmodell
- Free: 5 meldinger/mnd
- Pro: 499 kr/mnd (ubegrenset + AI-innsikt)
- Business: 999 kr/mnd (flere lokasjoner + integrasjoner)

## Målgruppe
B2B SMB — restauranter, kafeer, frisører, treningssentre, hoteller i Norge.

## Datamodell
```
businesses (id, name, slug, org_number, created_at)
members (id, user_id, business_id, role [owner/admin/member])
locations (id, business_id, name, address, qr_code_url)
recordings (id, location_id, audio_url, transcript, duration_seconds, language, created_at)
analyses (id, recording_id, overall_sentiment, summary, created_at)
analysis_categories (id, analysis_id, category [food/service/atmosphere/price/other], sentiment, excerpt)
plans (id, business_id, plan_type [free/pro/business], status, stripe_subscription_id)
```

## Sider

### Offentlig (landing)
- / — Hero, features, pricing, CTA
- /privacy — Personvernserklæring
- /terms — Vilkår

### Kundesiden (QR-target)
- /r/[slug] — Innspillingsside per lokasjon (ingen innlogging)
  - Kort velkomst med bedriftsnavn
  - Record-knapp (hold inne eller toggle)
  - "Takk for tilbakemeldingen!" etter submit
  - Fullstendig anonym — ingen tracking

### Dashboard (innlogget bedrift)
- /dashboard — Oversikt med nøkkeltall
- /dashboard/feedback — Liste over alle meldinger med transkripsjon + sentiment
- /dashboard/feedback/[id] — Enkelt innspilling med detaljer
- /dashboard/trends — Grafer over sentiment per kategori over tid
- /dashboard/locations — Administrer lokasjoner + QR-koder
- /dashboard/settings — Bedriftsinfo, plan, team

## MVP-scope (v1)
1. Landing page med pricing
2. Auth (Supabase)
3. Business onboarding (opprett bedrift + første lokasjon)
4. QR-kode generering per lokasjon
5. Innspillingsside (/r/[slug]) med Web Audio API
6. Audio upload til Supabase Storage
7. Whisper transkripsjon + AI-analyse (sentiment + kategorier)
8. Dashboard: liste feedback, spill av/les transkripsjon, sentiment-badges
9. Enkel trendvisning (siste 30 dager)

## Design
- Farger: Teal/cyan (#0d9488) + warm gray + hvit
- Font: Space Grotesk (headings) + Inter (body)
- Stil: Clean, profesjonell, tillitsvekkende
- Innspillingsside: Minimalistisk, stor record-knapp, mørk bakgrunn

## Milepæler
### M1 — Fundament (dag 1-3)
Prosjekt-setup, auth, business CRUD, landing page

### M2 — Innspilling (dag 4-7)
QR-koder, innspillingsside, audio upload, playback

### M3 — AI-pipeline (dag 8-11)
Whisper transkripsjon, sentiment-analyse, kategorisering

### M4 — Dashboard (dag 12-17)
Feedback-liste, detaljer, trender, lokasjonsadmin

### M5 — Polish (dag 18-21)
Varsler, ukentlig oppsummering, responsive design, testing
