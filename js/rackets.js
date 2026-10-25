// Strängspänning och rackrotation.
//
// Modellen är en uppskattning för polyester (Head Lynx Tour), inte en mätning:
// ~10–18 % tapp första dygnet, strängen är "död" efter ~15–20 timmars spel, och
// flitiga spelare stränger om var 4–8 vecka. Timmar räknas ur dagboken.
//
// Rotation: matcher får racketet med fräschast strängning; träning spelar slut
// det äldre. Då åldras de i otakt och det finns alltid ett med bra spänning.

import { el, formatDate, daysBetween, todayISO } from './dom.js';
import { stringingAt, stringingLabel } from './diary.js';

export const STRING_MODEL = {
  firstDayLoss: 0.12,   // andel av strängad spänning, första dygnet
  lossPerHour: 0.004,   // per speltimme därefter
  lossPerDay: 0.001,    // per dag som racketet ligger
  lifeHours: 18,        // speltimmar innan omsträngning
  lifeDays: 56          // eller 8 veckor, det som kommer först
};

const SESSION_HOURS = { vuxentennis: 1.5, gruppspel: 1, match: 1.5, traningsmatch: 1.5, traningssession: 1.5, eget: 1.5, fys: 0 };
const TYPICAL_SESSION = 1.5;

export const isMatchKind = (kind) => kind === 'match' || kind === 'traningsmatch';

export function stringState(id, racket, diary, today = todayISO()) {
  const pending = (racket.stringings || []).find((s) => !s.date) || null;
  const s = stringingAt(racket, today);
  const away = racket.status === 'hos strängaren';
  if (!s) return { id, racket, stringing: null, pending, away };

  const m = STRING_MODEL;
  const days = Math.max(0, daysBetween(s.date, today));
  const sessions = Object.values(diary)
    .filter((e) => e.racket === id && e.date >= s.date && e.date <= today);
  const hours = sessions.reduce((h, e) => h + (SESSION_HOURS[e.type] ?? TYPICAL_SESSION), 0);
  const settled = days >= 1 || hours > 0;
  const loss = (settled ? m.firstDayLoss : 0) + m.lossPerHour * hours + m.lossPerDay * days;
  const used = Math.max(hours / m.lifeHours, days / m.lifeDays);
  return {
    id, racket, stringing: s, pending, away,
    days, hours, sessions: sessions.length,
    kgNow: Math.round(s.kg * (1 - loss) * 10) / 10,
    used,
    sessionsLeft: Math.max(0, Math.floor((m.lifeHours - hours) / TYPICAL_SESSION)),
    daysLeft: Math.max(0, m.lifeDays - days),
    dead: used >= 1
  };
}

export function allStates(rackets, diary, today = todayISO()) {
  return Object.keys(rackets).sort().map((id) => stringState(id, rackets[id], diary, today));
}

const name = (st) => `racket ${st.id.toUpperCase()}`;

// { id, reason, warning?, state } eller null om inget racket är spelbart.
export function chooseRacket(kind, rackets, diary, today = todayISO()) {
  const states = allStates(rackets, diary, today);
  const playable = states.filter((st) => st.stringing && !st.away);
  if (!playable.length) return null;

  const alive = playable.filter((st) => !st.dead);
  const pool = alive.length ? alive : playable;
  const byFresh = [...pool].sort((a, b) => a.used - b.used);
  const only = pool.length === 1;
  const pick = isMatchKind(kind) ? byFresh[0] : byFresh[byFresh.length - 1];
  const other = pool.find((st) => st !== pick);

  let reason;
  if (only) {
    reason = 'Det enda racketet med spelbar strängning just nu.';
  } else if (isMatchKind(kind)) {
    reason = `Fräschast strängning (≈ ${fmtKg(pick.kgNow)} kg) — matcher får bästa spänningen.`;
  } else {
    reason = `Spela slut den äldre strängningen på träning, så är ${name(other)} fräscht till match.`;
  }

  let warning = null;
  const dead = states.filter((st) => st.dead && !st.away);
  if (dead.length) {
    warning = `${cap(name(dead[0]))} är utspelat — lämna in det för omsträngning.`;
  } else if (pick.used >= 0.8) {
    warning = `${cap(name(pick))} har ≈ ${pick.sessionsLeft} pass kvar innan det behöver strängas om.`;
  } else if (pool.length > 1 && byFresh[0].used >= 0.6) {
    warning = `Båda strängningarna åldras samtidigt — stränga om ${name(byFresh[byFresh.length - 1])} snart, så du alltid har ett fräscht.`;
  }
  return { id: pick.id, reason, warning, state: pick };
}

function fmtKg(kg) {
  return String(kg).replace('.', ',');
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ---------- Profil-kortet ---------- */

function lifeBar(st) {
  const pct = Math.min(100, Math.round(st.used * 100));
  const level = st.used >= 1 ? 'dead' : st.used >= 0.8 ? 'low' : st.used >= 0.5 ? 'mid' : 'ok';
  return el('div', { class: `life-bar ${level}`, role: 'img', 'aria-label': `${pct} % av strängningens livslängd använd` },
    el('div', { style: `width:${Math.max(3, pct)}%` }));
}

function roleChip(st, roles) {
  if (st.away) return el('span', { class: 'chip pending' }, 'Hos strängaren');
  if (st.dead) return el('span', { class: 'chip dead' }, 'Dags att stränga om');
  if (roles.match === st.id && roles.training === st.id) return el('span', { class: 'chip role' }, 'Match och träning');
  if (roles.match === st.id) return el('span', { class: 'chip role match' }, 'Matchracket');
  if (roles.training === st.id) return el('span', { class: 'chip role' }, 'Träningsracket');
  return null;
}

export function racketsCard(rackets, diary, today = todayISO()) {
  const states = allStates(rackets, diary, today);
  if (!states.length) return null;
  const roles = {
    match: chooseRacket('match', rackets, diary, today)?.id,
    training: chooseRacket('traning', rackets, diary, today)?.id
  };

  return el('div', { class: 'trend-card' },
    el('h3', {}, 'Racketar'),
    el('p', { class: 'desc' }, 'Uppskattad spänning och tid kvar till omsträngning.'),
    ...states.map((st) => {
      const r = st.racket;
      const history = (r.stringings || []).filter((s) => s.date && s !== st.stringing).reverse();
      return el('div', { class: 'racket-item' },
        el('div', { class: 'racket-head' },
          el('b', {}, `${st.id.toUpperCase()} · ${r.name}`), roleChip(st, roles)),
        st.stringing ? el('p', {}, `${stringingLabel(st.stringing)} — strängad ${formatDate(st.stringing.date)}`) : null,
        st.stringing ? el('p', { class: 'tension' },
          el('span', { class: 'kg' }, `≈ ${fmtKg(st.kgNow)} kg`),
          ` troligen nu · ${st.sessions} pass, ${String(st.hours).replace('.', ',')} h spelat`) : null,
        st.stringing ? lifeBar(st) : null,
        st.stringing ? el('p', { class: 'left' }, st.dead
          ? 'Utspelad — lämna in för omsträngning.'
          : `≈ ${st.sessionsLeft} pass eller ${st.daysLeft} dagar kvar till omsträngning`) : null,
        st.pending ? el('p', { class: 'upcoming' }, `På gång: ${stringingLabel(st.pending)}`) : null,
        history.length
          ? el('p', { class: 'history' }, 'Tidigare: ' + history.map((s) => `${stringingLabel(s)} (${s.date})`).join(' · '))
          : null
      );
    }),
    el('p', { class: 'model-note' },
      'Uppskattning för polyester: ~12 % tapp första dygnet, sedan gradvis. Stränga om efter ~18 speltimmar eller 8 veckor. ' +
      'Matcher får det fräschaste racketet, träning spelar slut det äldre — så har du alltid ett med bra spänning.')
  );
}
