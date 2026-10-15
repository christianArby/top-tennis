// Höstplanen 2026 (27 jul – 18 okt) i läsläge. Ersatt av dagboken 2026-10-15;
// datan i session_log behålls.

import { PHASES, METRIC_FIELDS, sessionsForWeek, weekDateLabel } from './plan.js';
import { logKey } from './store.js';
import { renderTrends } from './charts.js';
import { el, linkifyExercises } from './dom.js';

const expandedWeeks = new Set();
const expandedSessions = new Set();

function loggedSummary(slot, log) {
  if (!log) return null;
  const parts = [];
  if (log.sick) parts.push('sjuk');
  if (log.rpe != null) parts.push(`RPE ${log.rpe}`);
  for (const f of METRIC_FIELDS[slot]) {
    const v = log.metrics && log.metrics[f.key];
    if (v === undefined || v === null || v === false) continue;
    parts.push(f.type === 'bool' ? f.label : `${f.label}: ${v}`);
  }
  if (log.note) parts.push(`”${log.note}”`);
  return parts.length ? el('p', { class: 'logged' }, parts.join(' · ')) : null;
}

function sessionRow(week, session, logs, rerender) {
  const key = logKey(week, session.slot);
  const log = logs[key] || null;
  const done = !!(log && log.done);
  const sick = !!(log && log.sick);

  const row = el('div', { class: 'session-row' },
    el('span', { class: `status ${done ? 'done' : sick ? 'sick' : ''}` }, done ? '✓' : sick ? '–' : ''),
    el('span', { class: `label ${session.kind}` }, session.label),
    el('button', {
      class: 'stitle', type: 'button',
      onclick: () => {
        expandedSessions.has(key) ? expandedSessions.delete(key) : expandedSessions.add(key);
        rerender();
      }
    }, session.title),
    el('span', { class: 'meta' }, log && log.date_completed ? log.date_completed.slice(5) : '')
  );

  const wrap = el('div', { class: `session${done ? ' done' : ''}${sick ? ' sick' : ''}` }, row);
  if (expandedSessions.has(key)) {
    wrap.append(el('div', { class: 'session-detail' },
      el('p', { class: 'planned' }, linkifyExercises(session.planned_detail)),
      loggedSummary(session.slot, log)
    ));
  }
  return wrap;
}

function weekCard(week, logs, rerender) {
  const sessions = sessionsForWeek(week);
  const dots = sessions.map((s) => {
    const log = logs[logKey(week, s.slot)];
    return el('span', { class: log && log.done ? 'done' : (log && log.sick ? 'sick' : '') });
  });
  const head = el('button', {
    class: 'week-head', type: 'button',
    onclick: () => {
      expandedWeeks.has(week) ? expandedWeeks.delete(week) : expandedWeeks.add(week);
      rerender();
    }
  },
    el('span', { class: 'wtitle' }, `Vecka ${week}`),
    el('span', { class: 'wdates' }, weekDateLabel(week)),
    el('span', { class: 'week-dots' }, ...dots)
  );
  const card = el('div', { class: 'week' }, head);
  if (expandedWeeks.has(week)) {
    card.append(el('div', { class: 'week-body' },
      ...sessions.map((s) => sessionRow(week, s, logs, rerender))));
  }
  return card;
}

export function archiveView(logs, rerender) {
  const frag = document.createDocumentFragment();
  const done = Object.values(logs).filter((l) => l.done).length;
  frag.append(el('div', { class: 'rhythm-note' },
    `Arkiv: Höstplanen, 12 veckor 27 jul – 18 okt 2026. ${done}/48 pass avbockade. Ersatt av dagboken.`));

  for (const phase of PHASES) {
    frag.append(el('section', { class: 'phase', 'data-phase': phase.phase },
      el('h2', {}, el('span', { class: 'chip' }, phase.name),
        `Vecka ${phase.weeks[0]}–${phase.weeks[phase.weeks.length - 1]}`),
      el('p', { class: 'goal' }, phase.goal),
      ...phase.weeks.map((w) => weekCard(w, logs, rerender))
    ));
  }

  const trends = el('section', { class: 'phase' }, el('h2', {}, 'Höstplanens trender'));
  renderTrends(trends, logs);
  frag.append(trends);
  return frag;
}
