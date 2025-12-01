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
    turnEffects: [],
    instantEffects: [
      { name: 'draw_cards', params: { affected_players: 'all', value: 1 } },
      { name: 'discard_card_from_hand', params: { affected_players: 'all', num_cards: 1, random_discard: false } }
    ],
    expansion: 'Base',
    description: 'Draw 1 card. Discard 1 card from your hand'
  },
  {
    type: 'age',
    name: 'Badlands',
    turnEffects: [],
    instantEffects: [
      { name: 'discard_card_from_hand', params: { affected_players: 'all', num_cards: 1, random_discard: false } },
      { name: 'deal_from_discard_pile', params: { affected_players: 'all', num_cards: 1 } }
    ],
    expansion: 'Base',
    description: 'Discard 1 card. Deal 1 card from shuffled discard pile to each player'
  },
  {
    type: 'age',
    name: 'Natural Harmony',
    turnEffects: [
      { name: 'cannot_play_same_color', params: {} }
    ],
    instantEffects: [],
    expansion: 'Base',
    description: 'You may not play a trait of the same color as the last trait played'
  },
  {
    type: 'age',
    name: 'Prosperity',
    turnEffects: [
      { name: 'optional_stabilization', params: {} }
    ],
    instantEffects: [],
    expansion: 'Base',
    description: 'At the end of your turn, you may choose not to stabilize'
  },
  {
    type: 'age',
    name: 'Reforestation',
    turnEffects: [
      { name: 'protect_traits', params: {} }
    ],
    instantEffects: [],
    expansion: 'Base',
    description: 'Traits in your trait pile cannot be swapped, stolen, or discarded'
  },
  {
    type: 'age',
    name: 'Coastal Formations',
    turnEffects: [],
    instantEffects: [
      { name: 'draw_card_after_stabilize', params: { affected_players: 'all', value: 1 } }
    ],
    expansion: 'Base',
    description: 'Draw 1 card after you stabilize'
  },
  {
    type: 'age',
    name: 'Enlightenment',
    turnEffects: [
      { name: 'optional_discard_before_stabilize', params: { affected_players: 'all', max_cards: 2 } }
    ],
    instantEffects: [],
    expansion: 'Base',
    description: 'You may discard up to 2 cards from your hand before you stabilize'
  },
  {
    type: 'age',
    name: 'Galactic Drift',
    turnEffects: [
      { name: 'colorless_allows_extra_play', params: {} }
    ],
    instantEffects: [],
    expansion: 'Base',
    description: 'If you play a colorless trait, you may play another colorless trait'
  },
  {
    type: 'age',
    name: 'High Tides',
    turnEffects: [
      { name: 'effectless_allows_extra_play', params: {} }
    ],
    instantEffects: [],
    expansion: 'Base',
    description: 'If you play an effectless trait, you may play another effectless trait'
  },
  {
    type: 'age',
    name: 'Age of Dracula',
    turnEffects: [],
    instantEffects: [
      { name: 'discard_card_from_hand', params: { affected_players: 'all', num_cards: 1, random_discard: true } },
      { name: 'steal_random_card_if_vampirism', params: {} }
    ],
    expansion: 'Base',
    description: 'Discard 1 random card from your hand. If Vampirism is in your trait pile, steal 1 random card from an opponent\'s hand'
  },
  {
    type: 'age',
    name: 'Age of Nietzsche',
    turnEffects: [
      { name: 'optional_stabilization_draw_3', params: {} }
    ],
    instantEffects: [],
    expansion: 'Base',
    description: 'Instead of stabilizing this turn, you may discard your hand and draw 3 cards'
  },
  {
    type: 'age',
    name: 'Age of Reason',
    turnEffects: [],
    instantEffects: [
      { name: 'draw_keep_1_discard_2', params: { affected_players: 'all' } }
    ],
    expansion: 'Base',
    description: 'Draw 3 cards. Keep 1, discard the other 2'
  },
  {
    type: 'age',
    name: 'Awakening',
    turnEffects: [
      { name: 'preview_next_age', params: {} }
    ],
    instantEffects: [],
    expansion: 'Base',
    description: 'Preview the next age before you take your turn'
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
  },
  {
    type: 'catastrophe',
    name: 'Solar Flare',
    genePoolEffect: -1,
    catastropheEffects: [
      { name: 'discard_half_hand', params: { affected_players: 'all' } }
    ],
    worldEndEffect: { name: 'modify_world_end_points_for_every_color', params: { affected_players: 'all', color: 'Purple', value: -1 } },
    expansion: 'Base',
    description: 'Gene Pool -1. Discard half your hand rounded up. World\'s End: -1 point per Purple trait.'
  },
  {
    type: 'catastrophe',
    name: 'The Big One',
    genePoolEffect: -1,
    catastropheEffects: [
      { name: 'give_cards_to_adjacent_opponents', params: { num_cards: 1 } }
    ],
    worldEndEffect: { name: 'modify_world_end_points_missing_colors', params: { affected_players: 'all', value: -2 } },
    expansion: 'Base',
    description: 'Gene Pool -1. Give 1 card to opponents on your left and right. World\'s End: -2 to your score for each color missing from your trait pile.'
  },
  {
    type: 'catastrophe',
    name: 'The Four Horsemen',
    genePoolEffect: -1,
    catastropheEffects: [
      { name: 'discard_trait_from_pile', params: { affected_players: 'all', num_cards: 1 } }
    ],
    worldEndEffect: { name: 'discard_trait_from_pile_face_value', params: { affected_players: 'all', num_cards: 1, face_value: 4, compare_type: 'greater_than_or_equal' } },
    expansion: 'Base',
    description: 'Gene Pool -1. Discard 1 trait from your trait pile. World\'s End: Discard 1 trait from your trait pile with a face value of 4 or higher.'
  },
  {
    type: 'catastrophe',
    name: 'The Messiah',
    genePoolEffect: 0,
    catastropheEffects: [
      { name: 'reverse_turn_order', params: {} }
    ],
    worldEndEffect: null,
    expansion: 'Base',
    description: 'Play this age in reverse: first player last and last player first.'
  },
  {
    type: 'catastrophe',
    name: 'AI Takeover',
    genePoolEffect: -1,
    catastropheEffects: [
      { name: 'discard_all_but_n_cards', params: { affected_players: 'all', num_cards: 1 } }
    ],
    worldEndEffect: { name: 'colorless_worth_2_ignore_effects', params: { affected_players: 'all' } },
    expansion: 'Techlings',
    description: 'Gene Pool -1. Discard all but 1 card from your hand. World\'s End: Each colorless trait is now worth 2. Ignore all colorless trait effects. (Excluding dominants.)'
  },
  {
    type: 'catastrophe',
    name: 'Alien Terraform',
    genePoolEffect: 0,
    catastropheEffects: [
      { name: 'stabilize_all_players', params: { reset_stabilize: true } }
    ],
    worldEndEffect: null,
    expansion: 'Mythlings',
    description: 'You may discard dominant cards from your hand. If you do, then stabilize immediately.'
  },
  {
    type: 'catastrophe',
    name: 'Deus Ex Machina',
    genePoolEffect: 0,
    catastropheEffects: [
      { name: 'stabilize_all_players', params: { reset_stabilize: true } }
    ],
    worldEndEffect: { name: 'draw_card_add_face_value_max_5', params: { affected_players: 'all' } },
    expansion: 'Mythlings',
    description: 'Stabilize. Crisis averted. World\'s End: Draw a card. Add its face value to your final score (+5 max). Then discard it.'
  },
  {
    type: 'catastrophe',
    name: 'Glacial Meltdown',
    genePoolEffect: -1,
    catastropheEffects: [
      { name: 'discard_card_from_hand', params: { affected_players: 'all', num_cards: 2, random_discard: true } }
    ],
    worldEndEffect: { name: 'discard_card_from_trait_pile', params: { affected_players: 'all', color: 'Blue', num_cards: 1 } },
    expansion: 'Techlings',
    description: 'Gene Pool -1. Discard 2 cards from your hand at random. World\'s End: Discard 1 blue trait from your trait pile.'
  },
  {
    type: 'catastrophe',
    name: 'Grey Goo',
    genePoolEffect: 0,
    catastropheEffects: [
      { name: 'discard_hand_and_stabilize', params: { affected_players: 'all' } }
    ],
    worldEndEffect: { name: 'modify_world_end_points_most_traits', params: { affected_players: 'all', value: -5 } },
    expansion: 'Techlings',
    description: 'Discard your hand and stabilize. World\'s End: -5 points to the player(s) with the most traits in their trait pile.'
  },
  {
    type: 'catastrophe',
    name: 'Mega Tsunami',
    genePoolEffect: -1,
    catastropheEffects: [
      { name: 'pass_hand_right', params: { affected_players: 'all' } }
    ],
    worldEndEffect: { name: 'discard_card_from_trait_pile', params: { affected_players: 'all', color: 'Red', num_cards: 1 } },
    expansion: 'Dinolings',
    description: 'Gene Pool -1. Pass your hand to the right. World\'s End: Discard 1 red trait from your trait pile.'
  },
  {
    type: 'catastrophe',
    name: 'Nuclear Winter',
    genePoolEffect: -1,
    catastropheEffects: [
      { name: 'stabilize_all_then_discard', params: { affected_players: 'all', num_cards: 1 } }
    ],
    worldEndEffect: { name: 'discard_card_from_trait_pile', params: { affected_players: 'all', color: 'Colorless', num_cards: 1 } },
    expansion: 'Techlings',
    description: 'Gene Pool -1. Stabilize. Then discard 1 card from your hand. World\'s End: Discard 1 colorless trait from your trait pile.'
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
    actionDescription: 'All opponents discard 1 red trait from their trait pile'
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
    actions: [{ name: 'play_another_trait', params: { num_traits: 1 } }],
    actionDescription: 'Play another trait'
  },
  {
    name: 'Voracious',
    faceValue: 2,
    color: 'Red',
    expansion: 'Base',
    actions: [
      { name: 'play_another_trait', params: { num_traits: 1 } },
      { name: 'discard_card_from_trait_pile', params: { affected_players: 'self', num_cards: 1 } }
    ],
    actionDescription: 'Play another trait. Then discard 1 trait from your trait pile'
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
    faceValue: 1,
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
    bonusDescription: '+1 for each Dinoling in the discard pile'
  },
  {
    name: 'Serrated Teeth',
    faceValue: 1,
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
    bonusDescription: '-1 for each trait in your trait pile (including this one)'
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
  {
    name: 'Vampirism',
    faceValue: 3,
    color: 'Purple',
    expansion: 'Base',
    isDominant: true,
    actions: [{ name: 'steal_trait_and_play_action', params: {} }],
    actionDescription: 'Steal a trait from an opponent\'s trait pile. Play its action.'
  },
  {
    name: 'Viral',
    faceValue: 2,
    color: 'Purple',
    expansion: 'Base',
    isDominant: true,
    worldEndEffect: { name: 'choose_color_opponents_lose_points', params: {} },
    actionDescription: 'At World\'s End: Choose a color. Opponents receive -1 for each trait of that color in their trait pile.'
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
    actions: [{ name: 'opponents_reveal_steal_play', params: { reveal_count: 1 } }],
    actionDescription: 'Opponents reveal 1 card. Steal 1 and play it immediately.'
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
    actions: [{ name: 'give_trait_to_opponent', params: {} }],
    actionDescription: 'Give an opponent 1 trait from your trait pile'
  },
  {
    name: 'Trunk',
    faceValue: 1,
    color: 'Green',
    expansion: 'Base',
    actions: [{ name: 'search_discard_ignore_action', params: {} }],
    actionDescription: 'Play the top card from the discard pile. Ignore its action'
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
    actions: [{ name: 'draw_and_play_if_color', params: { value: 2, color: 'Green' } }],
    actionDescription: 'Draw 2 cards. If either are green, play 1 immediately (unless restricted)'
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
    actions: [{ name: 'mutual_discard_trait', params: {} }],
    actionDescription: 'You and an opponent discard 1 trait from each other\'s trait pile'
  },
  {
    name: 'Poisonous',
    faceValue: 2,
    color: 'Purple',
    expansion: 'Base',
    actions: [{ name: 'swap_self_with_opponent_trait', params: {} }],
    actionDescription: 'Swap Poisonous with a trait from an opponent\'s trait pile'
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
    actions: [{ name: 'swap_trait', params: { same_color: false } }],
    actionDescription: 'Swap 1 trait from your trait pile with an opponent\'s trait of a different color'
  },
  {
    name: 'Persuasive',
    faceValue: 1,
    color: 'Purple',
    expansion: 'Base',
    actions: [{ name: 'discard_color_from_hand', params: {} }],
    actionDescription: 'Choose a color - all players discard cards of that color'
  },
  {
    name: 'Venomous',
    faceValue: 2,
    color: 'Purple',
    expansion: 'Base',
    actions: [
      { name: 'play_another_trait', params: { num_traits: 1 } },
      { name: 'move_self_to_opponent', params: {} }
    ],
    actionDescription: 'Play another trait. Then move Venomous to an opponent\'s trait pile'
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
    actions: [{ name: 'steal_trait', params: { color: 'Green' } }],
    actionDescription: 'Steal 1 green trait from an opponent\'s trait pile'
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
    worldsEndEffect: { name: 'play_from_hand_at_end', params: { card_name: 'Sneaky' } },
    worldsEndDescription: "World's End: You may play Sneaky from your hand"
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
    worldsEndEffect: { name: 'choose_catastrophe_world_end', params: {} },
    worldsEndDescription: "World's End: Choose a World's End effect from the 3 catastrophes"
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
