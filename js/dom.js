import { EXERCISES, exercisePattern, exerciseKeyFor } from './exercises.js';

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== null) node.setAttribute(k, v);
  }
  node.append(...children.filter((c) => c !== null && c !== undefined && c !== false));
  return node;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const DATE_FMT = new Intl.DateTimeFormat('sv-SE', { weekday: 'short', day: 'numeric', month: 'short' });

// "2026-10-15" → "tors 15 okt." (lokal tid, inte UTC-förskjuten)
export function formatDate(iso) {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return DATE_FMT.format(new Date(y, m - 1, d));
}

export function daysBetween(fromIso, toIso) {
  const toDate = (iso) => { const [y, m, d] = iso.slice(0, 10).split('-').map(Number); return Date.UTC(y, m - 1, d); };
  return Math.round((toDate(toIso) - toDate(fromIso)) / 86400000);
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
export function linkifyExercises(text) {
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
