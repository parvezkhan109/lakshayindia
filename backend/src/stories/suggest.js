const { STORY_LIBRARY } = require('./library');

function mulberry32(seed) {
  // Small deterministic PRNG for stable suggestions per slot.
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromSlot(date, hour) {
  const str = `${date}:${hour}`;
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickDistinctTemplates(rng, count) {
  const pool = [...STORY_LIBRARY];
  const picked = [];
  while (pool.length > 0 && picked.length < count) {
    const idx = Math.floor(rng() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}

function titleCase(s) {
  return String(s || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function pick(rng, arr, fallback) {
  if (!Array.isArray(arr) || arr.length === 0) return fallback;
  return arr[Math.floor(rng() * arr.length)] ?? fallback;
}

function pickManyDistinct(rng, arr, count) {
  const pool = Array.isArray(arr) ? [...arr] : [];
  const out = [];
  while (pool.length && out.length < count) {
    const idx = Math.floor(rng() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

function sentence(s) {
  const t = String(s || '').trim();
  if (!t) return '';
  if (/[.!?]$/.test(t)) return t;
  return `${t}.`;
}

function cleanWord(x) {
  return String(x || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toDefiniteLocation(loc) {
  const t = cleanWord(loc);
  if (!t) return 'the city';
  if (/^a\s+/i.test(t)) return `the ${t.slice(2)}`;
  if (/^an\s+/i.test(t)) return `the ${t.slice(3)}`;
  return t;
}

function tinyParagraphs(parts, maxParas = 5) {
  const out = [];
  for (const p of parts) {
    const t = String(p || '').trim();
    if (!t) continue;
    out.push(t);
    if (out.length >= maxParas) break;
  }
  return out.join('\n\n');
}

function deriveConcepts(tpl) {
  const tags = Array.isArray(tpl.tags) ? tpl.tags.filter(Boolean) : [];
  const keywords = Array.isArray(tpl.keywords) ? tpl.keywords.filter(Boolean) : [];

  // Prefer human-ish words over technical tags.
  const raw = [...keywords, ...tags]
    .map((x) => String(x).replace(/[_-]+/g, ' '))
    .map((x) => x.trim())
    .filter(Boolean);

  const uniq = [];
  const seen = new Set();
  for (const w of raw) {
    const key = w.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    uniq.push(w);
    if (uniq.length >= 10) break;
  }

  const virtues = ['humility', 'discipline', 'patience', 'kindness', 'courage', 'honor', 'truth'];
  const vices = ['ego', 'greed', 'fear', 'arrogance', 'envy', 'deceit'];

  const locations = [
    'a crowded city lane',
    'a windy shoreline',
    'a quiet forest path',
    'a stormy sea',
    'a dusty trade route',
    'a mountain ridge',
    'a small workshop',
    'a cold camp under open sky',
    'a noisy stadium tunnel',
    'a late-night lab room',
  ];

  const protagonists = [
    'a young trainee',
    'a stubborn inventor',
    'a calm team leader',
    'a careful messenger',
    'a street-smart vendor',
    'a night-shift operator',
    'a rescue coordinator',
    'a disciplined captain',
    'a patient challenger',
    'a quiet observer',
  ];

  const obstacles = [
    'time pressure',
    'bad weather',
    'a risky shortcut',
    'a broken tool',
    'a misleading rumor',
    'an unfair advantage',
    'a sudden error',
    'low resources',
    'crowd noise',
    'doubt from others',
  ];

  const turns = [
    'a tiny detail',
    'a last-minute decision',
    'a disciplined routine',
    'a simple signal',
    'a hard apology',
    'a quiet warning',
    'a clean reset',
    'a brave pause',
  ];

  // Use tags/keywords to bias setting a bit.
  const tagText = tags.join(' ').toLowerCase();
  const keywordText = keywords.join(' ').toLowerCase();
  const themeHints = {
    lab: tagText.includes('science') ? 'a late-night lab room' : null,
    sea: tagText.includes('sea') ? 'a stormy sea' : null,
    mountain: tagText.includes('mountain') ? 'a mountain ridge' : null,
    sport: tagText.includes('sport') ? 'a noisy stadium tunnel' : null,
    trade: tagText.includes('trade') ? 'a dusty trade route' : null,
    wind: tagText.includes('wind') ? 'a windy shoreline' : null,
    exploration: tagText.includes('antarctica') || tagText.includes('exploration') ? 'a cold camp under open sky' : null,
    city: tagText.includes('city') || tagText.includes('london') ? 'a crowded city lane' : null,
    river:
      tagText.includes('river') || keywordText.includes('river')
        ? 'a riverbank at dusk'
        : null,
    forest:
      tagText.includes('forest') || keywordText.includes('forest')
        ? 'a quiet forest path'
        : null,
    desert:
      tagText.includes('desert') || keywordText.includes('desert')
        ? 'a dusty trade route'
        : null,
  };

  const biasedLocations = [
    themeHints.lab,
    themeHints.sea,
    themeHints.mountain,
    themeHints.sport,
    themeHints.trade,
    themeHints.wind,
    themeHints.exploration,
    themeHints.city,
    themeHints.river,
    themeHints.forest,
    themeHints.desert,
  ].filter(Boolean);

  return {
    concepts: uniq.length ? uniq : ['choice', 'lesson', 'promise', 'trial', 'truth'],
    virtues,
    vices,
    locations,
    protagonists,
    obstacles,
    turns,
    biasedLocations,
  };
}

function generateSummaryFromTemplate(tpl, rng) {
  const { concepts, virtues, vices, locations, protagonists, obstacles, turns, biasedLocations } = deriveConcepts(tpl);

  const c = pickManyDistinct(rng, concepts, 3);
  const c1 = c[0] || 'lesson';
  const c2 = c[1] || 'choice';
  const c3 = c[2] || 'control';

  const virtue = pick(rng, virtues, 'discipline');
  const vice = pick(rng, vices, 'ego');
  const location = pick(rng, biasedLocations.length ? biasedLocations : locations, 'a crowded city lane');
  const hero = pick(rng, protagonists, 'a calm team leader');
  const obstacle = pick(rng, obstacles, 'time pressure');
  const turn = pick(rng, turns, 'a tiny detail');

  // Build an actual short story (not a meta-summary). Keep it compact, readable, and varied.
  const names = [
    'Aarav',
    'Meera',
    'Kabir',
    'Nisha',
    'Riya',
    'Ishaan',
    'Zoya',
    'Arjun',
    'Amina',
    'Sofia',
    'Mateo',
    'Noah',
    'Lina',
    'Kenji',
  ];
  const name = pick(rng, names, 'Aarav');
  const ally = pick(rng, names.filter((n) => n !== name), 'Meera');

  const loc = toDefiniteLocation(location);
  const what = cleanWord(c1);
  const what2 = cleanWord(c2);
  const what3 = cleanWord(c3);
  const heroLine = `${name} was ${cleanWord(hero)}.`;

  const openers = [
    `The air around ${loc} felt restless.`,
    `That day at ${loc}, everything moved a little too fast.`,
    `At ${loc}, the light was low and the pressure was high.`,
    `In the morning at ${loc}, a small mistake could become a big one.`,
    `Between sudden changes at ${loc}, one decision remained unresolved.`,
    `As the day slipped away at ${loc}, every eye stayed on the same task.`,
  ];

  const stakes = [
    `The goal sounded simple: protect ${what}, and choose ${what2} at exactly the right time.`,
    `${what} and ${what2} had to be handled together — one slip, and the whole round could flip.`,
    `The plan was clear, but ${obstacle} was waiting to test everyone.`,
  ];

  const conflict = [
    `As the minutes passed, ${vice} whispered, “Take the shortcut.”`,
    `The pressure rose, and ${vice} pushed for a rushed decision.`,
    `Everyone thought it would be easy — until ${obstacle} broke the rhythm.`,
  ];

  const twist = [
    `Then ${turn} happened — the kind of detail nobody notices at first.`,
    `Suddenly, ${turn} made the whole picture sharper.`,
    `In that moment, ${turn} arrived and closed the wrong path completely.`,
  ];

  const resolution = [
    `${name} paused for one breath and acted with ${virtue}.`,
    `${ally} said one word — “reset.” ${name} chose ${virtue} and controlled the pace.`,
    `${name} followed ${virtue} step by step — no drama, just clean execution.`,
  ];

  const ending = [
    `The result was simple: ${what3} held steady, and the choice of ${what2} landed right.`,
    `What won the round wasn’t power — it was ${what3}.`,
    `In the end, everyone understood: ${what} only matters when ${virtue} stands beside it.`,
  ];

  const outro = [
    `And in a quiet corner of ${loc}, a small decision became a turning point.`,
    `Nobody cheered — but the job got done, perfectly clean.`,
    `That’s where the story ends, but the moment stays with you.`,
  ];

  const out = tinyParagraphs([
    pick(rng, openers, openers[0]),
    heroLine,
    pick(rng, stakes, stakes[0]),
    pick(rng, conflict, conflict[0]),
    pick(rng, twist, twist[0]),
    pick(rng, resolution, resolution[0]),
    pick(rng, ending, ending[0]),
    pick(rng, outro, outro[0]),
  ], 6);

  // Keep it short-story sized (not a long essay), but avoid being too tiny.
  const minChars = 280;
  if (out.trim().length >= minChars) return out;

  const add = sentence(
    `That day, ${name} learned the difference: when ${vice} leads, mistakes multiply; when ${virtue} leads, the path opens`
  );
  return `${out}\n\n${add}`;
}

function generateTitlesFromTemplate(tpl, rng) {
  const { concepts, virtues, vices, locations, biasedLocations } = deriveConcepts(tpl);
  const cA = titleCase(pick(rng, concepts, 'The Lesson'));
  const cB = titleCase(pick(rng, concepts.slice(1), 'The Choice'));
  const cC = titleCase(pick(rng, concepts.slice(2), 'Control'));
  const virtue = titleCase(pick(rng, virtues, 'Discipline'));
  const vice = titleCase(pick(rng, vices, 'Ego'));

  const loc = pick(rng, biasedLocations.length ? biasedLocations : locations, 'a crowded city lane')
    .replace(/^a\s+/i, '')
    .replace(/^an\s+/i, '')
    .split(' ')
    .slice(0, 3)
    .map((x) => titleCase(x))
    .join(' ');

  const patterns = [
    () => `${virtue} Versus ${vice}`,
    () => `Final Minute, Calm Mind`,
    () => `Signal Over Noise`,
    () => `The ${cB} That Saved It`,
    () => `Pressure Test (${cC})`,
    () => `No Shortcut Today`,
    () => `When ${virtue} Took Control`,
    () => `A Small Detail, A Big Turn`,
    () => `The Cost of ${vice}`,
    () => `${loc}: The Turning Point`,
    () => `${cA} Under Fire`,
    () => `Reset. Focus. Win.`,
  ];

  const used = new Set();
  const titles = [];
  let safety = 0;
  while (titles.length < 10 && safety < 200) {
    safety++;
    const p = patterns[Math.floor(rng() * patterns.length)];
    let t = titleCase(p());
    // Light variety using template name keywords.
    if (rng() < 0.25) {
      const extra = titleCase(pick(rng, concepts, 'Lesson'));
      if (!t.toLowerCase().includes(extra.toLowerCase())) t = `${t} (${extra})`;
    }
    if (t.length > 60) t = t.slice(0, 60).trim();
    if (used.has(t)) continue;
    used.add(t);
    titles.push(t);
  }

  // Fallback (should never happen)
  while (titles.length < 10) titles.push(`${cA} ${titles.length}`);

  return titles;
}

function generateSlotSuggestions(date, hour) {
  const seed = seedFromSlot(String(date), Number(hour));
  const rng = mulberry32(seed);
  const picked = pickDistinctTemplates(rng, 3);

  const quizzes = {
    SILVER: picked[0] || STORY_LIBRARY[0],
    GOLD: picked[1] || STORY_LIBRARY[1] || STORY_LIBRARY[0],
    DIAMOND: picked[2] || STORY_LIBRARY[2] || STORY_LIBRARY[0],
  };

  const out = {};
  for (const qt of ['SILVER', 'GOLD', 'DIAMOND']) {
    const tpl = quizzes[qt];
    out[qt] = {
      template: { id: tpl.id, name: tpl.name, tags: tpl.tags, blurb: tpl.blurb },
      summary: generateSummaryFromTemplate(tpl, rng),
      titles: generateTitlesFromTemplate(tpl, rng),
      correctNumber: Math.floor(rng() * 10),
    };
  }

  return out;
}

module.exports = {
  generateSlotSuggestions,
};
