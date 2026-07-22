// All datalagring går genom den här modulen: Supabase när config finns i
// index.html, annars localStorage (appen funkar, men utan sync mellan enheter).
//
// En logg-rad: { week, slot, done, date_completed, rpe, note, metrics, updated_at }

export function logKey(week, slot) {
  return `${week}:${slot}`;
}

function supabaseConfig() {
  const c = globalThis.SUPABASE_CONFIG;
  if (!c || !c.url || !c.anonKey) return null;
  if (c.url.includes('PLACEHOLDER') || c.anonKey.includes('PLACEHOLDER')) return null;
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

async function createSupabaseBackend(config) {
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.45.4');
  const client = createClient(config.url, config.anonKey, {
    realtime: { params: { eventsPerSecond: 5 } }
  });
  return {
    name: 'supabase',
    async load() {
      const { data, error } = await client.from('session_log').select('*');
      if (error) throw error;
      const map = {};
      for (const row of data) map[logKey(row.week, row.slot)] = row;
      return map;
    },
    async upsert(log) {
      const { error } = await client
        .from('session_log')
        .upsert(log, { onConflict: 'week,slot' });
      if (error) throw error;
    },
    subscribe(onRow) {
      client
        .channel('session_log-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'session_log' },
          (payload) => payload.new && onRow(payload.new)
        )
        .subscribe();
    }
  };
}

export async function createStore() {
  const config = supabaseConfig();
  return config ? createSupabaseBackend(config) : createLocalBackend();
}
