/**
 * Daily endurance quote — 20 attributable, well-documented quotes from
 * runners, coaches and a couple of sports physicians, surfaced on the
 * home page. The same quote is shown to all visitors on a given UTC day
 * (deterministic by day-of-year), so the page is cacheable without
 * personalisation.
 *
 * Source policy: every quote is something the named person is widely
 * documented to have said or written. We translate freely into French
 * while staying faithful to the original meaning.
 */

export interface DailyQuote {
  fr: string;
  en: string;
  author: string;
  /** Short role / context shown as a mono uppercase eyebrow. */
  role: { fr: string; en: string };
}

export const QUOTES: DailyQuote[] = [
  {
    fr: "« Aucun humain n'est limité. »",
    en: "“No human is limited.”",
    author: "Eliud Kipchoge",
    role: { fr: "Marathonien · INEOS 1:59", en: "Marathoner · INEOS 1:59" },
  },
  {
    fr: "« Seuls les disciplinés sont libres dans la vie. »",
    en: "“Only the disciplined ones are free in life.”",
    author: "Eliud Kipchoge",
    role: { fr: "Marathonien", en: "Marathoner" },
  },
  {
    fr: "« Donner moins que son meilleur, c'est sacrifier le don qu'on a reçu. »",
    en: "“To give anything less than your best is to sacrifice the gift.”",
    author: "Steve Prefontaine",
    role: { fr: "Coureur de fond américain", en: "American distance runner" },
  },
  {
    fr: "« Si tu veux gagner quelque chose, cours un 100 mètres. Si tu veux vivre quelque chose, cours un marathon. »",
    en: "“If you want to win something, run 100 metres. If you want to experience something, run a marathon.”",
    author: "Emil Zátopek",
    role: { fr: "Triple champion olympique · 1952", en: "Triple Olympic champion · 1952" },
  },
  {
    fr: "« L'esprit est tout. Les muscles ne sont que des morceaux de caoutchouc. Tout ce que je suis, je le dois à mon esprit. »",
    en: "“Mind is everything. Muscles—pieces of rubber. All that I am, I am because of my mind.”",
    author: "Paavo Nurmi",
    role: { fr: "Neuf médailles d'or olympiques", en: "Nine Olympic gold medals" },
  },
  {
    fr: "« Celui qui sait se pousser plus loin quand l'effort devient douloureux est celui qui gagnera. »",
    en: "“The man who can drive himself further once the effort gets painful is the man who will win.”",
    author: "Roger Bannister",
    role: { fr: "Premier mile sous 4 minutes · 1954", en: "First sub-4 mile · 1954" },
  },
  {
    fr: "« Si tu as un corps, tu es un athlète. »",
    en: "“If you have a body, you are an athlete.”",
    author: "Bill Bowerman",
    role: { fr: "Coach · cofondateur de Nike", en: "Coach · Nike co-founder" },
  },
  {
    fr: "« S'entraîner, c'est avant tout un acte de foi. »",
    en: "“Training is principally an act of faith.”",
    author: "Jack Daniels",
    role: { fr: "Physiologiste · Daniels' Running Formula", en: "Physiologist · Daniels' Running Formula" },
  },
  {
    fr: "« Les kilomètres font les champions. »",
    en: "“Mileage makes champions.”",
    author: "Arthur Lydiard",
    role: { fr: "Coach néo-zélandais", en: "New Zealand coach" },
  },
  {
    fr: "« Entraîne-toi, sans te briser. »",
    en: "“Train, don't strain.”",
    author: "Arthur Lydiard",
    role: { fr: "Coach néo-zélandais", en: "New Zealand coach" },
  },
  {
    fr: "« Je ne me vois pas comme un athlète merveilleusement doué — mais comme un compétiteur merveilleusement doué. »",
    en: "“I don’t see myself as a wonderfully gifted athlete. I see myself as a wonderfully gifted aggressor.”",
    author: "Sebastian Coe",
    role: { fr: "Double champion olympique du 1500 m", en: "Double Olympic 1500 m champion" },
  },
  {
    fr: "« Il faut oublier son dernier marathon avant d'en tenter un autre. Le mental ne peut pas savoir ce qui vient. »",
    en: "“You have to forget your last marathon before you try another. Your mind can’t know what’s coming.”",
    author: "Frank Shorter",
    role: { fr: "Champion olympique du marathon · 1972", en: "Olympic marathon champion · 1972" },
  },
  {
    fr: "« Le marathon a tout : du drame, de la compétition, de la camaraderie, de l'héroïsme. »",
    en: "“The marathon is a charismatic event. It has everything: drama, competition, camaraderie, heroism.”",
    author: "Joan Benoit Samuelson",
    role: { fr: "Première championne olympique du marathon · 1984", en: "First Olympic women’s marathon champion · 1984" },
  },
  {
    fr: "« Nous sommes tous des athlètes. La seule différence : certains s'entraînent, d'autres non. »",
    en: "“We are all athletes. The only difference is that some of us are in training, and some are not.”",
    author: "George Sheehan",
    role: { fr: "Cardiologue · écrivain runner", en: "Cardiologist · running writer" },
  },
  {
    fr: "« Quelque part en chemin, on a confondu le confort avec le bonheur. »",
    en: "“Somewhere along the line we seem to have confused comfort with happiness.”",
    author: "Dean Karnazes",
    role: { fr: "Ultramarathonien", en: "Ultramarathoner" },
  },
  {
    fr: "« Si tu perds foi en la nature humaine, va regarder un marathon. »",
    en: "“If you are losing faith in human nature, go out and watch a marathon.”",
    author: "Kathrine Switzer",
    role: { fr: "Première femme dossard à Boston · 1967", en: "First numbered woman at Boston · 1967" },
  },
  {
    fr: "« Jusqu'à mon dernier souffle, je vais courir. »",
    en: "“Until I am dying, I am going to run.”",
    author: "Haile Gebrselassie",
    role: { fr: "Deux fois champion olympique du 10 000 m", en: "Two-time Olympic 10 000 m champion" },
  },
  {
    fr: "« Le mile a tous les ingrédients d'un drame. »",
    en: "“The mile has all the elements of a drama.”",
    author: "Hicham El Guerrouj",
    role: { fr: "Record du monde du mile · 3:43", en: "World mile record · 3:43" },
  },
  {
    fr: "« Je cours parce que c'est tellement symbolique de la vie. Il faut se pousser pour surmonter les obstacles. »",
    en: "“I run because it’s so symbolic of life. You have to drive yourself to overcome the obstacles.”",
    author: "Paula Radcliffe",
    role: { fr: "Record du monde du marathon · 2:15:25", en: "World marathon record · 2:15:25" },
  },
  {
    fr: "« Cours pour gagner — même si tu finis dernier. »",
    en: "“Run to win—even if you finish last.”",
    author: "Meb Keflezighi",
    role: { fr: "Vainqueur du marathon de Boston · 2014", en: "Boston Marathon winner · 2014" },
  },
];

/**
 * Pick the quote of the day. Deterministic per UTC calendar day so the
 * static prerender shows the same quote everyone sees on that day.
 */
export function getQuoteOfTheDay(now: Date = new Date()): DailyQuote {
  const start = Date.UTC(now.getUTCFullYear(), 0, 1);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const day = Math.floor((today - start) / 86_400_000);
  return QUOTES[((day % QUOTES.length) + QUOTES.length) % QUOTES.length];
}
