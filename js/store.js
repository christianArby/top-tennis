// All datalagring går genom den här modulen: Firestore när config finns i
// index.html, annars localStorage (appen funkar, men utan sync mellan enheter).
//
// Kollektioner:
//   diary       — dagboksposter, id = datum (2026-10-15, 2026-10-15-2 vid flera samma dag)
//   rackets     — racketar med strängningshistorik, id = a | b
//   upcoming    — kommande matcher/sessioner, id = 2026-11-08-1700
//   session_log — Höstplanens loggar (arkiv), id = vecka:slot

export function logKey(week, slot) {
  return `${week}:${slot}`;
}

function firebaseConfig() {
  const c = globalThis.FIREBASE_CONFIG;
  if (!c || !c.apiKey || !c.projectId) return null;
  if (Object.values(c).some((v) => String(v).includes('PLACEHOLDER'))) return null;
  return c;
}

// session_log behåller sin gamla nyckel så att tidigare lokal data hittas.
const lsKey = (coll) => (coll === 'session_log' ? 'top-tennis-logs' : `top-tennis:${coll}`);

function createLocalBackend() {
  const read = (coll) => JSON.parse(localStorage.getItem(lsKey(coll)) || '{}');
  return {
    name: 'local',
    async load(coll) {
      return read(coll);
    },
    async upsert(coll, id, doc) {
      const map = read(coll);
      map[id] = doc;
      localStorage.setItem(lsKey(coll), JSON.stringify(map));
    },
    async remove(coll, id) {
      const map = read(coll);
      delete map[id];
      localStorage.setItem(lsKey(coll), JSON.stringify(map));
    },
    subscribe(coll, onDoc) {
      // Håller flikar på samma enhet i sync; händelsen triggar inte i egna fliken.
      window.addEventListener('storage', (e) => {
        if (e.key !== lsKey(coll)) return;
        const before = JSON.parse(e.oldValue || '{}');
        const after = JSON.parse(e.newValue || '{}');
        for (const id of Object.keys(before)) if (!(id in after)) onDoc(id, null);
        for (const [id, doc] of Object.entries(after)) onDoc(id, doc);
      });
    }
  };
}

async function createFirestoreBackend(config) {
  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js');
  const { getFirestore, collection, doc, setDoc, deleteDoc, getDocs, onSnapshot } =
    await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js');
  const db = getFirestore(initializeApp(config));
  return {
    name: 'firestore',
    async load(coll) {
      const snapshot = await getDocs(collection(db, coll));
      const map = {};
      snapshot.forEach((d) => { map[d.id] = d.data(); });
      return map;
    },
    async upsert(coll, id, data) {
      await setDoc(doc(collection(db, coll), id), data);
    },
    async remove(coll, id) {
      await deleteDoc(doc(collection(db, coll), id));
    },
    // onDoc(id, null) = dokumentet togs bort.
    subscribe(coll, onDoc) {
      onSnapshot(collection(db, coll), (snapshot) => {
        for (const change of snapshot.docChanges()) {
          onDoc(change.doc.id, change.type === 'removed' ? null : change.doc.data());
        }
      });
    }
  };
}

export async function createStore() {
  const config = firebaseConfig();
  return config ? createFirestoreBackend(config) : createLocalBackend();
}
