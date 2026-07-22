# Höstplan · Tennis 12 veckor 🎾

Personlig träningslogg för ett 12-veckors tennis-/fysprogram (start 27 juli 2026).
Loggar pass, RPE, serve-% och `shoulder_feel`, visar trender och syncar mellan telefon och laptop.

## Stack

Samma mönster som [skippo-pingis-tour](https://github.com/christianArby/skippo-pingis-tour):
ingen bundler, ingen build — bara push och kör.

- Vanilla JS (ES-moduler) + HTML/CSS, hostas på GitHub Pages direkt från `main`.
- Supabase (Postgres) för sync; `@supabase/supabase-js` laddas från esm.sh.
  Utan config i `index.html` faller appen tillbaka på localStorage.
- uPlot från CDN för trendgrafer.

## Setup

1. GitHub → Settings → Pages → Deploy from a branch → `main` / root.
2. Skapa ett Supabase-projekt, kör `supabase/schema.sql` i SQL-editorn.
3. Fyll i `window.SUPABASE_CONFIG` (url + anon key) i `index.html`.

## Struktur

- `js/plan.js` — hela 12-veckorsplanen som statisk seed-data (3 faser × 4 pass/vecka).
- `js/store.js` — all datalagring; väljer Supabase eller localStorage.
- `js/app.js` — vyer: plan (avbockning + metrics-formulär) och trender.
- `supabase/schema.sql` — tabellen `session_log` + RLS + realtime.
