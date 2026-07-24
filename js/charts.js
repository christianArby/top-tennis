// Trendgrafer med uPlot (laddas från CDN i index.html).
// Palett validerad med dataviz-checkerna (CVD-säker): blå + orange.

import { TOTAL_WEEKS } from './plan.js';
import { logKey } from './store.js';

const COLOR_1 = '#2e6fb8'; // primär serie (blå)
const COLOR_2 = '#c05a2e'; // sekundär serie (terracotta)

const WEEKS = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1);

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

function hasData(...seriesArrays) {
  return seriesArrays.some((arr) => arr.some((v) => v !== null));
}

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else node.setAttribute(k, v);
  }
  node.append(...children);
  return node;
}

function dataTable(labels, rows) {
  const table = el('table', { class: 'trend-table' });
  table.append(el('tr', {}, ...labels.map((l) => el('th', {}, l))));
  for (const row of rows) {
    table.append(el('tr', {}, ...row.map((c) => el('td', {}, c == null ? '–' : String(c)))));
  }
  return el('details', {}, el('summary', {}, 'Visa som tabell'), table);
}

function makeChart(mount, seriesDefs, yRange) {
  const data = [WEEKS, ...seriesDefs.map((s) => s.values)];
  const draw = () => {
    mount.replaceChildren();
    const opts = {
      width: mount.clientWidth || 320,
      height: 190,
      scales: {
        x: { time: false, range: () => [1, TOTAL_WEEKS] },
        y: { range: yRange }
      },
      axes: [
        { label: 'Vecka', incrs: [1, 2, 3], stroke: '#6e6757', grid: { stroke: '#f0e8d9' }, ticks: { stroke: '#e0d5c1' } },
        { stroke: '#6e6757', grid: { stroke: '#f0e8d9' }, ticks: { stroke: '#e0d5c1' } }
      ],
      series: [
        { label: 'Vecka' },
        ...seriesDefs.map((s) => ({
          label: s.label,
          stroke: s.color,
          width: 2,
          spanGaps: true,
          points: { show: true, size: 8, fill: s.color }
        }))
      ]
    };
    new uPlot(opts, data, mount);
  };
  // Ritas först när korten sitter i DOM:en, annars är clientWidth 0.
  requestAnimationFrame(draw);
  let t;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(draw, 150); });
}

function trendCard(title, desc, seriesDefs, yRange) {
  const card = el('div', { class: 'trend-card' },
    el('h3', {}, title), el('p', { class: 'desc' }, desc));

  if (!hasData(...seriesDefs.map((s) => s.values))) {
    card.append(el('p', { class: 'empty' }, 'Inga loggade värden ännu.'));
    return card;
  }

  const mount = el('div');
  card.append(mount);
  if (typeof uPlot !== 'undefined') {
    makeChart(mount, seriesDefs, yRange);
  } else {
    mount.append(el('p', { class: 'empty' }, 'Grafbiblioteket kunde inte laddas — tabellen nedan gäller.'));
  }
  card.append(dataTable(
    ['Vecka', ...seriesDefs.map((s) => s.label)],
    WEEKS.map((w, i) => [w, ...seriesDefs.map((s) => s.values[i])])
  ));
  return card;
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
  const first = seriesFromLogs(logs, 1, (l) => l.metrics && l.metrics.first_serve_pct);
  const second = seriesFromLogs(logs, 1, (l) => l.metrics && l.metrics.second_serve_pct);
  const shoulder = seriesFromLogs(logs, 1, (l) => l.metrics && l.metrics.shoulder_feel);
  const rpe = avgRpePerWeek(logs);

  container.append(
    trendCard('Serve-%', 'Första- och andraserve per vecka (Tennis 1).',
      [
        { label: 'Förstaserve %', values: first, color: COLOR_1 },
        { label: 'Andraserve %', values: second, color: COLOR_2 }
      ],
      () => [0, 100]),
    trendCard('RPE', 'Snittansträngning per vecka, alla loggade pass (1–10).',
      [{ label: 'RPE snitt', values: rpe, color: COLOR_1 }],
      () => [1, 10])
  );

  const shoulderCard = trendCard('Axelkänsla', 'shoulder_feel från servepassen (1 = ont, 5 = toppen).',
    [{ label: 'Axelkänsla', values: shoulder, color: COLOR_1 }],
    () => [1, 5]);
  const warn = shoulderWarning(shoulder);
  if (warn) shoulderCard.append(el('div', { class: 'shoulder-warn' }, `⚠ ${warn}`));
  container.append(shoulderCard);
}
