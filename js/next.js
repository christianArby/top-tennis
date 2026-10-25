// "Inför nästa träning/match"-kortet överst i dagboken.
//
// Kandidater:
//   - vuxenträningen varje torsdag kl 20 (genereras här)
//   - dokument i Firestore-kollektionen `upcoming`: gruppspelsmatcher som coachen
//     läser in från backhandsmash, och träningsmatcher/-sessioner som Christian
//     lägger till själv via kortet.
// Kortet visar den närmaste som inte redan har passerat (start + 2 h) och som inte
// redan har en dagbokspost samma dag.
//
// upcoming-dokument: { date, time, kind, opponent?, place?, note?, balls?,
//   racket?, racket_reason?, points?: [{src, title, detail}], source: 'coach'|'manual' }

import { el, formatDate, daysBetween } from './dom.js';
import { stringingAt, stringingLabel } from './diary.js';

export const WEEKLY_TRAINING = { weekday: 4, time: '20:00', kind: 'traning' };

export const KINDS = {
  match: { heading: 'Inför nästa match', label: 'Gruppspel' },
  traningsmatch: { heading: 'Inför nästa match', label: 'Träningsmatch' },
  traning: { heading: 'Inför nästa träning', label: 'Vuxenträning' },
  traningssession: { heading: 'Inför nästa träning', label: 'Träningssession' }
};

const isMatch = (kind) => kind === 'match' || kind === 'traningsmatch';

export const CHECKLIST = ['Powerade', 'Vatten', 'Corny/banan', 'Skor', 'Linser'];

// Ur Winning Ugly (Gilbert) och The Inner Game of Tennis (Gallwey), med egna ord.
const MATCH_POINTS = [
  { src: 'Gilbert', title: 'Plan A klar innan du går in',
    detail: 'Serve och forehand är vapnen. Varje kort boll: attack och fram till nät. Ha en plan B om det inte fungerar.' },
  { src: 'Gilbert', title: 'Scouta de första gamen',
    detail: 'Vilken sida är svagast? Rör han sig sämre framåt eller bakåt? Spela dina styrkor mot hans svagheter.' },
  { src: 'Gilbert', title: 'Ändra aldrig ett vinnande spel',
    detail: 'Leder du — fortsätt attackera. Börja inte spela säkert. Ändra bara när något slutar fungera.' },
  { src: 'Gilbert', title: 'Nyckelpoängen avgör',
    detail: 'På 30-30, breakbollar och i tiebreak: förstaserven i, inga gratispoäng — men håll fast vid planen.' },
  { src: 'Gallwey', title: 'Studs — slag',
    detail: 'Säg tyst "studs" när bollen studsar och "slag" när den träffas. Då får tankarna på resultatet ingen plats.' },
  { src: 'Gallwey', title: 'Nerver betyder att du bryr dig',
    detail: 'Du är taggad, inte rädd. Fokus på nästa boll — resultatet sköter sig självt.' }
];

const TRAINING_POINTS = [
  { src: 'Gilbert', title: 'Träna det du ska använda i match',
    detail: 'Attack på kort boll och fram till nät, serve+1 med bestämd riktning. Det är mönstren som vinner gruppspelet.' },
  { src: 'Gilbert', title: 'Spela poängen som om de räknas',
    detail: 'I spelövningar: tänk 30-30. Förstaserven i, en plan för poängen — öva på de lägen du tappat i tiebreak.' },
  { src: 'Gallwey', title: 'Lär med bilder',
    detail: 'Coila, ladda, slå av party-hatten, vänsterarmen in. En bild i taget — inte en checklista i huvudet.' },
  { src: 'Gallwey', title: 'Observera, döm inte',
    detail: 'Efter en miss: notera vad som hände ("sen", "lång") och släpp det. Kroppen rättar till resten.' },
  { src: 'Coach', title: 'När tröttheten kommer',
    detail: 'Sikta en meter över nät och håll vänsterhanden aktiv i forehanden. Märk när det händer — det är signalen att jobba vidare.' }
];

/* ---------- Tid ---------- */

function localISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function startOf(ev) {
  const [y, m, d] = ev.date.split('-').map(Number);
  const [hh, mm] = (ev.time || '12:00').split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm);
}

export function eventId(date, time) {
  return `${date}-${(time || '12:00').replace(':', '')}`;
}

function weeklyTrainings(now, weeks = 3) {
  const out = [];
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  for (let i = 0; i < weeks * 7; i++) {
    if (d.getDay() === WEEKLY_TRAINING.weekday) {
      const date = localISO(d);
      out.push({ id: eventId(date, WEEKLY_TRAINING.time), date, time: WEEKLY_TRAINING.time,
        kind: WEEKLY_TRAINING.kind, source: 'weekly' });
    }
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export function nextEvent(upcoming, diary, now = new Date()) {
  const planned = Object.entries(upcoming).map(([id, ev]) => ({ id, ...ev }));
  const plannedDates = new Set(planned.map((ev) => ev.date));
  const diaryDates = new Set(Object.values(diary).map((e) => e.date));
  // En egen post samma dag ersätter torsdagsträningen.
  const weekly = weeklyTrainings(now).filter((ev) => !plannedDates.has(ev.date));
  return [...planned, ...weekly]
    .filter((ev) => ev.date && KINDS[ev.kind])
    .filter((ev) => !diaryDates.has(ev.date))
    .filter((ev) => now < new Date(startOf(ev).getTime() + 2 * 3600 * 1000))
    .sort((a, b) => startOf(a) - startOf(b))[0] || null;
}

/* ---------- Rackval ---------- */

function racketStats(diary) {
  const stats = {};
  for (const e of Object.values(diary)) {
    if (!e.racket) continue;
    const s = stats[e.racket] || (stats[e.racket] = { count: 0, feelSum: 0, feelN: 0, last: '' });
    s.count++;
    if (typeof e.feel === 'number') { s.feelSum += e.feel; s.feelN++; }
    if (e.date > s.last) s.last = e.date;
  }
  return stats;
}

// Match: racketet du spelat mest med (tryggast). Träning: det som vilat längst,
// så båda strängningarna får speltid och kan jämföras.
export function recommendRacket(ev, rackets, diary) {
  if (ev.racket && rackets[ev.racket]) {
    return { id: ev.racket, reason: ev.racket_reason || 'Coachens val inför just den här matchen.' };
  }
  const usable = Object.keys(rackets).filter((id) => rackets[id].status !== 'hos strängaren').sort();
  if (!usable.length) return null;
  const stats = racketStats(diary);
  const st = (id) => stats[id] || { count: 0, feelSum: 0, feelN: 0, last: '' };
  const avg = (id) => (st(id).feelN ? st(id).feelSum / st(id).feelN : 0);

  if (isMatch(ev.kind)) {
    const id = [...usable].sort((a, b) => st(b).count - st(a).count || avg(b) - avg(a))[0];
    return { id, reason: st(id).count
      ? `Racketet du spelat mest med (${st(id).count} pass) — kör på det du vet fungerar.`
      : 'Det racket som är i bruk.' };
  }
  const id = [...usable].sort((a, b) => st(a).last.localeCompare(st(b).last))[0];
  return { id, reason: st(id).last
    ? `Vilat sedan ${formatDate(st(id).last)} — växla så båda strängningarna får speltid.`
    : 'Inte använt än — dags att prova det.' };
}

/* ---------- Checklista (per enhet, per tillfälle) ---------- */

const checkKey = (id) => `top-tennis:check:${id}`;

function readChecks(id) {
  try { return JSON.parse(localStorage.getItem(checkKey(id)) || '[]'); } catch { return []; }
}

function writeChecks(id, list) {
  try { localStorage.setItem(checkKey(id), JSON.stringify(list)); } catch { /* privat läge */ }
}

/* ---------- Kort ---------- */

function whenLine(ev) {
  const parts = [`${formatDate(ev.date)} kl ${ev.time}`, KINDS[ev.kind].label];
  if (ev.opponent) parts.push(`mot ${ev.opponent}`);
  if (ev.place) parts.push(ev.place);
  return parts.join(' · ');
}

function racketBox(rec, rackets, date) {
  if (!rec) return null;
  const r = rackets[rec.id];
  const s = stringingAt(r, date) || (r.stringings || []).slice(-1)[0];
  const age = s && s.date ? daysBetween(s.date, date) : null;
  return el('div', { class: 'next-racket' },
    el('span', { class: 'entry-label' }, 'Racket'),
    el('p', {}, el('b', {}, `${rec.id.toUpperCase()} · ${r.name}`),
      s ? ` — ${stringingLabel(s)}${age != null ? ` (${age} d)` : ''}` : ''),
    el('p', { class: 'why' }, rec.reason));
}

function checklist(ev) {
  const items = [...CHECKLIST, ...(ev.balls ? ['Bollar (du tar med)'] : [])];
  const done = new Set(readChecks(ev.id));
  const list = el('ul', { class: 'checklist' });
  for (const item of items) {
    const box = el('input', { type: 'checkbox', 'aria-label': item });
    box.checked = done.has(item);
    box.addEventListener('change', () => {
      box.checked ? done.add(item) : done.delete(item);
      writeChecks(ev.id, [...done]);
    });
    list.append(el('li', {}, el('label', {}, box, el('span', {}, item))));
  }
  return el('div', { class: 'next-check' }, el('span', { class: 'entry-label' }, 'Packa'), list);
}

function addForm(onAdd) {
  const form = el('form', { class: 'add-event', hidden: '' });
  const kind = el('select', { name: 'kind', 'aria-label': 'Typ' },
    el('option', { value: 'traningsmatch' }, 'Träningsmatch'),
    el('option', { value: 'traningssession' }, 'Träningssession'));
  const date = el('input', { type: 'date', name: 'date', required: '', 'aria-label': 'Datum' });
  date.value = localISO(new Date());
  const time = el('input', { type: 'time', name: 'time', required: '', value: '18:00', 'aria-label': 'Tid' });
  const opponent = el('input', { type: 'text', name: 'opponent', placeholder: 'Motståndare / med vem (valfritt)' });
  const note = el('input', { type: 'text', name: 'note', placeholder: 'Plats / notering (valfritt)' });
  form.append(kind, date, time, opponent, note, el('button', { type: 'submit' }, 'Spara'));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const doc = { date: date.value, time: time.value, kind: kind.value, source: 'manual' };
    if (opponent.value.trim()) doc.opponent = opponent.value.trim();
    if (note.value.trim()) doc.note = note.value.trim();
    onAdd(eventId(doc.date, doc.time), doc);
    form.hidden = true;
  });
  return form;
}

export function nextCard({ upcoming, diary, rackets }, { onAdd, onRemove }) {
  const ev = nextEvent(upcoming, diary);
  const form = addForm(onAdd);
  const addBtn = el('button', {
    type: 'button', class: 'link-btn',
    onclick: () => { form.hidden = !form.hidden; }
  }, '+ Träningsmatch eller träningssession');

  const card = el('section', { class: `trend-card next-card${ev && isMatch(ev.kind) ? ' match' : ''}` });
  if (!ev) {
    card.append(el('h3', {}, 'Inför nästa pass'), el('p', { class: 'desc' }, 'Inget inplanerat.'), addBtn, form);
    return card;
  }

  const points = ev.points && ev.points.length ? ev.points : (isMatch(ev.kind) ? MATCH_POINTS : TRAINING_POINTS);
  card.append(...[
    el('h3', {}, KINDS[ev.kind].heading),
    el('p', { class: 'desc' }, whenLine(ev)),
    ev.note ? el('p', { class: 'next-note' }, ev.note) : null,
    racketBox(recommendRacket(ev, rackets, diary), rackets, ev.date),
    checklist(ev),
    el('div', { class: 'next-points' },
      el('span', { class: 'entry-label' }, 'Tänk på'),
      ...points.map((pt) => el('div', { class: 'focus-item' },
        el('b', {}, pt.title, el('span', { class: `src ${pt.src.toLowerCase()}` }, pt.src)),
        el('p', {}, pt.detail)))),
    el('div', { class: 'next-actions' },
      addBtn,
      ev.source === 'manual'
        ? el('button', { type: 'button', class: 'link-btn danger', onclick: () => onRemove(ev.id) }, 'Ta bort')
        : null),
    form
  ].filter(Boolean));
  return card;
}
