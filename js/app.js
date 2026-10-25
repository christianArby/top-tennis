import { createStore } from './store.js';
import { renderDiaryTrends } from './charts.js';
import { PROFILE } from './profile.js';
import { nextCard } from './next.js';
import { el, todayISO, linkifyExercises } from './dom.js';
import { diaryView, sortedEntries } from './diary.js';
import { racketsCard } from './rackets.js';
import { archiveView } from './archive.js';

const app = document.getElementById('app');

const COLLECTIONS = ['diary', 'rackets', 'upcoming', 'session_log'];
const data = { diary: {}, rackets: {}, upcoming: {}, session_log: {} };
let store;
let view = 'dagbok';

/* ---------- Trender ---------- */

function exportJson() {
  const blob = new Blob(
    [JSON.stringify({ exported_at: new Date().toISOString(), ...data }, null, 2)],
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
  renderDiaryTrends(container, sortedEntries(data.diary).reverse());
  frag.append(container,
    el('button', { class: 'export', onclick: exportJson }, 'Exportera all data (JSON)'));
  return frag;
}

/* ---------- Profil ---------- */

function profileView() {
  const frag = document.createDocumentFragment();

  const rackets = racketsCard(data.rackets, data.diary);
  if (rackets) frag.append(rackets);

  frag.append(el('div', { class: 'trend-card' },
    el('h3', {}, 'Mål'),
    el('p', { class: 'desc' }, PROFILE.background),
    el('ol', { class: 'goal-list' },
      ...PROFILE.goals.map((g) => el('li', {}, g)))
  ));

  frag.append(el('div', { class: 'trend-card' },
    el('h3', {}, 'Styrkor'),
    el('p', { class: 'desc' }, 'Vapnen att bygga spelet kring.'),
    el('ul', { class: 'strength-list' },
      ...PROFILE.strengths.map((s) => el('li', {}, s)))
  ));

  frag.append(el('div', { class: 'trend-card' },
    el('h3', {}, 'Tänk på'),
    el('p', { class: 'desc' }, 'Vanorna som vinner matcher — läs innan passet.'),
    ...PROFILE.focus.map((f) => el('div', { class: 'focus-item' },
      el('b', {}, f.title),
      el('p', {}, linkifyExercises(f.detail))))
  ));

  return frag;
}

/* ---------- Kommande pass ---------- */

async function addUpcoming(id, doc) {
  data.upcoming[id] = doc;
  render();
  try { await store.upsert('upcoming', id, doc); } catch (err) { alert(`Kunde inte spara: ${err.message || err}`); }
}

async function removeUpcoming(id) {
  delete data.upcoming[id];
  render();
  try { await store.remove('upcoming', id); } catch (err) { alert(`Kunde inte ta bort: ${err.message || err}`); }
}

/* ---------- Skal ---------- */

const TABS = [
  ['dagbok', 'Dagbok'],
  ['trender', 'Trender'],
  ['profil', 'Profil'],
  ['arkiv', 'Arkiv']
];

function currentView() {
  switch (view) {
    case 'trender': return trendsView();
    case 'profil': return profileView();
    case 'arkiv': return archiveView(data.session_log, render);
    default: {
      const frag = document.createDocumentFragment();
      frag.append(nextCard(data, { onAdd: addUpcoming, onRemove: removeUpcoming }),
        diaryView(data.diary, data.rackets));
      return frag;
    }
  }
}

function render() {
  const entries = sortedEntries(data.diary);
  const latest = entries[0];
  app.replaceChildren(
    el('header', { class: 'top' },
      el('h1', {}, 'Tennisdagbok 🎾'),
      el('p', { class: 'sub' },
        `${entries.length} pass loggade`,
        latest ? ` · senast ${latest.date.slice(8, 10)}/${Number(latest.date.slice(5, 7))}` : '',
        ' · ',
        el('span', { class: `sync-badge ${store.name === 'firestore' ? 'online' : 'offline'}` },
          store.name === 'firestore' ? 'sync på' : 'endast denna enhet'))
    ),
    el('nav', { class: 'tabs' },
      ...TABS.map(([id, label]) => el('button', {
        class: view === id ? 'active' : '',
        onclick: () => { view = id; render(); }
      }, label))),
    currentView()
  );
}

async function init() {
  store = await createStore();
  await Promise.all(COLLECTIONS.map(async (coll) => { data[coll] = await store.load(coll); }));
  for (const coll of COLLECTIONS) {
    store.subscribe(coll, (id, doc) => {
      if (doc) data[coll][id] = doc; else delete data[coll][id];
      render();
    });
  }
  render();
}

init().catch((err) => {
  app.replaceChildren(el('p', { class: 'loading' }, `Kunde inte ladda: ${err.message || err}`));
  console.error(err);
});
