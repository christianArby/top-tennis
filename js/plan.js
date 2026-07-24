// Hela 12-veckorsplanen som statisk seed-data.
// Vecka 1 börjar måndag 27 juli 2026; loggarna ligger i Supabase (js/store.js).

export const START_DATE = new Date(2026, 6, 27);
export const TOTAL_WEEKS = 12;
export const SLOTS_PER_WEEK = 4;

export const RHYTHM_RULE =
  'Rytm: minst en vilodag mellan Fys 1 och Fys 2, och lägg inte Tennis 1 (serve) samma dygn som Fys 1 — axeln behöver luft mellan belastningarna.';

export const PHASES = [
  { phase: 'grund', name: 'Grund', weeks: [1, 2, 3, 4],
    goal: 'Bygg vana, groova serven, rampa axelvolym' },
  { phase: 'kraft', name: 'Kraft', weeks: [5, 6, 7, 8],
    goal: 'Mer kraft, plyo, höj serveintensiteten' },
  { phase: 'matchform', name: 'Matchform', weeks: [9, 10, 11, 12],
    goal: 'Mer matchspel, behåll styrkan' }
];

export const SESSIONS_PER_PHASE = {
  grund: [
    { slot: 0, kind: 'fys', label: 'Fys 1', title: 'Styrka & stabilitet',
      planned_detail: 'Uppv: hopprep 3 min + 2x15 bandutåtrotation. Bulgarian split squat 3x8/ben, pull-ups/negativa 3xmax, pike push-ups 3x8, sidoplanka 3x30s, bandutåtrotation 3x15. Under maxen — groova rörelsen.' },
    { slot: 1, kind: 'tennis', label: 'Tennis 1', title: 'Serve & volleygrund',
      planned_detail: '20 min servekorg: rytm + placering (ut/kropp/T), inte kraft. 15 min volleygrund vid nät (partner matar eller vägg) — korta grepp, möt bollen framför kroppen. Avsluta med poängspel: bestäm före varje serve var serve+1-forehanden ska.' },
    { slot: 2, kind: 'fys', label: 'Fys 2', title: 'Kraft & kondition',
      planned_detail: 'Medbollslam 4x5, rotationskast mot vägg 4x6/sida, knäböjshopp 4x5, utfallssteg 3x10/ben, intervaller 6x(20s/40s), hollow hold 3x30s.' },
    { slot: 3, kind: 'tennis', label: 'Tennis 2', title: 'Nätattack & match',
      planned_detail: 'Drill: partnern spelar kort boll → forehand-attack → följ till nät → avsluta med volley (20 upprepningar). Backhand: 20 bollar cross där du DRIVER — slice är förbjuden i drillen. Matchspel med regel: minst en nätattack per game. Logga antal nätattacker.' }
  ],
  kraft: [
    { slot: 0, kind: 'fys', label: 'Fys 1', title: 'Styrka & stabilitet +',
      planned_detail: 'Bulgarian split squat 4x8/ben (håll medboll), pull-ups 4xmax, deficit/pike push-ups 4x8, sidoplanka m. höftlyft 3x12/sida, Pallof + bandutåtrotation 3x12.' },
    { slot: 1, kind: 'tennis', label: 'Tennis 1', title: 'Serve + overhead',
      planned_detail: '25 min serve: bygg kraft, träffa ut/kropp/T medvetet. 10 min overhead: partnern lobbar, börja nära nät och backa gradvis — samma avslappnade arm som i serven. Poängspel där du vinner på serven.' },
    { slot: 2, kind: 'fys', label: 'Fys 2', title: 'Kraft & kondition +',
      planned_detail: 'Medbollslam 5x5, rotationskast 5x6/sida, box-/knäböjshopp 5x5, utfallshopp 4x8/ben, intervaller 8x(20/40), hollow hold 3x40s.' },
    { slot: 3, kind: 'tennis', label: 'Tennis 2', title: 'Taktik & tempovariation',
      planned_detail: 'Spela poäng med en bestämd plan per game (t.ex. serve ut + attack i öppen bana). Variera höjd, skruv och tempo — ge inte motståndaren gratis fart att låna. Nätattack på varje kort boll. Split-step före varje motståndarslag.' }
  ],
  matchform: [
    { slot: 0, kind: 'fys', label: 'Fys 1', title: 'Styrka – underhåll',
      planned_detail: 'Bulgarian split squat 3x10/ben, pull-ups 3xmax, push-ups 3x12, sidoplanka 3x40s, bandutåtrotation 3x15. Håll kvaliteten, jaga inte utmattning.' },
    { slot: 1, kind: 'tennis', label: 'Tennis 1', title: 'Serve under press',
      planned_detail: '15 min serve-underhåll, sedan set med serven under press — hög andraservprocent i poäng som räknas.' },
    { slot: 2, kind: 'fys', label: 'Fys 2', title: 'Kraft – underhåll',
      planned_detail: 'Medbollslam 4x5, rotationskast 4x6/sida, knäböjshopp 4x5, intervaller 6x(20/40), hollow hold 3x30s. Håll dig fräsch.' },
    { slot: 3, kind: 'tennis', label: 'Tennis 2', title: 'Set med matchplan',
      planned_detail: 'Skriv en matchplan på tre punkter INNAN passet (t.ex. attackera kort boll till nät, driva backhanden, variera tempot). Spela hela set — gärna gruppspelsmatch. Tävlingslika situationer: 30-40, tie-break, serva för matchen. Utvärdera efteråt: följde du planen?' }
  ]
};

// Metrics-fält per pass-slot. Allt är valfritt — logga det du orkar.
// type: 'number' | 'text' | 'bool'; min/max används för validering och hints.
export const METRIC_FIELDS = {
  1: [ // Tennis 1 – serve
    { key: 'first_serve_pct', label: 'Förstaserve %', type: 'number', min: 0, max: 100 },
    { key: 'second_serve_pct', label: 'Andraserve %', type: 'number', min: 0, max: 100 },
    { key: 'serves_hit', label: 'Antal servar', type: 'number', min: 0, max: 500 },
    { key: 'shoulder_feel', label: 'Axelkänsla (1–5)', type: 'number', min: 1, max: 5 }
  ],
  3: [ // Tennis 2 – match/taktik
    { key: 'sets_played', label: 'Antal set', type: 'number', min: 0, max: 10 },
    { key: 'result', label: 'Resultat', type: 'text' },
    { key: 'net_attacks', label: 'Nätattacker', type: 'number', min: 0, max: 200 },
    { key: 'movement_feel', label: 'Rörelsekänsla (1–5)', type: 'number', min: 1, max: 5 }
  ],
  0: [ // Fys 1
    { key: 'top_set_reps', label: 'Reps toppset', type: 'number', min: 0, max: 100 },
    { key: 'felt_hard', label: 'Kändes tungt', type: 'bool' }
  ],
  2: [ // Fys 2
    { key: 'top_set_reps', label: 'Reps toppset', type: 'number', min: 0, max: 100 },
    { key: 'felt_hard', label: 'Kändes tungt', type: 'bool' }
  ]
};

export function phaseForWeek(week) {
  return PHASES.find((p) => p.weeks.includes(week));
}

export function sessionsForWeek(week) {
  return SESSIONS_PER_PHASE[phaseForWeek(week).phase];
}

export function weekStart(week) {
  const d = new Date(START_DATE);
  d.setDate(d.getDate() + (week - 1) * 7);
  return d;
}

export function weekEnd(week) {
  const d = weekStart(week);
  d.setDate(d.getDate() + 6);
  return d;
}

const FMT = new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'short' });

export function weekDateLabel(week) {
  return `${FMT.format(weekStart(week))} – ${FMT.format(weekEnd(week))}`;
}

// Aktuell vecka (1–12), klampad: före start → 1, efter slut → 12.
export function currentWeek(today = new Date()) {
  const days = Math.floor((today - weekStart(1)) / 86400000);
  return Math.min(TOTAL_WEEKS, Math.max(1, Math.floor(days / 7) + 1));
}
