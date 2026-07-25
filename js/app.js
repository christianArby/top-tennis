import {
  PHASES, METRIC_FIELDS, RHYTHM_RULE, RPE_HINT, TOTAL_WEEKS, SLOTS_PER_WEEK,
  sessionsForWeek, weekDateLabel, currentWeek
} from './plan.js';
import { createStore, logKey } from './store.js';
import { renderTrends } from './charts.js';
import { PROFILE } from './profile.js';
import { EXERCISES, exercisePattern, exerciseKeyFor } from './exercises.js';

const app = document.getElementById('app');

let store;
let logs = {};
let view = 'plan';
const expandedWeeks = new Set([currentWeek()]);
const expandedSessions = new Set();
let flashKey = null; // pass vars formulär just sparats — visar "Sparat ✓" över re-render

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== null) node.setAttribute(k, v);
  }
  node.append(...children.filter((c) => c !== null && c !== undefined));
  return node;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function getLog(week, slot) {
  return logs[logKey(week, slot)] || null;
}

async function saveLog(log) {
  log.updated_at = new Date().toISOString();
  logs[logKey(log.week, log.slot)] = log;
  render();
  try {
    await store.upsert(log);
  } catch (err) {
    console.error('Kunde inte spara', err);
    alert(`Kunde inte spara: ${err.message || err}`);
  }
}

function toggleDone(week, slot) {
  const prev = getLog(week, slot) || { week, slot, metrics: {} };
  const done = !prev.done;
  saveLog({
    ...prev,
    done,
    sick: false,
    date_completed: done ? (prev.date_completed || todayISO()) : null
  });
}

// Sjuk = ok att hoppa över passet; räknas inte som klart och lämnar hål i trenden.
function toggleSick(week, slot) {
  const prev = getLog(week, slot) || { week, slot, metrics: {} };
  const sick = !prev.sick;
  saveLog({
    ...prev,
    sick,
    done: sick ? false : prev.done,
    date_completed: sick ? null : prev.date_completed
  });
}

/* ---------- Övningslexikon ---------- */

function showExercise(key) {
  const ex = EXERCISES[key];
  if (!ex) return;
  let dlg = document.getElementById('ex-dialog');
  if (!dlg) {
    dlg = el('dialog', { id: 'ex-dialog' });
    // Klick på backdrop (utanför innehållet) stänger.
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    document.body.append(dlg);
  }
  const fig = el('div', { class: 'dlg-fig' });
  if (ex.svg) fig.innerHTML = ex.svg;
  dlg.replaceChildren(
    el('button', { class: 'dlg-close', type: 'button', 'aria-label': 'Stäng', onclick: () => dlg.close() }, '✕'),
    ex.svg ? fig : null,
    el('h3', {}, ex.name),
    el('p', { class: 'dlg-desc' }, ex.desc),
    el('ul', { class: 'dlg-cues' }, ...ex.cues.map((c) => el('li', {}, c))),
    el('a', {
      class: 'dlg-video', target: '_blank', rel: 'noopener',
      href: `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.video)}`
    }, 'Se video på YouTube ↗')
  );
  dlg.showModal();
}

// Gör övningsnamn i en text klickbara.
function linkifyExercises(text) {
  const frag = document.createDocumentFragment();
  let last = 0;
  for (const m of text.matchAll(exercisePattern())) {
    const key = exerciseKeyFor(m[0]);
    if (!key) continue;
    frag.append(text.slice(last, m.index));
    frag.append(el('button', {
      class: 'ex-link', type: 'button', onclick: () => showExercise(key)
    }, m[0]));
    last = m.index + m[0].length;
  }
  frag.append(text.slice(last));
  return frag;
}

/* ---------- Plan-vyn ---------- */

function metricsForm(week, slot, log) {
  const metrics = (log && log.metrics) || {};
  const form = el('form', { class: 'metrics' });

  const fieldWrap = (label, input, extraClass = '') => {
    const id = `f-${week}-${slot}-${input.name}`;
    input.id = id;
    return el('div', { class: `field ${extraClass}` },
      el('label', { for: id }, label), input);
  };

  for (const f of METRIC_FIELDS[slot]) {
    if (f.type === 'bool') {
      const input = el('input', { type: 'checkbox' });
      input.name = f.key;
      input.checked = !!metrics[f.key];
      const id = `f-${week}-${slot}-${f.key}`;
      input.id = id;
      form.append(el('div', { class: 'field checkfield' },
        input, el('label', { for: id }, f.label)));
    } else {
      const input = el('input', {
        type: f.type === 'number' ? 'number' : 'text',
        min: f.min, max: f.max, inputmode: f.type === 'number' ? 'numeric' : undefined,
        placeholder: f.hint
      });
      input.name = f.key;
      if (metrics[f.key] !== undefined && metrics[f.key] !== null) input.value = metrics[f.key];
      form.append(fieldWrap(f.label, input));
    }
  }

  const rpe = el('input', { type: 'number', min: 1, max: 10, inputmode: 'numeric', placeholder: RPE_HINT });
  rpe.name = 'rpe';
  if (log && log.rpe != null) rpe.value = log.rpe;
  form.append(fieldWrap('RPE (1–10)', rpe));

  const date = el('input', { type: 'date' });
  date.name = 'date_completed';
  if (log && log.date_completed) date.value = log.date_completed;
  form.append(fieldWrap('Datum', date));

  const note = el('textarea', { rows: 2 });
  note.name = 'note';
  if (log && log.note) note.value = log.note;
  form.append(fieldWrap('Anteckning', note, 'wide'));

  const savedNote = el('span', { class: 'saved-note' });
  const key = logKey(week, slot);
  if (flashKey === key) savedNote.textContent = 'Sparat ✓';
  form.append(el('div', { class: 'actions' },
    el('button', { type: 'submit' }, 'Spara'), savedNote));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const prev = getLog(week, slot) || { week, slot, done: false };
    const metricsOut = {};
    for (const f of METRIC_FIELDS[slot]) {
      const input = form.elements[f.key];
      if (f.type === 'bool') {
        if (input.checked) metricsOut[f.key] = true;
      } else if (input.value !== '') {
        metricsOut[f.key] = f.type === 'number' ? Number(input.value) : input.value;
      }
    }
    flashKey = key;
    setTimeout(() => { if (flashKey === key) { flashKey = null; render(); } }, 2500);
    saveLog({
      ...prev,
      rpe: form.elements.rpe.value === '' ? null : Number(form.elements.rpe.value),
      note: form.elements.note.value || null,
      date_completed: form.elements.date_completed.value || prev.date_completed || null,
      metrics: metricsOut
    });
  });

  return form;
}

function sessionRow(week, session) {
  const key = logKey(week, session.slot);
  const log = getLog(week, session.slot);
  const done = !!(log && log.done);
  const sick = !!(log && log.sick);

  const checkbox = el('input', {
    type: 'checkbox',
    onchange: () => toggleDone(week, session.slot),
    'aria-label': `${session.label} vecka ${week} klar`
  });
  checkbox.checked = done;

  const metaParts = [];
  if (sick) metaParts.push('sjuk 🤒');
  if (log && log.date_completed) metaParts.push(log.date_completed.slice(5));
  if (log && log.rpe != null) metaParts.push(`RPE ${log.rpe}`);

  const row = el('div', { class: 'session-row' },
    checkbox,
    el('span', { class: `label ${session.kind}` }, session.label),
    el('button', {
      class: 'stitle', type: 'button',
      onclick: () => {
        expandedSessions.has(key) ? expandedSessions.delete(key) : expandedSessions.add(key);
        render();
      }
    }, session.title),
    el('span', { class: 'meta' }, metaParts.join(' · '))
  );

  const wrap = el('div', { class: `session${done ? ' done' : ''}${sick ? ' sick' : ''}` }, row);
  if (expandedSessions.has(key)) {
    wrap.append(el('div', { class: 'session-detail' },
      el('p', { class: 'planned' }, linkifyExercises(session.planned_detail)),
      el('button', {
        class: `sick-toggle${sick ? ' active' : ''}`, type: 'button',
        onclick: () => toggleSick(week, session.slot)
      }, sick ? 'Ta bort sjukmarkering' : 'Sjuk — hoppa över passet 🤒'),
      metricsForm(week, session.slot, log)
    ));
  }
  return wrap;
}

function weekCard(week) {
  const isCurrent = week === currentWeek();
  const sessions = sessionsForWeek(week);
  const dots = sessions.map((s) => {
    const log = getLog(week, s.slot);
    return el('span', { class: log && log.done ? 'done' : (log && log.sick ? 'sick' : '') });
  });

  const head = el('button', {
    class: 'week-head', type: 'button',
    onclick: () => {
      expandedWeeks.has(week) ? expandedWeeks.delete(week) : expandedWeeks.add(week);
      render();
    }
  },
    el('span', { class: 'wtitle' }, `Vecka ${week}`),
    el('span', { class: 'wdates' }, weekDateLabel(week)),
    isCurrent ? el('span', { class: 'now-chip' }, 'nu') : null,
    el('span', { class: 'week-dots' }, ...dots)
  );

  const card = el('div', { class: `week${isCurrent ? ' current' : ''}` }, head);
  if (expandedWeeks.has(week)) {
    card.append(el('div', { class: 'week-body' },
      ...sessions.map((s) => sessionRow(week, s))));
  }
  return card;
}

function planView() {
  const frag = document.createDocumentFragment();
  frag.append(el('div', { class: 'rhythm-note' }, RHYTHM_RULE));
  for (const phase of PHASES) {
    frag.append(el('section', { class: 'phase', 'data-phase': phase.phase },
      el('h2', {}, el('span', { class: 'chip' }, phase.name),
        `Vecka ${phase.weeks[0]}–${phase.weeks[phase.weeks.length - 1]}`),
      el('p', { class: 'goal' }, phase.goal),
      ...phase.weeks.map(weekCard)
    ));
  }
  return frag;
}

/* ---------- Trender-vyn ---------- */

function exportJson() {
  const blob = new Blob(
    [JSON.stringify({ exported_at: new Date().toISOString(), logs }, null, 2)],
    { type: 'application/json' });
  const a = el('a', {
    href: URL.createObjectURL(blob),
    download: `top-tennis-export-${todayISO()}.json`
  });
  a.click();
  URL.revokeObjectURL(a.href);
}

function trendsView() {
  const frag = document.createDocumentFragment();
  const container = el('div');
  renderTrends(container, logs);
  frag.append(container,
    el('button', { class: 'export', onclick: exportJson }, 'Exportera all data (JSON)'));
  return frag;
}

/* ---------- Profil-vyn ---------- */

function profileView() {
  const frag = document.createDocumentFragment();

  frag.append(el('div', { class: 'trend-card' },
    el('h3', {}, 'Mål'),
    el('p', { class: 'desc' }, PROFILE.background),
    el('ol', { class: 'goal-list' },
      ...PROFILE.goals.map((g) => el('li', {}, g)))
  ));

  frag.append(el('div', { class: 'trend-card' },
    el('h3', {}, 'Styrkor'),
    el('p', { class: 'desc' }, 'Vapnen som passen bygger vidare på.'),
    el('ul', { class: 'strength-list' },
      ...PROFILE.strengths.map((s) => el('li', {}, s)))
  ));

  frag.append(el('div', { class: 'trend-card' },
    el('h3', {}, 'Tänk på'),
    el('p', { class: 'desc' }, 'Det här är vanorna som vinner matcher — läs innan passet.'),
    ...PROFILE.focus.map((f) => el('div', { class: 'focus-item' },
      el('b', {}, f.title),
      el('p', {}, linkifyExercises(f.detail))))
  ));

  return frag;
}

/* ---------- Skal ---------- */

function render() {
  const doneCount = Object.values(logs).filter((l) => l.done).length;
  const total = TOTAL_WEEKS * SLOTS_PER_WEEK;

  app.replaceChildren(
    el('header', { class: 'top' },
      el('h1', {}, 'Höstplan 🎾'),
      el('p', { class: 'sub' }, '12 veckor · 27 jul – 18 okt 2026 · ',
        el('span', { class: `sync-badge ${store.name === 'firestore' ? 'online' : 'offline'}` },
          store.name === 'firestore' ? 'sync på' : 'endast denna enhet')),
      el('div', { class: 'progress-total' },
        el('div', { class: 'bar' }, el('div', { style: `width:${(doneCount / total) * 100}%` })),
        el('span', { class: 'count' }, `${doneCount}/${total}`))
    ),
    el('nav', { class: 'tabs' },
      el('button', { class: view === 'plan' ? 'active' : '', onclick: () => { view = 'plan'; render(); } }, 'Plan'),
      el('button', { class: view === 'trender' ? 'active' : '', onclick: () => { view = 'trender'; render(); } }, 'Trender'),
      el('button', { class: view === 'profil' ? 'active' : '', onclick: () => { view = 'profil'; render(); } }, 'Profil')
    ),
    view === 'plan' ? planView() : view === 'trender' ? trendsView() : profileView()
  );
}

async function init() {
  store = await createStore();
  logs = await store.load();
  store.subscribe((row) => {
    logs[logKey(row.week, row.slot)] = row;
    render();
  });
  render();
}

init().catch((err) => {
  app.replaceChildren(el('p', { class: 'loading' }, `Kunde inte ladda: ${err.message || err}`));
  console.error(err);
});
