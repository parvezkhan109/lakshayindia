// Public-domain inspired story templates.
// NOTE: These are original short summaries and keywords (no copied text).
// Themes draw from public-domain folklore and classic fables.

const STORY_LIBRARY = [
  {
    id: 'aesop_fox_grapes',
    name: 'Fox & the Grapes (Fable)',
    tags: ['fable', 'fox', 'grapes', 'desire', 'excuses'],
    blurb:
      'A clever fox wants something just out of reach, and turns failure into an excuse. Choose the outcome that fits the lesson.',
    keywords: ['fox', 'grapes', 'vine', 'reach', 'excuse', 'hunger', 'pride', 'sour'],
  },
  {
    id: 'aesop_tortoise_hare',
    name: 'Tortoise & the Hare (Fable)',
    tags: ['fable', 'race', 'patience', 'arrogance'],
    blurb:
      'A fast runner learns that overconfidence loses to steady effort. Pick the moment that changes the race.',
    keywords: ['tortoise', 'hare', 'race', 'nap', 'finish', 'steady', 'boast', 'path'],
  },
  {
    id: 'aesop_lion_mouse',
    name: 'Lion & the Mouse (Fable)',
    tags: ['fable', 'lion', 'mouse', 'kindness', 'help'],
    blurb:
      'A small act of mercy returns as big help. Choose the detail that makes the rescue possible.',
    keywords: ['lion', 'mouse', 'net', 'mercy', 'teeth', 'rope', 'forest', 'promise'],
  },
  {
    id: 'panchatantra_monkey_croc',
    name: 'Monkey & the Crocodile (Folktale)',
    tags: ['folktale', 'river', 'friendship', 'trick', 'panchatantra'],
    blurb:
      'A clever monkey escapes danger by quick thinking and words. Select the twist that saves him.',
    keywords: ['monkey', 'crocodile', 'river', 'island', 'heart', 'friend', 'mango', 'trick'],
  },
  {
    id: 'panchatantra_blue_jackal',
    name: 'The Blue Jackal (Folktale)',
    tags: ['folktale', 'identity', 'trick', 'colors', 'panchatantra'],
    blurb:
      'A jackal gains power by looking different, until the truth slips out. Pick the sign that reveals him.',
    keywords: ['jackal', 'dye', 'blue', 'pack', 'howl', 'truth', 'mask', 'rain'],
  },
  {
    id: 'jataka_banyan_deer',
    name: 'The Banyan Deer (Jataka Tale)',
    tags: ['jataka', 'deer', 'compassion', 'forest', 'promise'],
    blurb:
      'A leader keeps a promise even when it costs him, changing an enemy’s heart. Choose the pledge that matters.',
    keywords: ['deer', 'king', 'forest', 'promise', 'hunt', 'mercy', 'herd', 'fear'],
  },
  {
    id: 'myth_icarus',
    name: 'Icarus & the Sun (Myth)',
    tags: ['myth', 'wings', 'sun', 'warning', 'pride'],
    blurb:
      'A bold escape fails when limits are ignored. Pick the rule that was broken.',
    keywords: ['wings', 'wax', 'sun', 'sea', 'warning', 'height', 'feather', 'fall'],
  },
  {
    id: 'myth_midas',
    name: 'Midas Touch (Myth)',
    tags: ['myth', 'gold', 'wish', 'regret'],
    blurb:
      'A wish seems perfect until it ruins what matters. Choose what turns to gold first.',
    keywords: ['gold', 'wish', 'touch', 'bread', 'water', 'regret', 'gift', 'curse'],
  },
  {
    id: 'legend_robin_hood',
    name: 'Robin Hood (Legend)',
    tags: ['legend', 'archer', 'forest', 'justice'],
    blurb:
      'A skilled archer challenges unfair power. Pick the act that proves his aim and intent.',
    keywords: ['archer', 'forest', 'arrow', 'target', 'sheriff', 'outlaw', 'coin', 'justice'],
  },
  {
    id: 'fairy_rumpel',
    name: 'Spinning Straw (Fairy Tale)',
    tags: ['fairy', 'deal', 'name', 'riddle'],
    blurb:
      'A bargain brings danger, and a hidden name becomes the key. Choose the clue that reveals it.',
    keywords: ['straw', 'gold', 'deal', 'name', 'secret', 'queen', 'spool', 'promise'],
  },

  // Worldwide “real-world” inspired templates (facts are public; summaries remain fully original).
  {
    id: 'history_wright_flight_1903',
    name: 'First Flight at the Dunes (History)',
    tags: ['history', 'aviation', 'usa', 'wind', 'persistence'],
    blurb:
      'A small team tests a fragile machine again and again until one clean moment changes everything.',
    keywords: ['dunes', 'wind', 'engine', 'glide', 'failure', 'retry', 'control', 'lift'],
  },
  {
    id: 'history_great_fire_1666',
    name: 'The City Fire and the Turning Wind (History)',
    tags: ['history', 'city', 'fire', 'rebuild', 'london'],
    blurb:
      'A tiny mistake becomes a giant disaster; leadership and quick choices decide what can be saved.',
    keywords: ['spark', 'wind', 'river', 'lanes', 'bucket', 'break', 'rebuild', 'night'],
  },
  {
    id: 'exploration_endurance_1915',
    name: 'Icebound Voyage and Unbroken Team (Exploration)',
    tags: ['history', 'exploration', 'antarctica', 'leadership', 'survival'],
    blurb:
      'When the ship is lost to ice, the mission changes: bring everyone home by discipline and hope.',
    keywords: ['ice', 'camp', 'ration', 'map', 'rescue', 'signal', 'oar', 'promise'],
  },
  {
    id: 'science_penicillin_1928',
    name: 'Accident in the Lab (Science)',
    tags: ['history', 'science', 'discovery', 'observation', 'discipline'],
    blurb:
      'A messy moment becomes a breakthrough because someone notices the one detail others ignore.',
    keywords: ['lab', 'dish', 'mold', 'note', 'pattern', 'care', 'test', 'result'],
  },
  {
    id: 'engineering_lighthouse_storm',
    name: 'The Lighthouse in the Storm (True-to-life)',
    tags: ['real-life', 'sea', 'storm', 'duty', 'signal'],
    blurb:
      'A keeper stays at the post when fear is loud; one steady light becomes many lives saved.',
    keywords: ['storm', 'lamp', 'oil', 'rope', 'wave', 'signal', 'cliff', 'duty'],
  },
  {
    id: 'sports_underdog_final_whistle',
    name: 'Underdog at Final Whistle (Sport)',
    tags: ['real-life', 'sport', 'team', 'focus', 'comeback'],
    blurb:
      'A team behind on the board wins by calm communication, not panic. The clock becomes the enemy.',
    keywords: ['whistle', 'coach', 'timeout', 'pass', 'defense', 'stamina', 'crowd', 'comeback'],
  },
  {
    id: 'rescue_mountain_signal',
    name: 'The Mountain Signal (Rescue)',
    tags: ['real-life', 'rescue', 'mountain', 'signal', 'teamwork'],
    blurb:
      'In thin air and low visibility, a simple signal plan is the difference between chaos and safety.',
    keywords: ['ridge', 'fog', 'radio', 'rope', 'trail', 'marker', 'plan', 'calm'],
  },
  {
    id: 'trade_silk_road_caravan',
    name: 'Caravan on the Long Road (History)',
    tags: ['history', 'trade', 'desert', 'routes', 'trust'],
    blurb:
      'A caravan crosses harsh land where trust is currency; one broken promise can cost everything.',
    keywords: ['caravan', 'water', 'map', 'merchant', 'guard', 'oasis', 'deal', 'trust'],
  },
  {
    id: 'city_bridge_builder',
    name: 'Bridge Builder’s Deadline (True-to-life)',
    tags: ['real-life', 'engineering', 'bridge', 'pressure', 'safety'],
    blurb:
      'Under pressure to finish fast, someone chooses safety over applause — and prevents a tragedy.',
    keywords: ['blueprint', 'bolt', 'test', 'deadline', 'weight', 'safety', 'inspect', 'report'],
  },
  {
    id: 'radio_first_broadcast',
    name: 'The First Broadcast Night (History)',
    tags: ['history', 'radio', 'signal', 'courage', 'timing'],
    blurb:
      'A shaky signal travels farther than expected; one clean decision makes the world listen.',
    keywords: ['signal', 'static', 'mic', 'timing', 'switch', 'tower', 'message', 'silence'],
  },
]

module.exports = {
  STORY_LIBRARY,
}
