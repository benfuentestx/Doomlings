// Age Cards for Doomlings
// The Age deck consists of:
// - 1 "Birth of Life" card (always on top)
// - 28 Age cards (showing draw amounts 1-6)
// - 3 Catastrophe cards (shuffled into 3 sections)

const birthOfLife = {
  id: 'birth_of_life',
  type: 'birth',
  name: 'Birth of Life',
  draw: 2,
  effect: 'The world begins! Each player draws 2 cards.'
};

// Standard Age cards - distribution based on official game
// Each shows how many cards players draw that round
const ageCardTemplates = [
  { draw: 1, count: 4 },  // 4 cards that let you draw 1
  { draw: 2, count: 8 },  // 8 cards that let you draw 2
  { draw: 3, count: 8 },  // 8 cards that let you draw 3
  { draw: 4, count: 4 },  // 4 cards that let you draw 4
  { draw: 5, count: 2 },  // 2 cards that let you draw 5
  { draw: 6, count: 2 },  // 2 cards that let you draw 6
];

// Generate age cards
const ageCards = [];
let ageId = 1;
for (const template of ageCardTemplates) {
  for (let i = 0; i < template.count; i++) {
    ageCards.push({
      id: `age_${ageId}`,
      type: 'age',
      name: `Age of ${getAgeName(ageId)}`,
      draw: template.draw,
      effect: `Each player draws ${template.draw} card${template.draw > 1 ? 's' : ''}.`
    });
    ageId++;
  }
}

// Age names for flavor
function getAgeName(id) {
  const names = [
    'Microbes', 'Algae', 'Jellyfish', 'Worms',
    'Fish', 'Amphibians', 'Reptiles', 'Insects',
    'Ferns', 'Flowers', 'Trees', 'Coral',
    'Crustaceans', 'Mollusks', 'Arachnids', 'Mammals',
    'Birds', 'Primates', 'Predators', 'Giants',
    'Ice', 'Fire', 'Stone', 'Bronze',
    'Iron', 'Steam', 'Electricity', 'Silicon'
  ];
  return names[(id - 1) % names.length];
}

// Catastrophe cards - major events that end each section
const catastrophes = [
  {
    id: 'catastrophe_asteroid',
    type: 'catastrophe',
    name: 'Asteroid Impact',
    effect: 'A massive asteroid strikes! Each player must discard 1 trait from their trait pile (if able).',
    action: 'discard_trait'
  },
  {
    id: 'catastrophe_ice_age',
    type: 'catastrophe',
    name: 'Ice Age',
    effect: 'The world freezes over! Each player must discard down to 5 cards in hand.',
    action: 'discard_to_hand_limit',
    limit: 5
  },
  {
    id: 'catastrophe_volcanic',
    type: 'catastrophe',
    name: 'Volcanic Winter',
    effect: 'Volcanoes erupt worldwide! Each player discards all Colorless traits from their trait pile.',
    action: 'discard_colorless'
  },
  {
    id: 'catastrophe_plague',
    type: 'catastrophe',
    name: 'The Great Plague',
    effect: 'Disease spreads! Each player must discard their lowest-value trait (if able).',
    action: 'discard_lowest'
  },
  {
    id: 'catastrophe_flood',
    type: 'catastrophe',
    name: 'The Great Flood',
    effect: 'Waters rise! Pass 2 cards from your hand to the player on your left.',
    action: 'pass_cards',
    count: 2
  },
  {
    id: 'catastrophe_drought',
    type: 'catastrophe',
    name: 'Endless Drought',
    effect: 'Water becomes scarce! Each player discards 1 Green trait from their trait pile (if able).',
    action: 'discard_color',
    color: 'Green'
  }
];

module.exports = {
  birthOfLife,
  ageCards,
  catastrophes
};
