// Trendgrafer med uPlot (laddas från CDN i index.html).
// Palett validerad med dataviz-checkerna (CVD-säker): blå + terracotta.

import { TOTAL_WEEKS } from './plan.js';
import { logKey } from './store.js';
import { el } from './dom.js';

const COLOR_1 = '#2e6fb8'; // primär serie (blå)
const COLOR_2 = '#c05a2e'; // sekundär serie (terracotta)

const WEEKS = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1);

function hasData(...seriesArrays) {
  return seriesArrays.some((arr) => arr.some((v) => v !== null));
}

function dataTable(labels, rows) {
  const table = el('table', { class: 'trend-table' });
  table.append(el('tr', {}, ...labels.map((l) => el('th', {}, l))));
  for (const row of rows) {
    table.append(el('tr', {}, ...row.map((c) => el('td', {}, c == null ? '–' : String(c)))));
  }
  return el('details', {}, el('summary', {}, 'Visa som tabell'), table);
}

// chart: { x, xLabel, xTick?(v) → text, series: [{ label, values, color }], yRange, bars? }
function makeChart(mount, chart) {
  const axisStyle = { stroke: '#6e6757', grid: { stroke: '#f0e8d9' }, ticks: { stroke: '#e0d5c1' } };
  const n = chart.x.length;
  const draw = () => {
    mount.replaceChildren();
    const opts = {
      width: mount.clientWidth || 320,
      height: 190,
      scales: {
        x: { time: false, range: () => (chart.bars ? [chart.x[0] - 0.6, chart.x[n - 1] + 0.6] : [chart.x[0], chart.x[n - 1]]) },
        y: { range: chart.yRange }
      },
      axes: [
        {
          ...axisStyle, label: chart.xLabel, incrs: [1, 2, 3, 5, 10],
          values: chart.xTick ? (u, vals) => vals.map(chart.xTick) : undefined
        },
        axisStyle
      ],
      series: [
        { label: chart.xLabel, value: chart.xTick ? (u, v) => (v == null ? '–' : chart.xTick(v)) : undefined },
        ...chart.series.map((s) => (chart.bars
          ? { label: s.label, fill: s.color, stroke: s.color, width: 0, paths: uPlot.paths.bars({ size: [0.6, 40], radius: 0.15 }), points: { show: false } }
          : { label: s.label, stroke: s.color, width: 2, spanGaps: true, points: { show: true, size: 8, fill: s.color } }))
      ]
    };
    new uPlot(opts, [chart.x, ...chart.series.map((s) => s.values)], mount);
  };
  // Ritas först när korten sitter i DOM:en, annars är clientWidth 0.
  requestAnimationFrame(draw);
  let t;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(draw, 150); });
}

function trendCard(title, desc, chart) {
  const card = el('div', { class: 'trend-card' },
    el('h3', {}, title), el('p', { class: 'desc' }, desc));

  if (!chart.x.length || !hasData(...chart.series.map((s) => s.values))) {
    card.append(el('p', { class: 'empty' }, 'Inga loggade värden ännu.'));
    return card;
  }

  const mount = el('div');
  card.append(mount);
  if (typeof uPlot !== 'undefined') {
    makeChart(mount, chart);
  } else {
    mount.append(el('p', { class: 'empty' }, 'Grafbiblioteket kunde inte laddas — tabellen nedan gäller.'));
  }
  const tick = chart.xTick || ((v) => v);
  card.append(dataTable(
    [chart.xLabel, ...chart.series.map((s) => s.label)],
    chart.x.map((x, i) => [tick(x), ...chart.series.map((s) => s.values[i])])
  ));
  return card;
}

/* ---------- Dagbokens trender ---------- */

// ISO-veckonummer för ett "YYYY-MM-DD"-datum.
function isoWeek(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
}

// entries: dagboksposter sorterade äldst först.
export function renderDiaryTrends(container, entries) {
  const withFeel = entries.filter((e) => typeof e.feel === 'number');
  const feelDates = withFeel.map((e) => e.date);
  const fmtShort = (iso) => `${Number(iso.slice(8, 10))}/${Number(iso.slice(5, 7))}`;

  container.append(trendCard('Känsla', 'Helhetskänsla per pass, 1 = tungt, 5 = toppen.', {
    x: withFeel.map((_, i) => i + 1),
    xLabel: 'Pass',
    xTick: (v) => (feelDates[v - 1] ? fmtShort(feelDates[v - 1]) : ''),
    series: [{ label: 'Känsla', values: withFeel.map((e) => e.feel), color: COLOR_1 }],
    yRange: () => [1, 5]
  }));

  // Pass per ISO-vecka, från första posten till idag (tomma veckor = 0).
  const weeks = [];
  if (entries.length) {
    const counts = {};
    for (const e of entries) counts[isoWeek(e.date)] = (counts[isoWeek(e.date)] || 0) + 1;
    const first = isoWeek(entries[0].date);
    const last = Math.max(isoWeek(new Date().toISOString().slice(0, 10)), first);
    for (let w = first; w <= last; w++) weeks.push([w, counts[w] || 0]);
  }
  container.append(trendCard('Pass per vecka', 'Antal loggade pass per kalendervecka.', {
    x: weeks.map(([w]) => w),
    xLabel: 'Vecka',
    xTick: (v) => `v${v}`,
    series: [{ label: 'Pass', values: weeks.map(([, c]) => c), color: COLOR_1 }],
    yRange: (u, min, max) => [0, Math.max(3, max + 1)],
    bars: true
  }));
}

/* ---------- Höstplanens trender (arkiv) ---------- */

function seriesFromLogs(logs, slot, pick) {
  return WEEKS.map((w) => {
    const log = logs[logKey(w, slot)];
    const v = log ? pick(log) : null;
    return typeof v === 'number' ? v : null;
  });
}

function avgRpePerWeek(logs) {
  return WEEKS.map((w) => {
    const vals = [0, 1, 2, 3]
      .map((slot) => logs[logKey(w, slot)])
      .filter((l) => l && l.rpe != null)
      .map((l) => l.rpe);
    if (!vals.length) return null;
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  });
}

// Axelvarning: två sjunkande värden i rad, eller senaste ≤ 2.
function shoulderWarning(values) {
  const logged = values.filter((v) => v !== null);
  if (logged.length < 1) return null;
  const last = logged[logged.length - 1];
  const twoDrops = logged.length >= 3 &&
    logged[logged.length - 1] < logged[logged.length - 2] &&
    logged[logged.length - 2] < logged[logged.length - 3];
  if (last <= 2 || twoDrops) {
    return 'Axelkänslan trendar nedåt — sänk serveintensiteten och prata med fysio om det håller i sig.';
  }
  return null;
}

export function renderTrends(container, logs) {
  const weekly = (series, yRange) => ({ x: WEEKS, xLabel: 'Vecka', series, yRange });
  const first = seriesFromLogs(logs, 1, (l) => l.metrics && l.metrics.first_serve_pct);
  const second = seriesFromLogs(logs, 1, (l) => l.metrics && l.metrics.second_serve_pct);
  const shoulder = seriesFromLogs(logs, 1, (l) => l.metrics && l.metrics.shoulder_feel);

  container.append(
    trendCard('Serve-%', 'Första- och andraserve per vecka (Tennis 1).', weekly([
      { label: 'Förstaserve %', values: first, color: COLOR_1 },
      { label: 'Andraserve %', values: second, color: COLOR_2 }
    ], () => [0, 100])),
    trendCard('RPE', 'Snittansträngning per vecka, alla loggade pass (1–10).',
      weekly([{ label: 'RPE snitt', values: avgRpePerWeek(logs), color: COLOR_1 }], () => [1, 10]))
  );

  const shoulderCard = trendCard('Axelkänsla', 'shoulder_feel från servepassen (1 = ont, 5 = toppen).',
    weekly([{ label: 'Axelkänsla', values: shoulder, color: COLOR_1 }], () => [1, 5]));
  const warn = shoulderWarning(shoulder);
  if (warn) shoulderCard.append(el('div', { class: 'shoulder-warn' }, `⚠ ${warn}`));
  container.append(shoulderCard);
}
