// Spelarprofil för Profil-fliken. Publicerad med Christians godkännande.
// Den fulla intervjun ligger lokalt i coach/spelarprofil.md (gitignorerad).

export const PROFILE = {
  background:
    'Spelat sedan 2012, betydligt mer de senaste åren — vuxentennis plus ' +
    'gruppspel i Gustavsbergs TK. Racket: Yonex Ezone 98, 2025 och 2026.',
  goals: [
    'Vinna matcher — klättra från grupp 3 mot grupp 2 i gruppspelet',
    'Bli nätspelare: attack på kort boll → volley/overhead som vana',
    'Backhand-förtroende: driva under press i stället för räddnings-slice',
    'Kondition och fotarbete som håller hela matchen'
  ],
  strengths: [
    'Forehand — vapnet, attackerar korta bollar',
    'Serve: förstaserve uppåt 140 km/h, andraserve ~120',
    'Enhandsbackhand (medvetet upptränad)',
    'Stoppboll med forehand',
    'Stark överkropp'
  ],
  focus: [
    { title: 'Nätattack på varje kort boll',
      detail: 'Forehand-attack → följ med in → avsluta med volley. Räkna dina nätattacker på Tennis 2 — vanan ska bli en siffra som växer.' },
    { title: 'Driv backhanden',
      detail: 'Slice bara som medvetet val, aldrig av tvekan. Den håller — lita på den.' },
    { title: 'Ge inte gratis fart',
      detail: 'Variera höjd, skruv och tempo så motståndaren inte kan låna din kraft i returerna.' },
    { title: 'Matchplan på tre punkter',
      detail: 'Skriv den innan matchen, utvärdera efteråt. Taktik vinner gruppspel — inte fina slag.' },
    { title: 'Split-step även när du är trött',
      detail: 'Fotarbetet försvinner med tröttheten — det är därför fys-passens intervaller finns.' },
    { title: 'Lyssna på axeln',
      detail: 'Logga axelkänslan efter varje servepass. Trendar den nedåt sänks serveintensiteten — inga hjältedåd.' },
    { title: 'Skydda ländryggen',
      detail: 'Dead bug och höftlyft är ryggens grundskydd, och höftböjarstretchen efter fyspasset är inte valfri. Bålen ska stå emot rörelse — svanken stannar i golvet på varje dead bug-rep.' }
  ]
};

// Inför nästa match: tänk-på-punkter ur Winning Ugly (Gilbert) och The Inner Game
// of Tennis (Gallwey), med egna ord. Kortet visas t.o.m. matchdagen.
export const NEXT_MATCH = {
  date: '2026-11-08',
  title: 'Inför nästa match',
  when: 'Söndag 8 nov kl 17 · gruppspel',
  points: [
    { src: 'Gilbert', title: 'Plan A klar innan du går in',
      detail: 'Serve och forehand är vapnen. Varje kort boll: attack och fram till nät. Ha en plan B om det inte fungerar.' },
    { src: 'Gilbert', title: 'Scouta de första gamen',
      detail: 'Vilken sida är svagast? Rör han sig sämre framåt eller bakåt? Spela dina styrkor mot hans svagheter.' },
    { src: 'Gilbert', title: 'Ändra aldrig ett vinnande spel',
      detail: 'Leder du — fortsätt attackera. Börja inte spela säkert. Ändra bara när något slutar fungera.' },
    { src: 'Gilbert', title: 'Nyckelpoängen avgör',
      detail: 'På 30-30, breakbollar och i tiebreak: förstaserven i, inga gratispoäng — men håll fast vid planen.' },
    { src: 'Gallwey', title: 'Studs — slag',
      detail: 'Säg tyst "studs" när bollen studsar och "slag" när den träffas. Tankarna på tabellen får ingen plats.' },
    { src: 'Gallwey', title: 'Observera, döm inte',
      detail: 'Efter en miss: notera vad som hände ("sen", "lång") och släpp det. Kroppen rättar till resten.' },
    { src: 'Gallwey', title: 'Lita på bilden',
      detail: 'Coila, ladda, slå av party-hatten. En bild i huvudet, inte en checklista.' },
    { src: 'Gallwey', title: 'Nerver betyder att du bryr dig',
      detail: 'Du är taggad, inte rädd. Fokus på nästa boll — resultatet sköter sig självt.' }
  ]
};
