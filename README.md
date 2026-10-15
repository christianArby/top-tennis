# Tennisdagbok 🎾

Personlig tennisdagbok: vad jag spelade, med vilket racket och strängning, och hur
det kändes. Posterna skrivs av en Claude-coach utifrån min berättelse (se
`CLAUDE.md`); sajten är läsvyn och syncar mellan telefon och laptop.
Höstplanen (12-veckorsprogrammet 27 jul – 18 okt 2026) ligger kvar som arkiv.

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

- `js/app.js` — skal och flikar: Dagbok, Trender, Profil, Arkiv.
- `js/diary.js` — dagboksposter och racketar med strängningshistorik.
- `js/archive.js` + `js/plan.js` — Höstplanen i läsläge.
- `js/store.js` — all datalagring per kollektion; Firestore eller localStorage.
- `js/exercises.js` — övningslexikon (klickbara övningsnamn med popup).
- `coach/fs.mjs` — coachens CLI för att läsa/skriva Firestore med vanlig JSON.
- `firebase/firestore.rules` — regler för `diary`, `rackets` och `session_log`.
