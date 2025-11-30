// Doomlings Card Data - Based on Python game logic
// Converted from source-data/cards/*.py

// ============== BIRTH OF LIFE (Special Starting Age) ==============

export const birthOfLife = {
  type: 'age',
  name: 'The Birth of Life',
  turnEffects: [],
  instantEffects: [
    { name: 'modify_gene_pool', params: { affected_players: 'all', value: 5 } },
    { name: 'stabilize_all_players', params: { reset_stabilize: true } },
    { name: 'modify_number_cards_turn', params: { affected_players: 'all', value: 1 } }
  ],
  expansion: 'Base'
};

// ============== AGES ==============

export const ageCards = [
  {
    type: 'age',
    name: 'Tropical Lands',
    turnEffects: [
      { name: 'add_turn_restriction', params: { restricted_attribute: 'color', restricted_value: 'Colorless', restricted_type: 'equal' } }
    ],
    instantEffects: [],
    expansion: 'Base',
    description: 'Cannot play Colorless traits this round'
  },
  {
    type: 'age',
    name: 'Arid Lands',
    turnEffects: [
      { name: 'add_turn_restriction', params: { restricted_attribute: 'color', restricted_value: 'Blue', restricted_type: 'equal' } }
    ],
    instantEffects: [],
    expansion: 'Base',
    description: 'Cannot play Blue traits this round'
  },
  {
    type: 'age',
    name: 'Tectonic Shift',
    turnEffects: [
      { name: 'add_turn_restriction', params: { restricted_attribute: 'color', restricted_value: 'Green', restricted_type: 'equal' } }
    ],
    instantEffects: [],
    expansion: 'Base',
    description: 'Cannot play Green traits this round'
  },
  {
    type: 'age',
    name: 'Eclipse',
    turnEffects: [
      { name: 'add_turn_restriction', params: { restricted_attribute: 'color', restricted_value: 'Red', restricted_type: 'equal' } }
    ],
    instantEffects: [],
    expansion: 'Base',
    description: 'Cannot play Red traits this round'
  },
  {
    type: 'age',
    name: 'Lunar Retreat',
    turnEffects: [
      { name: 'add_turn_restriction', params: { restricted_attribute: 'color', restricted_value: 'Purple', restricted_type: 'equal' } }
    ],
    instantEffects: [],
    expansion: 'Base',
    description: 'Cannot play Purple traits this round'
  },
  {
    type: 'age',
    name: 'Glacial Drift',
    turnEffects: [
      { name: 'add_turn_restriction', params: { restricted_attribute: 'face_value', restricted_value: 3, restricted_type: 'greater_than' } }
    ],
    instantEffects: [],
    expansion: 'Base',
    description: 'Cannot play traits with face value greater than 3'
  },
  {
    type: 'age',
    name: 'Flourish',
    turnEffects: [],
    instantEffects: [
      { name: 'draw_cards', params: { affected_players: 'all', value: 2 } }
    ],
    expansion: 'Base',
    description: 'All players draw 2 cards'
  },
  {
    type: 'age',
    name: 'Age of Peace',
    turnEffects: [
      { name: 'turn_ignore_actions', params: {} }
    ],
    instantEffects: [],
    expansion: 'Base',
    description: 'Action effects are ignored this round'
  },
  {
    type: 'age',
    name: 'Comet Showers',
    turnEffects: [],
    instantEffects: [
      { name: 'discard_card_from_hand', params: { affected_players: 'all', num_cards: 1, random_discard: true } }
    ],
    expansion: 'Base',
    description: 'All players randomly discard 1 card'
  },
  {
    type: 'age',
    name: 'Age of Wonder',
    turnEffects: [
      { name: 'set_end_turn_number_cards', params: { num_cards: 4 } }
    ],
    instantEffects: [],
    expansion: 'Base',
    description: 'At end of turn, draw/discard to 4 cards'
  },
  {
    type: 'age',
    name: 'Birth of a Hero',
    turnEffects: [],
    instantEffects: [
      { name: 'play_heroic', params: {} }
    ],
    expansion: 'Base',
    description: 'All Heroic cards in hand are played automatically'
  },
  {
    type: 'age',
    name: 'Northern Winds',
    turnEffects: [
      { name: 'add_turn_restriction', params: { restricted_attribute: 'face_value', restricted_value: 0, restricted_type: 'less_than' } }
    ],
    instantEffects: [],
    expansion: 'Base',
    description: 'Cannot play negative face value traits'
  },
  {
    type: 'age',
    name: 'Badlands',
    turnEffects: [],
    instantEffects: [
      { name: 'draw_cards', params: { affected_players: 'all', value: 1 } }
    ],
    expansion: 'Base',
    description: 'All players draw 1 card'
  }
];

// ============== CATASTROPHES ==============

export const catastrophes = [
  {
    type: 'catastrophe',
    name: 'Overpopulation',
    genePoolEffect: 1,
    catastropheEffects: [
      { name: 'draw_card_for_every_color_type', params: { affected_players: 'all' } }
    ],
    worldEndEffect: { name: 'modify_world_end_points_fewest_traits', params: { affected_players: 'all', value: 4 } },
    expansion: 'Base',
    description: 'Gene Pool +1. Draw 1 card for each color in your trait pile. World\'s End: Fewest traits gets +4 points.'
  },
  {
    type: 'catastrophe',
    name: 'Ice Age',
    genePoolEffect: -1,
    catastropheEffects: [
      { name: 'discard_card_from_hand_for_every_color', params: { affected_players: 'all', color: 'Red' } }
    ],
    worldEndEffect: { name: 'modify_world_end_points_for_every_color', params: { affected_players: 'all', color: 'Red', value: -1 } },
    expansion: 'Base',
    description: 'Gene Pool -1. Discard 1 card for each Red trait. World\'s End: -1 point per Red trait.'
  },
  {
    type: 'catastrophe',
    name: 'Super Volcano',
    genePoolEffect: -1,
    catastropheEffects: [
      { name: 'discard_card_from_hand_for_every_color', params: { affected_players: 'all', color: 'Blue' } }
    ],
    worldEndEffect: { name: 'modify_world_end_points_for_every_color', params: { affected_players: 'all', color: 'Blue', value: -1 } },
    expansion: 'Base',
    description: 'Gene Pool -1. Discard 1 card for each Blue trait. World\'s End: -1 point per Blue trait.'
  },
  {
    type: 'catastrophe',
    name: 'Mass Extinction',
    genePoolEffect: -1,
    catastropheEffects: [
      { name: 'discard_card_from_hand_for_every_color', params: { affected_players: 'all', color: 'Colorless' } }
    ],
    worldEndEffect: { name: 'discard_card_from_trait_pile', params: { affected_players: 'all', color: 'Green', num_cards: 1 } },
    expansion: 'Base',
    description: 'Gene Pool -1. Discard 1 card for each Colorless trait. World\'s End: Discard 1 Green trait.'
  },
  {
    type: 'catastrophe',
    name: 'Retrovirus',
    genePoolEffect: -1,
    catastropheEffects: [
      { name: 'discard_card_from_hand_for_every_color', params: { affected_players: 'all', color: 'Green' } }
    ],
    worldEndEffect: { name: 'modify_world_end_points_for_every_color', params: { affected_players: 'all', color: 'Green', value: -1 } },
    expansion: 'Base',
    description: 'Gene Pool -1. Discard 1 card for each Green trait. World\'s End: -1 point per Green trait.'
  },
  {
    type: 'catastrophe',
    name: 'Impact Event',
    genePoolEffect: -1,
    catastropheEffects: [
      { name: 'discard_card_from_hand_for_every_dominant', params: { affected_players: 'all' } }
    ],
    worldEndEffect: { name: 'modify_world_end_points_face_value', params: { affected_players: 'all', face_value: 2, compare_type: 'greater_than', value: -1 } },
    expansion: 'Base',
    description: 'Gene Pool -1. Discard 1 card for each Dominant. World\'s End: -1 point per trait with face > 2.'
  },
  {
    type: 'catastrophe',
    name: 'Pulse Event',
    genePoolEffect: -1,
    catastropheEffects: [
      { name: 'discard_card_from_hand_for_every_color', params: { affected_players: 'all', color: 'Purple' } }
    ],
    worldEndEffect: { name: 'discard_card_from_trait_pile', params: { affected_players: 'all', color: 'Purple', num_cards: 1 } },
    expansion: 'Base',
    description: 'Gene Pool -1. Discard 1 card for each Purple trait. World\'s End: Discard 1 Purple trait.'
  }
];

// ============== TRAITS ==============

export const traits = [
  // === EFFECTLESS TRAITS (just face value) ===
  { name: 'Adorable', faceValue: 4, color: 'Purple', expansion: 'Base' },
  { name: 'Antlers', faceValue: 3, color: 'Red', expansion: 'Base' },
  { name: 'Appealing', faceValue: 3, color: 'Green', expansion: 'Base' },
  { name: 'Bark', faceValue: 2, color: 'Green', expansion: 'Base' },
  { name: 'Big Ears', faceValue: 1, color: 'Purple', expansion: 'Base' },
  { name: 'Blubber', faceValue: 4, color: 'Blue', expansion: 'Base' },
  { name: 'Confusion', faceValue: -2, color: 'Colorless', expansion: 'Base' },
  { name: 'Deep Roots', faceValue: 2, color: 'Green', expansion: 'Base' },
  { name: 'Fangs', faceValue: 1, color: 'Red', expansion: 'Base' },
  { name: 'Fear', faceValue: 1, color: 'Colorless', expansion: 'Base' },
  { name: 'Fine Motor Skills', faceValue: 2, color: 'Purple', expansion: 'Base' },
  { name: 'Fire Skin', faceValue: 3, color: 'Red', expansion: 'Base' },
  { name: 'Flatulence', faceValue: 3, color: 'Colorless', expansion: 'Base' },
  { name: 'Gills', faceValue: 1, color: 'Blue', expansion: 'Base' },
  { name: 'Leaves', faceValue: 1, color: 'Green', expansion: 'Base' },
  { name: 'Migratory', faceValue: 2, color: 'Blue', expansion: 'Base' },
  { name: 'Nocturnal', faceValue: 3, color: 'Purple', expansion: 'Base' },
  { name: 'Quick', faceValue: 2, color: 'Red', expansion: 'Base' },
  { name: 'Spiny', faceValue: 1, color: 'Blue', expansion: 'Base' },
  { name: 'Stone Skin', faceValue: 2, color: 'Red', expansion: 'Base' },
  { name: 'Woody Stems', faceValue: 1, color: 'Green', expansion: 'Base' },
  { name: 'Talons', faceValue: 2, color: 'Purple', expansion: 'Dinolings' },
  { name: 'Destined', faceValue: 4, color: 'Colorless', expansion: 'Mythlings' },
  { name: 'Icy', faceValue: 3, color: 'Blue', expansion: 'Mythlings' },
  { name: 'Diaphanous Wings', faceValue: -1, color: 'Blue', expansion: 'Mythlings' },
  { name: 'Ceratopsian Horns', faceValue: 4, color: 'Green', expansion: 'Dinolings' },

  // === GENE POOL MODIFIER TRAITS ===
  {
    name: 'Saliva',
    faceValue: 1,
    color: 'Blue',
    expansion: 'Base',
    effects: [{ name: 'modify_gene_pool', params: { affected_players: 'self', value: 1 } }],
    removeEffects: [{ name: 'modify_gene_pool', params: { affected_players: 'self', value: -1 } }]
  },
  {
    name: 'Teeth',
    faceValue: 1,
    color: 'Purple',
    expansion: 'Base',
    effects: [{ name: 'modify_gene_pool', params: { affected_players: 'self', value: 1 } }],
    removeEffects: [{ name: 'modify_gene_pool', params: { affected_players: 'self', value: -1 } }]
  },
  {
    name: 'Dreamer',
    faceValue: 1,
    color: 'Purple',
    expansion: 'Base',
    effects: [{ name: 'modify_gene_pool', params: { affected_players: 'self', value: 1 } }],
    removeEffects: [{ name: 'modify_gene_pool', params: { affected_players: 'self', value: -1 } }]
  },
  {
    name: 'Brute Strength',
    faceValue: 4,
    color: 'Red',
    expansion: 'Base',
    effects: [{ name: 'modify_gene_pool', params: { affected_players: 'self', value: -1 } }],
    removeEffects: [{ name: 'modify_gene_pool', params: { affected_players: 'self', value: 1 } }]
  },
  {
    name: 'Mitochondrion',
    faceValue: 1,
    color: 'Colorless',
    expansion: 'Base',
    effects: [{ name: 'modify_gene_pool', params: { affected_players: 'self', value: 1 } }],
    removeEffects: [{ name: 'modify_gene_pool', params: { affected_players: 'self', value: -1 } }]
  },
  {
    name: 'Super Spreader',
    faceValue: 2,
    color: 'Purple',
    expansion: 'Base',
    effects: [{ name: 'modify_gene_pool', params: { affected_players: 'all', value: -1 } }],
    removeEffects: [{ name: 'modify_gene_pool', params: { affected_players: 'all', value: 1 } }]
  },
  {
    name: 'Just',
    faceValue: 2,
    color: 'Colorless',
    expansion: 'Base',
    effects: [{ name: 'modify_gene_pool', params: { affected_players: 'self', value: 1 } }],
    removeEffects: [{ name: 'modify_gene_pool', params: { affected_players: 'self', value: -1 } }]
  },
  {
    name: 'Warm Blood',
    faceValue: -1,
    color: 'Red',
    expansion: 'Base',
    effects: [{ name: 'modify_gene_pool', params: { affected_players: 'self', value: 2 } }],
    removeEffects: [{ name: 'modify_gene_pool', params: { affected_players: 'self', value: -2 } }]
  },
  {
    name: 'Fecundity',
    faceValue: 1,
    color: 'Green',
    expansion: 'Base',
    effects: [{ name: 'modify_gene_pool', params: { affected_players: 'self', value: 1 } }],
    removeEffects: [{ name: 'modify_gene_pool', params: { affected_players: 'self', value: -1 } }]
  },

  // === ACTION TRAITS ===
  {
    name: 'Sweat',
    faceValue: 2,
    color: 'Blue',
    expansion: 'Base',
    actions: [{ name: 'discard_card_from_hand', params: { affected_players: 'self', num_cards: 1 } }],
    actionDescription: 'Discard 1 card from your hand'
  },
  {
    name: 'Hot Temper',
    faceValue: 2,
    color: 'Red',
    expansion: 'Base',
    actions: [{ name: 'discard_card_from_hand', params: { affected_players: 'self', num_cards: 2 } }],
    actionDescription: 'Discard 2 cards from your hand'
  },
  {
    name: 'Territorial',
    faceValue: 1,
    color: 'Red',
    expansion: 'Base',
    actions: [{ name: 'discard_card_from_trait_pile', params: { affected_players: 'opponents', num_cards: 1, color: 'Red' } }],
    actionDescription: 'Opponent discards 1 Red trait'
  },
  {
    name: 'Bad',
    faceValue: 1,
    color: 'Red',
    expansion: 'Base',
    actions: [{ name: 'discard_card_from_hand', params: { affected_players: 'opponents', num_cards: 2 } }],
    actionDescription: 'Opponents discard 2 cards from hand'
  },
  {
    name: 'Introspective',
    faceValue: 1,
    color: 'Colorless',
    expansion: 'Base',
    actions: [{ name: 'draw_cards', params: { affected_players: 'self', value: 4 } }],
    actionDescription: 'Draw 4 cards'
  },
  {
    name: 'Iridescent Scales',
    faceValue: 1,
    color: 'Blue',
    expansion: 'Base',
    actions: [{ name: 'draw_cards', params: { affected_players: 'self', value: 3 } }],
    actionDescription: 'Draw 3 cards'
  },
  {
    name: 'Propagation',
    faceValue: 1,
    color: 'Green',
    expansion: 'Base',
    actions: [{ name: 'play_another_trait', params: { affected_players: 'self', num_traits: 1 } }],
    actionDescription: 'Play another trait'
  },
  {
    name: 'Voracious',
    faceValue: 2,
    color: 'Red',
    expansion: 'Base',
    actions: [
      { name: 'discard_card_from_trait_pile', params: { affected_players: 'self', num_cards: 1 } },
      { name: 'play_another_trait', params: { affected_players: 'self', num_traits: 1 } }
    ],
    actionDescription: 'Discard 1 of your traits, then play another trait'
  },
  {
    name: 'Phreakish Eyes',
    faceValue: 2,
    color: 'Red',
    expansion: 'Techlings',
    actions: [
      { name: 'draw_cards', params: { affected_players: 'self', value: 3 } },
      { name: 'draw_cards', params: { affected_players: 'opponents', value: 1 } }
    ],
    actionDescription: 'Draw 3 cards, opponents each draw 1'
  },
  {
    name: 'Protofeathers',
    faceValue: -2,
    color: 'Purple',
    expansion: 'Dinolings',
    actions: [{ name: 'play_another_trait', params: { affected_players: 'self', num_traits: 2, ignore_actions: true } }],
    actionDescription: 'Play 2 more traits (ignore their actions)'
  },

  // === BONUS POINT TRAITS (Drops) ===
  {
    name: 'Kidney Chefs Toque',
    faceValue: null,
    color: 'Red',
    expansion: 'Base',
    bonusPoints: { name: 'bonus_kidney', params: {} },
    bonusDescription: '+1 for each Kidney trait (all players)'
  },
  {
    name: 'Kidney Combover',
    faceValue: null,
    color: 'Red',
    expansion: 'Base',
    bonusPoints: { name: 'bonus_kidney', params: {} },
    bonusDescription: '+1 for each Kidney trait (all players)'
  },
  {
    name: 'Kidney Elf Hat',
    faceValue: null,
    color: 'Red',
    expansion: 'Base',
    bonusPoints: { name: 'bonus_kidney', params: {} },
    bonusDescription: '+1 for each Kidney trait (all players)'
  },
  {
    name: 'Kidney Party Hat',
    faceValue: null,
    color: 'Red',
    expansion: 'Base',
    bonusPoints: { name: 'bonus_kidney', params: {} },
    bonusDescription: '+1 for each Kidney trait (all players)'
  },
  {
    name: 'Kidney Tiara',
    faceValue: null,
    color: 'Red',
    expansion: 'Base',
    bonusPoints: { name: 'bonus_kidney', params: {} },
    bonusDescription: '+1 for each Kidney trait (all players)'
  },
  {
    name: 'Kidney Topper',
    faceValue: null,
    color: 'Red',
    expansion: 'Base',
    bonusPoints: { name: 'bonus_kidney', params: {} },
    bonusDescription: '+1 for each Kidney trait (all players)'
  },
  {
    name: 'Swarm Fur',
    faceValue: null,
    color: 'Green',
    expansion: 'Base',
    bonusPoints: { name: 'bonus_swarm', params: {} },
    bonusDescription: '+1 for each Swarm trait (all players)'
  },
  {
    name: 'Swarm Horns',
    faceValue: null,
    color: 'Green',
    expansion: 'Base',
    bonusPoints: { name: 'bonus_swarm', params: {} },
    bonusDescription: '+1 for each Swarm trait (all players)'
  },
  {
    name: 'Swarm Mindless',
    faceValue: null,
    color: 'Green',
    expansion: 'Base',
    bonusPoints: { name: 'bonus_swarm', params: {} },
    bonusDescription: '+1 for each Swarm trait (all players)'
  },
  {
    name: 'Swarm Spots',
    faceValue: null,
    color: 'Green',
    expansion: 'Base',
    bonusPoints: { name: 'bonus_swarm', params: {} },
    bonusDescription: '+1 for each Swarm trait (all players)'
  },
  {
    name: 'Swarm Stripes',
    faceValue: null,
    color: 'Green',
    expansion: 'Base',
    bonusPoints: { name: 'bonus_swarm', params: {} },
    bonusDescription: '+1 for each Swarm trait (all players)'
  },
  {
    name: 'Heat Vision',
    faceValue: -1,
    color: 'Red',
    expansion: 'Base',
    bonusPoints: { name: 'bonus_for_every_color', params: { color: 'Red', value: 1 } },
    bonusDescription: '+1 for each Red trait you have'
  },
  {
    name: 'Sticky Secretions',
    faceValue: -1,
    color: 'Purple',
    expansion: 'Base',
    bonusPoints: { name: 'bonus_for_every_color', params: { color: 'Purple', value: 1 } },
    bonusDescription: '+1 for each Purple trait you have'
  },
  {
    name: 'Egg Clusters',
    faceValue: -1,
    color: 'Blue',
    expansion: 'Base',
    bonusPoints: { name: 'bonus_for_every_color', params: { color: 'Blue', value: 1 } },
    bonusDescription: '+1 for each Blue trait you have'
  },
  {
    name: 'Overgrowth',
    faceValue: -1,
    color: 'Green',
    expansion: 'Base',
    bonusPoints: { name: 'bonus_for_every_color', params: { color: 'Green', value: 1 } },
    bonusDescription: '+1 for each Green trait you have'
  },
  {
    name: 'Mindful',
    faceValue: 0,
    color: 'Colorless',
    expansion: 'Base',
    bonusPoints: { name: 'bonus_for_every_color', params: { color: 'Colorless', value: 1 } },
    bonusDescription: '+1 for each Colorless trait you have'
  },
  {
    name: 'Random Fertilization',
    faceValue: null,
    color: 'Green',
    expansion: 'Base',
    bonusPoints: { name: 'bonus_gene_pool', params: {} },
    bonusDescription: '+points equal to your Gene Pool'
  },
  {
    name: 'Altruistic',
    faceValue: null,
    color: 'Colorless',
    expansion: 'Base',
    bonusPoints: { name: 'bonus_gene_pool', params: {} },
    bonusDescription: '+points equal to your Gene Pool'
  },
  {
    name: 'Hyper-Myelination',
    faceValue: null,
    color: 'Purple',
    expansion: 'Techlings',
    bonusPoints: { name: 'bonus_max_gene_pool', params: {} },
    bonusDescription: '+points equal to highest Gene Pool (any player)'
  },
  {
    name: 'Fortunate',
    faceValue: null,
    color: 'Green',
    expansion: 'Base',
    bonusPoints: { name: 'bonus_number_cards_hand', params: {} },
    bonusDescription: '+points equal to cards in your hand'
  },
  {
    name: 'Boredom',
    faceValue: null,
    color: 'Colorless',
    expansion: 'Base',
    bonusPoints: { name: 'bonus_number_cards_hand', params: { card_type: 'effect' } },
    bonusDescription: '+points for cards with effects in your hand'
  },
  {
    name: 'Dragon Heart',
    faceValue: 1,
    color: 'Red',
    expansion: 'Mythlings',
    bonusPoints: { name: 'bonus_all_colors_trait_pile', params: { value: 4 } },
    bonusDescription: '+4 if you have all 4 colors in trait pile'
  },
  {
    name: 'Gratitude',
    faceValue: null,
    color: 'Colorless',
    expansion: 'Base',
    bonusPoints: { name: 'bonus_number_colors', params: { location: 'trait_pile', value: 1 } },
    bonusDescription: '+1 for each color in your trait pile'
  },
  {
    name: 'Saudade',
    faceValue: 1,
    color: 'Colorless',
    expansion: 'Base',
    bonusPoints: { name: 'bonus_number_colors', params: { location: 'hand', value: 1 } },
    bonusDescription: '+1 for each color in your hand'
  },
  {
    name: 'Brave',
    faceValue: 1,
    color: 'Red',
    expansion: 'Base',
    bonusPoints: { name: 'bonus_dominant_hand', params: { value: 2 } },
    bonusDescription: '+2 for each Dominant in your hand'
  },
  {
    name: 'Elven Ears',
    faceValue: -1,
    color: 'Green',
    expansion: 'Mythlings',
    bonusPoints: { name: 'bonus_expansion_all_trait_piles', params: { expansion: 'Mythlings', value: 1 } },
    bonusDescription: '+1 for each Mythlings trait (all players)'
  },
  {
    name: 'Pollination',
    faceValue: 1,
    color: 'Green',
    expansion: 'Base',
    bonusPoints: { name: 'bonus_face_value', params: { face_value: 1, value: 1 } },
    bonusDescription: '+1 for each trait with face value 1'
  },
  {
    name: 'Branches',
    faceValue: 0,
    color: 'Green',
    expansion: 'Base',
    bonusPoints: { name: 'bonus_color_pair_opponents', params: { color: 'Green', value: 1 } },
    bonusDescription: '+1 for every 2 Green traits opponents have'
  },
  {
    name: 'Tiny Arms',
    faceValue: -1,
    color: 'Red',
    expansion: 'Dinolings',
    bonusPoints: { name: 'bonus_discard_expansion', params: { expansion: 'Dinolings', value: 1 } },
    bonusDescription: '+1 for each Dinolings card in discard'
  },
  {
    name: 'Serrated Teeth',
    faceValue: -1,
    color: 'Red',
    expansion: 'Dinolings',
    bonusPoints: { name: 'bonus_discard_dominant', params: { value: 1 } },
    bonusDescription: '+1 for each Dominant in discard'
  },
  {
    name: 'Cranial Crest',
    faceValue: 1,
    color: 'Colorless',
    expansion: 'Dinolings',
    bonusPoints: { name: 'bonus_every_negative_discard', params: { every: 3, value: 1 } },
    bonusDescription: '+1 for every 3 negative cards in discard'
  },

  // === DOMINANT TRAITS ===
  {
    name: 'Indomitable',
    faceValue: 10,
    color: 'Red',
    expansion: 'Base',
    isDominant: true,
    effects: [{ name: 'modify_gene_pool', params: { affected_players: 'self', value: -2 } }],
    removeEffects: [{ name: 'modify_gene_pool', params: { affected_players: 'self', value: 2 } }]
  },
  {
    name: 'Legendary',
    faceValue: 8,
    color: 'Blue',
    expansion: 'Base',
    isDominant: true,
    effects: [
      { name: 'discard_hand', params: { affected_players: 'self' } },
      { name: 'skip_stabilization', params: { affected_players: 'self' } }
    ]
  },
  {
    name: 'Apex Predator',
    faceValue: 4,
    color: 'Red',
    expansion: 'Base',
    isDominant: true,
    bonusPoints: { name: 'bonus_more_traits', params: { value: 4 } },
    bonusDescription: '+4 if you have the most traits'
  },
  {
    name: 'Camouflage',
    faceValue: 1,
    color: 'Purple',
    expansion: 'Base',
    isDominant: true,
    effects: [{ name: 'modify_gene_pool', params: { affected_players: 'self', value: 1 } }],
    removeEffects: [{ name: 'modify_gene_pool', params: { affected_players: 'self', value: -1 } }],
    bonusPoints: { name: 'bonus_number_cards_hand', params: {} },
    bonusDescription: '+points equal to cards in your hand'
  },
  {
    name: 'Immunity',
    faceValue: 4,
    color: 'Blue',
    expansion: 'Base',
    isDominant: true,
    bonusPoints: { name: 'bonus_negative_face_value', params: { value: 2 } },
    bonusDescription: '+2 for each negative face value trait you have'
  },
  {
    name: 'Tiny',
    faceValue: 17,
    color: 'Blue',
    expansion: 'Base',
    isDominant: true,
    bonusPoints: { name: 'bonus_number_traits', params: { value: -1 } },
    bonusDescription: '-1 for each trait you have (including this)'
  },
  {
    name: 'Symbiosis',
    faceValue: 3,
    color: 'Green',
    expansion: 'Base',
    isDominant: true,
    bonusPoints: { name: 'bonus_lowest_color', params: { value: 2 } },
    bonusDescription: '+2x your lowest color count (need 2+ colors)'
  },
  {
    name: 'Pack Behavior',
    faceValue: 3,
    color: 'Green',
    expansion: 'Base',
    isDominant: true,
    nCards: 2,
    bonusPoints: { name: 'bonus_color_pair', params: { value: 1 } },
    bonusDescription: '+1 for every 2 of the same color trait'
  },
  {
    name: 'Heroic',
    faceValue: 7,
    color: 'Green',
    expansion: 'Base',
    isDominant: true,
    playConditions: [{ name: 'at_least_n_traits', params: { num_traits: 3, color: 'Green' } }],
    requirementDescription: 'Requires 3 Green traits in your trait pile'
  },

  // === REQUIREMENT TRAITS ===
  {
    name: 'Delicious',
    faceValue: 4,
    color: 'Colorless',
    expansion: 'Base',
    playConditions: [{ name: 'at_least_n_traits', params: { num_traits: 1, color: 'Colorless' } }],
    requirementDescription: 'Requires 1 Colorless trait in your trait pile'
  },

  // === MORE ACTION TRAITS ===
  {
    name: 'Clever',
    faceValue: 1,
    color: 'Purple',
    expansion: 'Base',
    actions: [{ name: 'view_top_deck', params: { value: 3 } }],
    actionDescription: 'Look at top 3 cards of trait deck'
  },
  {
    name: 'Directly Register',
    faceValue: 1,
    color: 'Purple',
    expansion: 'Base',
    actions: [{ name: 'draw_cards', params: { affected_players: 'self', value: 1 } }],
    actionDescription: 'Draw 1 card'
  },
  {
    name: 'Memory',
    faceValue: 2,
    color: 'Purple',
    expansion: 'Base',
    actions: [{ name: 'search_discard', params: { affected_players: 'self' } }],
    actionDescription: 'Take a card from the discard pile'
  },
  {
    name: 'Nosy',
    faceValue: 1,
    color: 'Purple',
    expansion: 'Base',
    actions: [{ name: 'view_opponent_hand', params: {} }],
    actionDescription: 'Look at an opponent\'s hand'
  },
  {
    name: 'Inventive',
    faceValue: 1,
    color: 'Purple',
    expansion: 'Base',
    actions: [{ name: 'rearrange_traits', params: {} }],
    actionDescription: 'Rearrange traits in your pile'
  },
  {
    name: 'Impatience',
    faceValue: 1,
    color: 'Purple',
    expansion: 'Base',
    actions: [
      { name: 'draw_cards', params: { affected_players: 'self', value: 2 } },
      { name: 'discard_card_from_hand', params: { affected_players: 'self', num_cards: 1 } }
    ],
    actionDescription: 'Draw 2, then discard 1'
  },
  {
    name: 'Cold Blood',
    faceValue: 1,
    color: 'Blue',
    expansion: 'Base',
    actions: [{ name: 'draw_cards', params: { affected_players: 'self', value: 1 } }],
    actionDescription: 'Draw 1 card'
  },
  {
    name: 'Flight',
    faceValue: 2,
    color: 'Blue',
    expansion: 'Base',
    actions: [{ name: 'return_trait_to_hand', params: { affected_players: 'self' } }],
    actionDescription: 'Return one of your traits to your hand'
  },
  {
    name: 'Selective Memory',
    faceValue: 0,
    color: 'Blue',
    expansion: 'Base',
    actions: [{ name: 'search_discard', params: { affected_players: 'self' } }],
    actionDescription: 'Take a card from the discard pile'
  },
  {
    name: 'Scutes',
    faceValue: 3,
    color: 'Blue',
    expansion: 'Base',
    actions: [{ name: 'protect_traits', params: { affected_players: 'self' } }],
    actionDescription: 'Your traits cannot be removed this round'
  },
  {
    name: 'Trunk',
    faceValue: 0,
    color: 'Blue',
    expansion: 'Base',
    actions: [{ name: 'draw_cards', params: { affected_players: 'self', value: 2 } }],
    actionDescription: 'Draw 2 cards'
  },
  {
    name: 'Tentacles',
    faceValue: 1,
    color: 'Blue',
    expansion: 'Base',
    nCards: 2,
    actions: [{ name: 'steal_trait', params: { affected_players: 'opponents' } }],
    actionDescription: 'Steal a non-dominant trait from an opponent'
  },
  {
    name: 'Photosynthesis',
    faceValue: 1,
    color: 'Green',
    expansion: 'Base',
    actions: [{ name: 'draw_cards', params: { affected_players: 'self', value: 1 } }],
    actionDescription: 'Draw 1 card'
  },
  {
    name: 'Self-Replicating',
    faceValue: 0,
    color: 'Green',
    expansion: 'Base',
    nCards: 2,
    persistent: true,
    actions: [{ name: 'draw_cards', params: { affected_players: 'self', value: 1 } }],
    actionDescription: 'Draw 1 card (persistent: triggers each round)'
  },
  {
    name: 'Reckless',
    faceValue: 3,
    color: 'Red',
    expansion: 'Base',
    actions: [{ name: 'discard_hand_draw_new', params: { affected_players: 'self' } }],
    actionDescription: 'Discard your hand, draw that many +1'
  },
  {
    name: 'Poisonous',
    faceValue: 2,
    color: 'Purple',
    expansion: 'Base',
    actions: [{ name: 'discard_opponent_trait', params: {} }],
    actionDescription: 'Discard a non-dominant trait from an opponent'
  },
  {
    name: 'Selfish',
    faceValue: 1,
    color: 'Purple',
    expansion: 'Base',
    actions: [{ name: 'steal_random_card', params: { affected_players: 'opponents' } }],
    actionDescription: 'Steal a random card from an opponent\'s hand'
  },
  {
    name: 'Telekinetic',
    faceValue: 1,
    color: 'Purple',
    expansion: 'Base',
    nCards: 2,
    actions: [{ name: 'move_trait', params: {} }],
    actionDescription: 'Move a non-dominant trait between players'
  },
  {
    name: 'Persuasive',
    faceValue: 1,
    color: 'Purple',
    expansion: 'Base',
    actions: [{ name: 'swap_trait', params: {} }],
    actionDescription: 'Swap a non-dominant trait with an opponent'
  },
  {
    name: 'Venomous',
    faceValue: 2,
    color: 'Purple',
    expansion: 'Base',
    actions: [{ name: 'discard_card_from_hand', params: { affected_players: 'opponents', num_cards: 2, target_player: 'choose' } }],
    actionDescription: 'Choose an opponent to discard 2 cards'
  },
  {
    name: 'Doting',
    faceValue: 2,
    color: 'Colorless',
    expansion: 'Base',
    actions: [{ name: 'give_cards', params: { affected_players: 'opponent', num_cards: 2 } }],
    actionDescription: 'Give 2 cards to an opponent'
  },
  {
    name: 'The Third Eye',
    faceValue: 0,
    color: 'Colorless',
    expansion: 'Base',
    actions: [
      { name: 'view_age_deck', params: { value: 1 } },
      { name: 'play_another_trait', params: { num_traits: 1 } }
    ],
    actionDescription: 'Peek at next age, play another trait'
  },
  {
    name: 'Automimicry',
    faceValue: 0,
    color: 'Blue',
    expansion: 'Base',
    actions: [{ name: 'copy_opponent_trait', params: {} }],
    actionDescription: 'Copy a trait effect from an opponent'
  },
  {
    name: 'Painted Shell',
    faceValue: 1,
    color: 'Blue',
    expansion: 'Base',
    actions: [{ name: 'view_opponent_hand', params: {} }],
    actionDescription: 'Look at an opponent\'s hand'
  },
  {
    name: 'Costly Signaling',
    faceValue: -2,
    color: 'Blue',
    expansion: 'Base',
    actions: [{ name: 'steal_random_card', params: { affected_players: 'opponents' } }],
    actionDescription: 'Steal a random card from an opponent'
  },
  {
    name: 'Tiny Little Melons',
    faceValue: 1,
    color: 'Green',
    expansion: 'Base',
    actions: [{ name: 'give_cards', params: { affected_players: 'opponent', num_cards: 1 } }],
    actionDescription: 'Give 1 card to an opponent'
  },

  // === PLAY_WHEN (Out of turn) TRAITS ===
  {
    name: 'Late',
    faceValue: 1,
    color: 'Colorless',
    expansion: 'Base',
    playWhen: 'catastrophe',
    playWhenDescription: 'Play when a catastrophe is revealed'
  },
  {
    name: 'Self-Awareness',
    faceValue: -1,
    color: 'Colorless',
    expansion: 'Base',
    playWhen: 'targeted',
    playWhenDescription: 'Play when you are targeted by an effect'
  },
  {
    name: 'Chromatophores',
    faceValue: 0,
    color: 'Blue',
    expansion: 'Base',
    playWhen: 'restriction',
    playWhenDescription: 'Play when an age restricts a color'
  },
  {
    name: 'Parasitic',
    faceValue: -2,
    color: 'Purple',
    expansion: 'Base',
    playWhen: 'opponent_plays',
    playWhenDescription: 'Play when an opponent plays a trait'
  },
  {
    name: 'Automimicry (-1)',
    faceValue: -1,
    color: 'Blue',
    expansion: 'Base',
    playWhen: 'targeted',
    playWhenDescription: 'Play when you are targeted by a trait effect'
  },

  // === PERSISTENT TRAITS ===
  {
    name: 'Regenerative Tissue',
    faceValue: 0,
    color: 'Blue',
    expansion: 'Base',
    nCards: 2,
    persistent: true,
    persistentEffect: { name: 'draw_if_discarded', params: { value: 1 } },
    persistentDescription: 'Draw 1 card whenever you discard a trait'
  },
  {
    name: 'Endurance',
    faceValue: 1,
    color: 'Red',
    expansion: 'Base',
    persistent: true,
    persistentEffect: { name: 'cannot_be_removed', params: {} },
    persistentDescription: 'This trait cannot be removed'
  },
  {
    name: 'Denial',
    faceValue: 4,
    color: 'Colorless',
    expansion: 'Base',
    isDominant: true,
    persistent: true,
    persistentEffect: { name: 'ignore_catastrophe_effects', params: {} },
    persistentDescription: 'Ignore catastrophe effects'
  },
  {
    name: 'Echolocation',
    faceValue: 4,
    color: 'Blue',
    expansion: 'Base',
    isDominant: true,
    persistent: true,
    persistentEffect: { name: 'draw_at_round_start', params: { value: 1 } },
    persistentDescription: 'Draw 1 card at the start of each round'
  },

  // === WORLD'S END TRAITS ===
  {
    name: 'Eloquence',
    faceValue: 1,
    color: 'Colorless',
    expansion: 'Base',
    worldsEnd: true,
    worldsEndEffect: { name: 'worlds_end_draw', params: { value: 2 } },
    worldsEndDescription: "World's End: Draw 2 cards"
  },
  {
    name: 'Faith',
    faceValue: 4,
    color: 'Colorless',
    expansion: 'Base',
    isDominant: true,
    worldsEnd: true,
    worldsEndEffect: { name: 'may_change_color', params: {} },
    worldsEndDescription: "World's End: This trait may become any color"
  },
  {
    name: 'Hyper-Intelligence',
    faceValue: 4,
    color: 'Red',
    expansion: 'Base',
    isDominant: true,
    worldsEnd: true,
    worldsEndEffect: { name: 'play_from_hand', params: {} },
    worldsEndDescription: "World's End: Play all remaining traits from hand"
  },
  {
    name: 'Sentience',
    faceValue: 2,
    color: 'Red',
    expansion: 'Base',
    isDominant: true,
    worldsEnd: true,
    bonusPoints: { name: 'bonus_catastrophe_count', params: { value: 1 } },
    worldsEndEffect: { name: 'choose_color', params: {} },
    bonusDescription: '+1 per catastrophe that occurred',
    worldsEndDescription: "World's End: Choose this trait's color"
  },
  {
    name: 'Sneaky',
    faceValue: 2,
    color: 'Purple',
    expansion: 'Base',
    worldsEnd: true,
    worldsEndEffect: { name: 'steal_trait_at_end', params: {} },
    worldsEndDescription: "World's End: Steal a non-dominant trait"
  },
  {
    name: 'Optimistic Nihilism',
    faceValue: 4,
    color: 'Colorless',
    expansion: 'Base',
    isDominant: true,
    worldsEnd: false // This is actually just a high-value dominant
  },
  {
    name: 'Morality',
    faceValue: 5,
    color: 'Colorless',
    expansion: 'Base',
    playConditions: [{ name: 'at_least_n_traits', params: { num_traits: 2, color: 'Colorless' } }],
    requirementDescription: 'Requires 2 Colorless traits in your trait pile'
  },
  {
    name: 'Retractable Claws',
    faceValue: 5,
    color: 'Red',
    expansion: 'Base',
    playConditions: [{ name: 'at_least_n_traits', params: { num_traits: 2, color: 'Red' } }],
    requirementDescription: 'Requires 2 Red traits in your trait pile'
  },
  {
    name: 'Prepper',
    faceValue: 2,
    color: 'Colorless',
    expansion: 'Base',
    worldsEnd: true,
    worldsEndEffect: { name: 'draw_at_end', params: { value: 3 } },
    worldsEndDescription: "World's End: Draw 3 cards"
  }
];

// Helper to get number of copies for a trait (default 1)
export function getTraitCopies(trait) {
  return trait.nCards || 1;
}

// Export everything combined for convenience
export const allCards = {
  birthOfLife,
  ageCards,
  catastrophes,
  traits
};
