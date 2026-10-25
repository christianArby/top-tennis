#!/usr/bin/env node
// Coachens verktyg för Firestore: läser/skriver vanlig JSON mot REST-API:t
// (som annars kräver typat format). Ingen nyckel behövs — reglerna i
// firebase/firestore.rules tillåter läsning och id-begränsad skrivning.
//
//   node coach/fs.mjs list  <kollektion>
//   node coach/fs.mjs get   <kollektion> <id>
//   node coach/fs.mjs set   <kollektion> <id> '<json>'   ersätter hela dokumentet
//   node coach/fs.mjs merge <kollektion> <id> '<json>'   uppdaterar bara angivna fält

const BASE =
  'https://firestore.googleapis.com/v1/projects/top-tennis-hostplan/databases/(default)/documents';

function toValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'string') return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toValue) } };
  return { mapValue: { fields: toFields(v) } };
}

function toFields(obj) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, toValue(v)]));
}

function fromValue(v) {
  if ('nullValue' in v) return null;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('stringValue' in v) return v.stringValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(fromValue);
  if ('mapValue' in v) return fromFields(v.mapValue.fields || {});
  return null;
}

function fromFields(fields) {
  return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, fromValue(v)]));
}

// Nätverket tajmar ibland ut (ETIMEDOUT) — försök några gånger innan vi ger upp.
async function fetchWithRetry(url, init, attempts = 4) {
  for (let i = 1; ; i++) {
    try {
      return await fetch(url, init);
    } catch (err) {
      if (i >= attempts) throw new Error(`${err.message} (${err.cause?.code || 'okänt'}) efter ${attempts} försök`);
      await new Promise((r) => setTimeout(r, 500 * i));
    }
  }
}

async function call(url, init) {
  const res = await fetchWithRetry(url, init);
  const body = await res.json();
  if (!res.ok) throw new Error(`${res.status}: ${JSON.stringify(body.error || body)}`);
  return body;
}

const [cmd, coll, id, json] = process.argv.slice(2);
const docUrl = () => `${BASE}/${coll}/${encodeURIComponent(id)}`;

try {
  if (cmd === 'list' && coll) {
    const out = {};
    let pageToken;
    do {
      const body = await call(`${BASE}/${coll}?pageSize=300${pageToken ? `&pageToken=${pageToken}` : ''}`);
      for (const d of body.documents || []) out[d.name.split('/').pop()] = fromFields(d.fields || {});
      pageToken = body.nextPageToken;
    } while (pageToken);
    console.log(JSON.stringify(out, null, 2));
  } else if (cmd === 'get' && coll && id) {
    console.log(JSON.stringify(fromFields((await call(docUrl())).fields || {}), null, 2));
  } else if ((cmd === 'set' || cmd === 'merge') && coll && id && json) {
    const data = { ...JSON.parse(json), updated_at: new Date().toISOString() };
    const mask = cmd === 'merge'
      ? '?' + Object.keys(data).map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&')
      : '';
    const body = await call(docUrl() + mask, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: toFields(data) })
    });
    console.log(JSON.stringify(fromFields(body.fields || {}), null, 2));
  } else {
    console.error("Användning: list <koll> | get <koll> <id> | set|merge <koll> <id> '<json>'");
    process.exit(2);
  }
} catch (err) {
  console.error(`Fel: ${err.message}`);
  process.exit(1);
}
