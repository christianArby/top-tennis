// Tennisdagboken: poster skrivs av coachen (Claude) utifrån Christians berättelse;
// sajten är läsvyn.
//
// diary-post:  { date, type, racket?, feel?, did, felt?, coach_note?, updated_at }
// racket:      { name, status: 'i bruk' | 'hos strängaren',
//                stringings: [{ string, gauge, kg, date|null }] }  (äldst först)

import { el, formatDate, daysBetween, linkifyExercises } from './dom.js';

export const TYPES = {
  vuxentennis: { label: 'Vuxentennis', kind: 'tennis' },
  gruppspel: { label: 'Gruppspel', kind: 'match' },
  match: { label: 'Match', kind: 'match' },
  traningsmatch: { label: 'Träningsmatch', kind: 'match' },
  traningssession: { label: 'Träningssession', kind: 'tennis' },
  eget: { label: 'Eget spel', kind: 'tennis' },
  fys: { label: 'Fys', kind: 'fys' }
};

export function sortedEntries(entries) {
  return Object.entries(entries)
    .map(([id, e]) => ({ id, ...e }))
    .sort((a, b) => b.id.localeCompare(a.id));
}

// Strängningen som satt i racketen ett visst datum (senaste med datum ≤ dagen).
export function stringingAt(racket, isoDate) {
  if (!racket || !racket.stringings) return null;
  return racket.stringings
    .filter((s) => s.date && s.date <= isoDate)
    .sort((a, b) => a.date.localeCompare(b.date))
    .pop() || null;
}

export function stringingLabel(s) {
  return `${s.string} ${s.gauge} · ${s.kg} kg`;
}

function feelDots(feel) {
  if (feel == null) return null;
  return el('span', { class: 'feel', 'aria-label': `Känsla ${feel} av 5`, title: `Känsla ${feel}/5` },
    ...[1, 2, 3, 4, 5].map((n) => el('span', { class: n <= feel ? 'on' : '' })));
}

function racketChip(entry, rackets) {
  if (!entry.racket) return null;
  const racket = rackets[entry.racket];
  const s = stringingAt(racket, entry.date);
  const name = `Racket ${entry.racket.toUpperCase()}`;
  if (!s) return el('span', { class: 'chip racket' }, name);
  const age = daysBetween(s.date, entry.date);
  return el('span', { class: 'chip racket', title: `Strängad ${s.date}` },
    `${name} · ${stringingLabel(s)} · ${age === 0 ? 'nysträngad' : `${age} d`}`);
}

function entryCard(entry, rackets) {
  const type = TYPES[entry.type] || { label: entry.type || 'Pass', kind: 'tennis' };
  return el('article', { class: 'entry' },
    el('div', { class: 'entry-head' },
      el('span', { class: 'entry-date' }, formatDate(entry.date)),
      el('span', { class: `chip type ${type.kind}` }, type.label),
      feelDots(entry.feel)
    ),
    racketChip(entry, rackets),
    entry.did ? el('div', { class: 'entry-text' },
      el('span', { class: 'entry-label' }, 'Gjorde'), el('p', {}, linkifyExercises(entry.did))) : null,
    entry.felt
      ? el('div', { class: 'entry-text' }, el('span', { class: 'entry-label' }, 'Kändes'), el('p', {}, entry.felt))
      : el('p', { class: 'entry-pending' }, 'Väntar på din berättelse — berätta för coachen hur det gick.'),
    entry.coach_note ? el('p', { class: 'coach-note' }, el('b', {}, 'Coach: '), entry.coach_note) : null
  );
}

export function diaryView(entries, rackets) {
  const list = sortedEntries(entries);
  const frag = document.createDocumentFragment();
  if (!list.length) {
    frag.append(el('div', { class: 'trend-card' },
      el('p', { class: 'empty' }, 'Inga poster ännu. Berätta för coachen vad du spelade — så hamnar det här.')));
    return frag;
  }
  for (const entry of list) frag.append(entryCard(entry, rackets));
  return frag;
}

export function racketsCard(rackets, today) {
  const ids = Object.keys(rackets).sort();
  if (!ids.length) return null;
  return el('div', { class: 'trend-card' },
    el('h3', {}, 'Racketar'),
    el('p', { class: 'desc' }, 'Aktuell strängning och historik.'),
    ...ids.map((id) => {
      const r = rackets[id];
      const current = stringingAt(r, today);
      const upcoming = (r.stringings || []).filter((s) => !s.date || s.date > today);
      const history = (r.stringings || []).filter((s) => s.date && s.date <= today && s !== current).reverse();
      return el('div', { class: 'racket-item' },
        el('div', { class: 'racket-head' },
          el('b', {}, `${id.toUpperCase()} · ${r.name}`),
          r.status && r.status !== 'i bruk' ? el('span', { class: 'chip pending' }, r.status) : null),
        current
          ? el('p', {}, `${stringingLabel(current)} — strängad ${formatDate(current.date)}` +
            (daysBetween(current.date, today) === 0 ? ' (idag)' : ` (${daysBetween(current.date, today)} d sedan)`))
          : null,
        ...upcoming.map((s) => el('p', { class: 'upcoming' }, `På gång: ${stringingLabel(s)}`)),
        history.length
          ? el('p', { class: 'history' }, 'Tidigare: ' + history.map((s) => `${stringingLabel(s)} (${s.date})`).join(' · '))
          : null
      );
    })
  );
}
