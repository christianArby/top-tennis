// Serven: Christians bildrutor bredvid Sinners.
//
// Christians rutor ligger i img/serve (ur hans egen slow motion-film, 2026-11-03).
// Sinner visas via YouTubes inbäddning som hoppar till motsvarande fas i klippet —
// stillbilder ur klippet publiceras inte, det är inte vårt material.

import { el } from './dom.js';

const SINNER_ID = 'Xuq5TWBVPm4';

// `t` = sekund i Sinner-klippet (det går i slow motion).
const PHASES = [
  { img: 'c1', title: 'Kastet', t: 3.0,
    note: 'Båda släpper bollen med rak arm. Skillnaden: Sinner har redan börjat böja knäna.' },
  { img: 'c2', title: 'Trofén', t: 5.0,
    note: 'Du: knäna lätt böjda, axlarna vågräta, bröstet mot nätet. Sinner: djup böj, ryggen mot nätet, kastaxeln högt över slagaxeln.' },
  { img: 'c3', title: 'Pausen', t: 5.6,
    note: 'Du står kvar 0,3–0,5 s medan racketen glider ner till horisontellt. Sinner står aldrig stilla — han böjer fortfarande.' },
  { img: 'c4', title: 'Droppen', t: 6.2,
    note: 'Hos Sinner faller racketen när benen sträcks — kroppen åker upp, racketen lämnas kvar. Hos dig har den redan sjunkit under pausen.' },
  { img: 'c5', title: 'Benen går', t: 6.8,
    note: 'Du lättar precis från marken, ett litet hopp. Sinner är redan i luften med racketen djupt bakom ryggen.' },
  { img: 'c6', title: 'Träffen', t: 7.4,
    note: 'Lika: hög träff framför kroppen, full sträckning, pronation. Här är du bra.' },
  { img: 'c7', title: 'Uppföljningen', t: 8.0,
    note: 'Båda landar på vänster fot med höger ben bakåt.' }
];

function seek(frame, t) {
  const cmd = (func, args = []) =>
    frame.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
  cmd('seekTo', [t, true]);
  cmd('pauseVideo');
}

export function serveCard() {
  let active = 2; // Pausen — det vi jobbar på
  const frame = el('iframe', {
    class: 'serve-sinner',
    src: `https://www.youtube.com/embed/${SINNER_ID}?enablejsapi=1&start=${Math.floor(PHASES[active].t)}&rel=0`,
    title: 'Jannik Sinner, serve i slow motion',
    allow: 'autoplay; encrypted-media; picture-in-picture',
    allowfullscreen: ''
  });
  const you = el('img', { class: 'serve-you', alt: 'Christian, serve' });
  const caption = el('b');
  const note = el('p', { class: 'serve-note' });
  const strip = el('div', { class: 'serve-strip' });
  const thumbs = PHASES.map((ph, i) => el('button', {
    type: 'button', class: 'serve-thumb', onclick: () => show(i)
  }, el('img', { src: `img/serve/${ph.img}.jpg`, alt: ph.title }), el('span', {}, ph.title)));
  strip.append(...thumbs);

  function show(i, scrub = true) {
    active = i;
    const ph = PHASES[i];
    you.src = `img/serve/${ph.img}.jpg`;
    caption.textContent = ph.title;
    note.textContent = ph.note;
    thumbs.forEach((b, j) => b.classList.toggle('active', j === i));
    if (scrub) seek(frame, ph.t);
  }
  show(active, false);

  return el('div', { class: 'trend-card serve-card' },
    el('h3', {}, 'Serven: du och Sinner'),
    el('p', { class: 'desc' }, 'Välj en fas — din bild byts och Sinner-klippet hoppar till samma läge. Starta klippet själv första gången.'),
    strip,
    el('div', { class: 'serve-pair' },
      el('figure', {}, you, el('figcaption', {}, 'Du · ', caption)),
      el('figure', {}, frame, el('figcaption', {}, 'Sinner · slow motion'))),
    note,
    el('p', { class: 'serve-foot' }, 'Härma rytmen, inte knädjupet: ett flöde ner och upp, utan stopp. Lägre kast, ingen paus.'));
}
