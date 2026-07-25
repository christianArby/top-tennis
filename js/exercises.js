// Övningslexikon: förklaring, teknik-cues, piktogram (inline-SVG) och videolänk.
// Övningsnamn i planned_detail och profilens tänk-på-texter blir klickbara via
// linkify i app.js; alias matchas med valfri svensk böjningsändelse efter.

// Piktogram-stil: mark + bläckfigur + terracotta för det som rör sig.
const G = (body, accent = '') =>
  '<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">' +
  '<line x1="6" y1="72" x2="114" y2="72" stroke="#e0d5c1" stroke-width="3" stroke-linecap="round"/>' +
  `<g fill="none" stroke="#21372b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${body}</g>` +
  (accent ? `<g fill="none" stroke="#c05a2e" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">${accent}</g>` : '') +
  '</svg>';

export const EXERCISES = {
  deadbug: {
    name: 'Dead bug',
    aliases: ['dead bug'],
    desc: 'Ligg på rygg med armarna mot taket och höfter/knän i 90°. Sträck långsamt ena armen bakåt och motsatt ben framåt — utan att svanken lyfter från golvet. Tillbaka, byt diagonal. Lär djupa bålen hålla ryggen neutral medan armar och ben jobbar.',
    cues: ['Pressa svanken lätt mot golvet — den får aldrig lyfta', 'Långsamt: 3–4 sekunder ut, lika långsamt hem', 'Lyfter svanken? Minska rörelsen — det är där träningen sker'],
    video: 'dead bug exercise form',
    svg: G(
      '<circle cx="18" cy="64" r="5"/><path d="M24,66 H52"/><path d="M30,66 V42"/><path d="M52,66 V46 H66"/>',
      '<path d="M28,64 L10,54"/><path d="M52,66 L80,58"/>'
    )
  },
  hoftlyft: {
    name: 'Höftlyft (glute bridge)',
    aliases: ['höftlyft'],
    desc: 'Ligg på rygg med fötterna i golvet nära rumpan. Pressa upp höften genom hälarna tills kroppen är rak från knä till axel och kläm sätet i toppen. Starka glutes tar över jobbet som ländryggen annars gör.',
    cues: ['Lyft med rumpan, inte genom att svanka', 'Kläm sätet 1–2 sekunder i toppläget', 'Kraften genom hälarna'],
    video: 'glute bridge form',
    svg: G(
      '<circle cx="14" cy="64" r="5"/><path d="M20,68 L52,48 L66,46 L70,70"/><path d="M24,70 H38"/>',
      '<path d="M52,40 V26 M46,32 L52,24 L58,32"/>'
    )
  },
  sidoplanka: {
    name: 'Sidoplanka',
    aliases: ['sidoplanka m. höftlyft', 'sidoplanka'],
    desc: 'Ligg på sidan med armbågen under axeln och lyft höften tills kroppen är en rak linje. Varianten "med höftlyft" sänker och lyfter höften kontrollerat i stället för att bara hålla. Tränar bålen att stå emot sidoböjning.',
    cues: ['Armbågen rakt under axeln', 'Kroppen rak som en sträng — höften varken hänger eller pekar i taket', 'Andas — håll inte andan'],
    video: 'side plank form',
    svg: G(
      '<circle cx="20" cy="45" r="6"/><path d="M22,70 H38"/><path d="M22,70 V53"/><path d="M22,53 L94,67"/>',
      '<path d="M56,48 V36 M50,42 L56,34 L62,42"/>'
    )
  },
  hoftbojarstretch: {
    name: 'Höftböjarstretch',
    aliases: ['höftböjarstretch'],
    desc: 'Knästående utfall: ena knät i golvet, andra foten framför dig. Spänn sätet och skjut höften försiktigt framåt tills det sträcker på framsidan av höften/låret på det knästående benet. Håll 30 sekunder per sida. Din viktigaste stretch för ländryggen.',
    cues: ['Spänn rumpan — det är den som skapar sträckan', 'Svanka inte: överkroppen upprätt, bålen lätt spänd', 'Mjukt underlag under knät'],
    video: 'half kneeling hip flexor stretch',
    svg: G(
      '<circle cx="54" cy="14" r="6"/><path d="M54,20 V46"/><path d="M54,46 L38,52 L35,70"/><path d="M54,46 L68,70"/><path d="M54,26 L46,38"/>',
      '<path d="M60,56 H74 M68,50 L76,56 L68,62"/>'
    )
  },
  pallof: {
    name: 'Pallof press',
    aliases: ['pallof'],
    desc: 'Stå i sidled mot ett gummiband fäst i brösthöjd. Håll bandet med båda händerna mot bröstet och pressa armarna rakt fram — bandet vill vrida dig, du håller emot. Anti-rotation: bromsen för all kraft du skapar i forehand och serve.',
    cues: ['Pressa långsamt ut, håll 2 sekunder, långsamt hem', 'Höfter och axlar pekar rakt fram hela tiden', 'Stå axelbrett med lätt böjda knän'],
    video: 'pallof press form',
    svg: G(
      '<circle cx="45" cy="16" r="6"/><path d="M45,22 V50"/><path d="M45,50 L38,70 M45,50 L52,70"/><path d="M45,32 H72"/>',
      '<path d="M74,30 L112,14" stroke-dasharray="5 5"/>'
    )
  },
  hollowhold: {
    name: 'Hollow hold',
    aliases: ['hollow hold'],
    desc: 'Ligg på rygg, pressa svanken i golvet och lyft skulderblad och raka ben lågt över golvet, armarna sträckta bakom huvudet. Håll positionen. Gymnastens grundläge för en stel, stark bål.',
    cues: ['Svanken FÅR inte lämna golvet — böj knäna om den gör det', 'Sträva lång: fingrar och tår ifrån varandra', 'Skaka är okej, tappad svank är det inte'],
    video: 'hollow body hold',
    svg: G(
      '<circle cx="18" cy="47" r="5"/><path d="M24,52 Q38,64 55,68"/><path d="M55,68 Q74,62 92,50"/>',
      '<path d="M22,50 L6,42"/>'
    )
  },
  bandrotation: {
    name: 'Bandutåtrotation',
    aliases: ['bandutåtrotation'],
    desc: 'Fäst ett gummiband i midjehöjd. Håll armbågen böjd 90° och tryckt mot sidan, rotera underarmen utåt mot bandets motstånd och släpp långsamt tillbaka. Bygger utåtrotatorerna i rotatorkuffen — axelns skydd i serven.',
    cues: ['Armbågen limmad mot revbenen (kläm en handduk där)', 'Långsamt tillbaka — bromsfasen är halva övningen', 'Lätt motstånd, perfekt kontroll'],
    video: 'band external rotation shoulder',
    svg: G(
      '<circle cx="45" cy="16" r="6"/><path d="M45,22 V48"/><path d="M45,48 L38,70 M45,48 L52,70"/><path d="M45,28 L50,42 L72,38"/>',
      '<path d="M74,38 L110,32" stroke-dasharray="5 5"/><path d="M64,52 A16,16 0 0 0 76,44"/>'
    )
  },
  bulgarian: {
    name: 'Bulgarian split squat',
    aliases: ['bulgarian split squat'],
    desc: 'Stå ett stort steg framför en bänk med bakre fotens vrist vilande på den. Sjunk rakt ner tills främre låret är nära parallellt med golvet, pressa upp igen. Enbensstyrka för tennisens utfall och stopp.',
    cues: ['Vikten på hela främre foten, tryck genom hälen', 'Knät följer tålinjen — faller inte inåt', 'Rakt ner, inte framåt'],
    video: 'bulgarian split squat form',
    svg: G(
      '<rect x="84" y="58" width="26" height="8" rx="2" stroke="none" fill="#e0d5c1"/><circle cx="48" cy="14" r="6"/><path d="M48,20 L50,42"/><path d="M50,42 L36,50 L36,70"/><path d="M50,42 L66,54 L86,58"/><path d="M49,26 L42,38"/>',
      '<path d="M22,44 V58 M16,52 L22,60 L28,52"/>'
    )
  },
  pullups: {
    name: 'Pull-ups / negativa',
    aliases: ['pull-ups/negativa', 'pull-ups'],
    desc: 'Häng i ett räcke med raka armar och dra bröstet upp mot stången. Orkar du inga hela: hoppa upp till toppläget och sänk dig så långsamt du kan (negativa) — det bygger samma styrka.',
    cues: ['Starta varje rep från helt raka armar', 'Dra armbågarna ner mot fickorna', 'Inga gungande höfter — spänn bålen'],
    video: 'pull up form negatives',
    svg: G(
      '<path d="M28,8 H92" stroke-width="3"/><circle cx="60" cy="22" r="6"/><path d="M46,8 L55,27 M74,8 L65,27"/><path d="M60,28 V48"/><path d="M60,48 L52,62 L56,70"/>',
      '<path d="M98,46 V28 M92,34 L98,26 L104,34"/>'
    )
  },
  pikepushups: {
    name: 'Pike push-ups',
    aliases: ['deficit/pike push-ups', 'pike push-ups'],
    desc: 'Armhävning i uppochnedvänt V: händer och fötter i golvet, höften så högt du kan. Sänk hjässan mot golvet mellan händerna och pressa upp. Belastar axlarna som en press — servens styrkeövning. Deficit = händerna på en upphöjning för större rörelse.',
    cues: ['Höften pekar mot taket hela setet', 'Hjässan landar framför händerna, inte mellan fötterna', 'Hela vägen upp till raka armar'],
    video: 'pike push up form',
    svg: G(
      '<circle cx="32" cy="63" r="5"/><path d="M24,70 L38,52 L62,28"/><path d="M62,28 L92,68"/>',
      '<path d="M12,50 V62 M6,56 L12,64 L18,56"/>'
    )
  },
  pushups: {
    name: 'Push-ups',
    aliases: ['push-ups'],
    desc: 'Klassisk armhävning: rak kropp från hjässa till häl, sänk bröstet mot golvet och pressa upp.',
    cues: ['Spänn säte och mage — höften varken hänger eller pekar upp', 'Armbågarna ~45° från kroppen', 'Hela vägen ner, bröstet först'],
    video: 'push up perfect form',
    svg: G(
      '<circle cx="20" cy="48" r="6"/><path d="M27,52 L94,62"/><path d="M30,54 L28,70"/><path d="M94,62 L98,70"/>',
      '<path d="M56,42 V32 M50,38 L56,30 L62,38"/>'
    )
  },
  medbollslam: {
    name: 'Medbollslam',
    aliases: ['medbollslam'],
    desc: 'Lyft medicinbollen högt över huvudet med hela kroppen sträckt, och slå den i golvet framför dig med full kraft från bål och höft. Fånga bollen i studsen och upprepa. Ren explosivitet för serve och smash.',
    cues: ['Sträck dig LÅNG innan slaget — kraften börjar i tårna', 'Bålen slår, armarna följer med', 'Full intention varje rep — det här är inte flås, det är kraft'],
    video: 'medicine ball slam',
    svg: G(
      '<circle cx="58" cy="22" r="6"/><path d="M58,28 V50"/><path d="M58,50 L50,70 M58,50 L66,70"/><path d="M58,32 L68,16 M58,32 L74,20"/>',
      '<circle cx="74" cy="12" r="5"/><path d="M88,24 V44 M82,38 L88,46 L94,38"/>'
    )
  },
  rotationskast: {
    name: 'Rotationskast',
    aliases: ['rotationskast'],
    desc: 'Stå i sidled mot en vägg med medicinbollen i höfthöjd. Rotera upp genom höft och bål och kasta bollen explosivt mot väggen, ta emot returen och kör direkt igen. Det här är forehandens och servens rotationskraft i renodlad form.',
    cues: ['Kraften startar i höften — armarna levererar bara', 'Stå kvar stabilt med fötterna, rotera överkroppen', 'Kasta genom bollen, inte till den'],
    video: 'medicine ball rotational wall throw',
    svg: G(
      '<path d="M108,18 V70" stroke-width="3"/><circle cx="38" cy="18" r="6"/><path d="M38,24 V48"/><path d="M38,48 L30,70 M38,48 L46,70"/><path d="M38,30 L58,28"/>',
      '<circle cx="66" cy="27" r="5"/><path d="M74,26 H98 M92,20 L100,26 L92,32" stroke-dasharray="5 4"/>'
    )
  },
  knabojshopp: {
    name: 'Knäböjshopp / boxhopp',
    aliases: ['knäböjshopp'],
    desc: 'Sjunk ner i knäböj och exploderar rakt upp i ett maxhopp (eller upp på en låda). Landa mjukt i knäböj och samla dig innan nästa. Benens spänst — det som ger dig första steget och serve-uppdriften.',
    cues: ['Landa mjukt och tyst i knäböj', 'Full sträckning i toppen — höft, knä, vrist', 'Kvalitet före flås: vila mellan repsen'],
    video: 'jump squat box jump form',
    svg: G(
      '<circle cx="54" cy="26" r="6"/><path d="M54,32 L50,48"/><path d="M50,48 L62,54 L58,70"/><path d="M53,36 L68,32"/>',
      '<path d="M86,52 V28 M80,36 L86,26 L92,36" stroke-dasharray="5 4"/>'
    )
  },
  utfallssteg: {
    name: 'Utfallssteg',
    aliases: ['utfallssteg'],
    desc: 'Ta ett stort kliv framåt och sjunk tills bakre knät nästan nuddar golvet, tryck tillbaka till stående (eller gå vidare framåt). Enbensstyrka och balans för tennisens utfallssteg mot kort boll.',
    cues: ['Främre knät i tålinjen', 'Överkroppen upprätt — sjunk ner, luta inte fram', 'Tryck tillbaka genom främre hälen'],
    video: 'walking lunge form',
    svg: G(
      '<circle cx="52" cy="11" r="6"/><path d="M52,17 V44"/><path d="M52,44 L36,50 L34,70"/><path d="M52,44 L66,60 L74,70"/><path d="M52,24 L44,36"/>',
      '<path d="M80,40 H94 M88,34 L96,40 L88,46"/>'
    )
  },
  utfallshopp: {
    name: 'Utfallshopp',
    aliases: ['utfallshopp'],
    desc: 'Stå i utfallsposition, exploderar rakt upp och byt ben i luften, landa mjukt i utfall med andra benet fram. Pliometrisk benkraft + fotarbete under trötthet.',
    cues: ['Mjuk, kontrollerad landning — hitta balansen innan nästa hopp', 'Kort markkontakt, direkt upp igen', 'Håll överkroppen lugn och upprätt'],
    video: 'jumping lunge form',
    svg: G(
      '<circle cx="52" cy="11" r="6"/><path d="M52,17 V44"/><path d="M52,44 L36,50 L34,70"/><path d="M52,44 L66,60 L74,70"/><path d="M52,24 L44,36"/>',
      '<path d="M88,54 V30 M82,38 L88,28 L94,38" stroke-dasharray="5 4"/>'
    )
  },
  intervaller: {
    name: 'Intervaller 20/40',
    aliases: ['intervaller'],
    desc: '20 sekunder högt tempo — löpning, cykel eller skuggtennis med riktiga split-steps — följt av 40 sekunder vila. Upprepa enligt passet. Det här bygger konditionen som håller ditt fotarbete levande i tredje set.',
    cues: ['De 20 sekunderna ska vara jobbiga på riktigt', 'Håll tekniken snygg även när du är trött — det är hela poängen', 'Skuggtennis med split-step är mest tennisspecifikt'],
    video: 'tennis footwork interval training',
    svg: G(
      '<circle cx="52" cy="16" r="6"/><path d="M52,22 L46,44"/><path d="M49,28 L62,34 M49,28 L37,36"/><path d="M46,44 L60,52 L64,68"/><path d="M46,44 L33,54 L26,66"/>',
      '<path d="M10,26 H22 M8,34 H20"/>'
    )
  },
  hopprep: {
    name: 'Hopprep',
    aliases: ['hopprep'],
    desc: 'Låga, snabba hopp på fotbladen medan repet snurras från handlederna. Uppvärmning som väcker vader, fötter och rytm — samma studs som i split-steppet.',
    cues: ['Låga hopp — bara några centimeter', 'Snurra från handlederna, inte armarna', 'Mjuka knän, landa på fotbladen'],
    video: 'jump rope basics',
    svg: G(
      '<circle cx="60" cy="18" r="6"/><path d="M60,24 V46"/><path d="M60,46 L54,68 M60,46 L66,68"/><path d="M60,30 L48,40 M60,30 L72,40"/>',
      '<path d="M48,40 Q60,88 72,40" stroke-width="2.5"/>'
    )
  },
  volley: {
    name: 'Volley',
    aliases: ['volley'],
    desc: 'Slaget vid nät innan bollen studsar. Ingen sving — en kort, bestämd "punch" framåt med racketen framför kroppen och kontinentalt grepp. Din nyckel till att nätattackerna ska betala sig.',
    cues: ['Kort rörelse — möt bollen framför kroppen, följ inte igenom', 'Kontinentalt grepp (samma som serve)', 'Split-step i samma ögonblick som motståndaren träffar'],
    video: 'tennis volley technique'
  },
  overhead: {
    name: 'Overhead / smash',
    aliases: ['overhead'],
    desc: 'Smashen mot lobb. Tekniskt en serve i spel: vänd sidan till direkt, hitta bollen tidigt och slå med samma avslappnade armrörelse som serven. Tryggheten här är det som gör att motståndare slutar lobba dig vid nät.',
    cues: ['Vänd sidan till OMEDELBART när lobben kommer', 'Peka på bollen med fria handen medan du backar', 'Slå som din serve — den är redan bra'],
    video: 'tennis overhead smash technique'
  },
  splitstep: {
    name: 'Split-step',
    aliases: ['split-step'],
    desc: 'Det lilla tvåfotshoppet precis innan motståndaren träffar bollen — du landar brett och lågt exakt när bollens riktning avslöjas och kan explodera åt rätt håll. Fotarbetets viktigaste vana.',
    cues: ['Timing: hoppa när motståndaren påbörjar sitt slag, landa vid träffen', 'Landa brett och lågt på fotbladen', 'Före VARJE motståndarslag — även när du är trött'],
    video: 'tennis split step timing',
    svg: G(
      '<circle cx="60" cy="20" r="6"/><path d="M60,26 V44"/><path d="M60,44 L46,68 M60,44 L74,68"/><path d="M60,32 L48,40 M60,32 L72,40"/>',
      '<path d="M30,52 V62 M24,58 L30,64 L36,58"/><path d="M90,52 V62 M84,58 L90,64 L96,58"/>'
    )
  },
  serveplus1: {
    name: 'Serve+1',
    aliases: ['serve+1'],
    desc: 'Serven och det första slaget efter den som ETT mönster: du bestämmer före serven var både serven och nästa boll ska. Exempel: serve ut åt sidan → forehand i den öppna banan. Så blir din serve till vunna poäng i stället för bara bra bollar.',
    cues: ['Bestäm mönstret INNAN du kastar upp bollen', 'Servens placering öppnar banan — ettan stänger poängen', 'Samma mönster tills motståndaren löser det'],
    video: 'serve plus one tennis pattern'
  }
};

// Aliaslista sorterad längst först, så "pike push-ups" vinner över "push-ups" osv.
const ALIASES = Object.entries(EXERCISES)
  .flatMap(([key, ex]) => ex.aliases.map((alias) => ({ alias, key })))
  .sort((a, b) => b.alias.length - a.alias.length);

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Matchar alias + valfri svensk ändelse ("höftböjarstretchen", "volleygrund").
export function exercisePattern() {
  return new RegExp(`(?:${ALIASES.map((a) => esc(a.alias)).join('|')})[a-zåäö]*`, 'gi');
}

export function exerciseKeyFor(matchedText) {
  const lower = matchedText.toLowerCase();
  const hit = ALIASES.find((a) => lower.startsWith(a.alias.toLowerCase()));
  return hit ? hit.key : null;
}
