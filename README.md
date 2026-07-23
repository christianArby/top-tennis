# Höstplan · Tennis 12 veckor 🎾

Personlig träningslogg för ett 12-veckors tennis-/fysprogram (start 27 juli 2026).
Loggar pass, RPE, serve-% och `shoulder_feel`, visar trender och syncar mellan telefon och laptop.

## Stack

Samma mönster som [skippo-pingis-tour](https://github.com/christianArby/skippo-pingis-tour):
ingen bundler, ingen build — bara push och kör.

- Vanilla JS (ES-moduler) + HTML/CSS, hostas på GitHub Pages direkt från `main`.
- Firebase Firestore för sync (gratis Spark-nivå räcker gott); SDK:n laddas
  från gstatic-CDN. Utan config i `index.html` faller appen tillbaka på localStorage.
- uPlot från CDN för trendgrafer.

## Setup

1. GitHub → Settings → Pages → Deploy from a branch → `main` / root.
2. Skapa ett Firebase-projekt → Firestore Database → klistra in `firebase/firestore.rules` under Rules.
3. Registrera en webbapp i projektet och fyll i `window.FIREBASE_CONFIG` i `index.html`.

## Struktur

- `js/plan.js` — hela 12-veckorsplanen som statisk seed-data (3 faser × 4 pass/vecka).
- `js/store.js` — all datalagring; väljer Firestore eller localStorage.
- `js/app.js` — vyer: plan (avbockning + metrics-formulär) och trender.
- `firebase/firestore.rules` — regler för kollektionen `session_log` (dokument-id `vecka:slot`).
