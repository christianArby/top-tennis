// Serven: Christians bildrutor bredvid proffsens.
//
// Christians rutor ligger i img/serve (ur hans egen slow motion-film, 2026-11-03).
// Proffsen visas via YouTubes inbäddning som hoppar till motsvarande fas i klippet —
// stillbilder ur klippen publiceras inte, det är inte vårt material.

import { el } from './dom.js';

// `t` per proffs = sekund i klippet där fasen syns.
const PROS = {
  sinner: { label: 'Sinner', video: 'Xuq5TWBVPm4', caption: 'Sinner · slow motion',
    summary: 'Härma rytmen, inte knädjupet: ett flöde ner och upp, utan stopp. Lägre kast, ingen paus.' },
  ruud: { label: 'Ruud', video: 'vPVfAnzwP78', caption: 'Ruud · verklig hastighet', end: 18, wide: true,
    summary: 'Från kast till träff: Ruud ≈ 0,75 s, du ≈ 0,9 s. Nästan samma tid — men han böjer hela vägen, du böjer färdigt och väntar.' }
};

const PHASES = [
  { img: 'c1', title: 'Kastet',
    sinner: { t: 3.0, note: 'Båda släpper bollen med rak arm. Skillnaden: Sinner har redan börjat böja knäna.' },
    ruud: { t: 8.3, note: 'Ruud släpper bollen lägre än du, och knäna börjar böja redan medan kastarmen går upp.' } },
  { img: 'c2', title: 'Trofén',
    sinner: { t: 5.0, note: 'Du: knäna lätt böjda, axlarna vågräta, bröstet mot nätet. Sinner: djup böj, ryggen mot nätet, kastaxeln högt över slagaxeln.' },
    ruud: { t: 8.6, note: 'Du: lätt böj, rak överkropp. Ruud: tydlig knäböj, svankad rygg och slagaxeln lågt — kroppen är en båge innan racketen ens är uppe.' } },
  { img: 'c3', title: 'Pausen',
    sinner: { t: 5.6, note: 'Du står kvar 0,3–0,5 s medan racketen glider ner till horisontellt. Sinner står aldrig stilla — han böjer fortfarande.' },
    ruud: { t: 8.75, note: 'Här står du stilla. Ruud är i sin djupaste knäböj — och han har inte stannat, det är ett ögonblick på väg ner, inte en position.' } },
  { img: 'c4', title: 'Droppen',
    sinner: { t: 6.2, note: 'Hos Sinner faller racketen när benen sträcks — kroppen åker upp, racketen lämnas kvar. Hos dig har den redan sjunkit under pausen.' },
    ruud: { t: 8.85, note: 'Racketen börjar falla i samma ögonblick som benen vänder uppåt. Hos dig har den hunnit glida ner under pausen.' } },
  { img: 'c5', title: 'Benen går',
    sinner: { t: 6.8, note: 'Du lättar precis från marken, ett litet hopp. Sinner är redan i luften med racketen djupt bakom ryggen.' },
    ruud: { t: 8.95, note: 'Ruud lämnar marken med racketen djupt bakom ryggen — benstöten och droppen är samma rörelse. Du lättar först efter droppen.' } },
  { img: 'c6', title: 'Träffen',
    sinner: { t: 7.4, note: 'Lika: hög träff framför kroppen, full sträckning, pronation. Här är du bra.' },
    ruud: { t: 9.05, note: 'Lika: hög träff framför kroppen, full sträckning. Här är du bra.' } },
  { img: 'c7', title: 'Uppföljningen',
    sinner: { t: 8.0, note: 'Båda landar på vänster fot med höger ben bakåt.' },
    ruud: { t: 9.3, note: 'Båda landar på vänster fot. Ruud faller in i banan — farten fortsätter framåt.' } }
];

function embedUrl(pro, t) {
  const end = pro.end ? `&end=${pro.end}` : '';
  return `https://www.youtube.com/embed/${pro.video}?enablejsapi=1&start=${Math.floor(t)}${end}&rel=0`;
}

function seek(frame, t) {
  const cmd = (func, args = []) =>
    frame.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
  cmd('seekTo', [t, true]);
  cmd('pauseVideo');
}

export function serveCard() {
  let active = 2; // Pausen — det vi jobbar på
  let proId = 'sinner';

  const frame = el('iframe', {
    class: 'serve-sinner',
    title: 'Proffsets serve',
    allow: 'autoplay; encrypted-media; picture-in-picture',
    allowfullscreen: ''
  });
  const you = el('img', { class: 'serve-you', alt: 'Christian, serve' });
  const caption = el('b');
  const proCaption = el('figcaption');
  const note = el('p', { class: 'serve-note' });
  const summary = el('p', { class: 'serve-foot' });
  const pair = el('div', { class: 'serve-pair' },
    el('figure', {}, you, el('figcaption', {}, 'Du · ', caption)),
    el('figure', {}, frame, proCaption));

  const thumbs = PHASES.map((ph, i) => el('button', {
    type: 'button', class: 'serve-thumb', onclick: () => show(i)
  }, el('img', { src: `img/serve/${ph.img}.jpg`, alt: ph.title }), el('span', {}, ph.title)));
  const strip = el('div', { class: 'serve-strip' }, ...thumbs);

  const proBtns = Object.entries(PROS).map(([id, pro]) => el('button', {
    type: 'button', class: 'serve-pro', onclick: () => pick(id)
  }, pro.label));

  function show(i, scrub = true) {
    active = i;
    const ph = PHASES[i];
    you.src = `img/serve/${ph.img}.jpg`;
    caption.textContent = ph.title;
    note.textContent = ph[proId].note;
    thumbs.forEach((b, j) => b.classList.toggle('active', j === i));
    if (scrub) seek(frame, ph[proId].t);
  }

  function pick(id) {
    proId = id;
    const pro = PROS[id];
    frame.src = embedUrl(pro, PHASES[active][id].t);
    frame.title = `${pro.label}, serve`;
    proCaption.textContent = pro.caption;
    summary.textContent = pro.summary;
    pair.classList.toggle('wide', !!pro.wide); // liggande klipp: lika höjd, inte lika bredd
    proBtns.forEach((b) => b.classList.toggle('active', b.textContent === pro.label));
    show(active, false);
  }
  pick(proId);

  return el('div', { class: 'trend-card serve-card' },
    el('h3', {}, 'Serven: du och proffsen'),
    el('p', { class: 'desc' }, 'Välj en fas — din bild byts och klippet hoppar till samma läge. Starta klippet själv första gången.'),
    strip,
    el('div', { class: 'serve-pros' }, el('span', { class: 'entry-label' }, 'Jämför med'), ...proBtns),
    pair,
    note,
    summary);
}
