// All datalagring går genom den här modulen: Firestore när config finns i
// index.html, annars localStorage (appen funkar, men utan sync mellan enheter).
//
// En logg-rad: { week, slot, done, date_completed, rpe, note, metrics, updated_at }

export function logKey(week, slot) {
  return `${week}:${slot}`;
}

function firebaseConfig() {
  const c = globalThis.FIREBASE_CONFIG;
  if (!c || !c.apiKey || !c.projectId) return null;
  if (Object.values(c).some((v) => String(v).includes('PLACEHOLDER'))) return null;
  return c;
}

const LS_KEY = 'top-tennis-logs';

function createLocalBackend() {
  const read = () => JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  return {
    name: 'local',
    async load() {
      return read();
    },
    async upsert(log) {
      const map = read();
      map[logKey(log.week, log.slot)] = log;
      localStorage.setItem(LS_KEY, JSON.stringify(map));
    },
    subscribe(onRow) {
      // Håller flikar på samma enhet i sync; händelsen triggar inte i egna fliken.
      window.addEventListener('storage', (e) => {
        if (e.key !== LS_KEY || !e.newValue) return;
        for (const row of Object.values(JSON.parse(e.newValue))) onRow(row);
      });
    }
  };
}

async function createFirestoreBackend(config) {
  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js');
  const { getFirestore, collection, doc, setDoc, getDocs, onSnapshot } =
    await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js');
  const db = getFirestore(initializeApp(config));
  const logsRef = collection(db, 'session_log');
  return {
    name: 'firestore',
    async load() {
      const snapshot = await getDocs(logsRef);
      const map = {};
      snapshot.forEach((d) => { map[d.id] = d.data(); });
      return map;
    },
    async upsert(log) {
      await setDoc(doc(logsRef, logKey(log.week, log.slot)), log);
    },
    subscribe(onRow) {
      onSnapshot(logsRef, (snapshot) => {
        for (const change of snapshot.docChanges()) {
          if (change.type !== 'removed') onRow(change.doc.data());
        }
      });
    }
  };
}

export async function createStore() {
  const config = firebaseConfig();
  return config ? createFirestoreBackend(config) : createLocalBackend();
}
