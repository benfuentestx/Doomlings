# Doomlings Game - Development Guidelines

## Design Philosophy: Portrait-Mobile-First

This game is designed **exclusively for portrait mobile devices**.

### Key Principles

1. **Portrait Mode Only**: The game is optimized for portrait orientation on mobile devices (320px - 430px width typical)
2. **No Landscape Support**: Do not add landscape or desktop responsive breakpoints
3. **No Media Queries for Desktop**: All CSS should assume a narrow, vertical viewport
4. **Touch-First Interactions**: Design for touch/tap interactions, not hover states

### Layout Strategy

- **Vertical Stacking**: All game elements stack vertically
- **Full-Width Components**: Most components should span the full width
- **Scrollable Areas**: Use vertical scrolling for overflow content
- **Fixed Viewport**: The viewport is locked to portrait orientation

### Code Guidelines

When working on this codebase:

- ✅ Design for 375px width (iPhone standard) as the baseline
- ✅ Use flexbox with `flex-direction: column` for layouts
- ✅ Make trait piles, opponent panels, and cards full-width or appropriately sized for mobile
- ✅ Test on mobile devices or mobile viewport in dev tools
- ❌ Don't add desktop-specific styles or wide-screen layouts
- ❌ Don't create multi-column grids (except for card grids)
- ❌ Don't use large fixed widths (keep everything fluid and responsive within portrait constraints)

### Component Sizing

- **Cards in hand**: Sized to fit ~3-4 cards visible with horizontal scroll
- **Opponent trait piles**: Full width, cards wrap to multiple rows
- **Player trait pile**: Full width with card wrapping
- **Modal overlays**: Full screen on mobile

### Future Development

All new features and components should be designed with portrait mobile as the primary (and only) target. Desktop/landscape support is explicitly not a goal for this project.

---

## Game Rules Reference

**Source of Truth:** [`docs/DOOMLINGS_INSTRUCTIONS.md`](docs/DOOMLINGS_INSTRUCTIONS.md)

This document contains the complete game rules based on the official Doomlings rulebook. When implementing or modifying game logic, **always reference this file** to ensure accuracy.

Key sections include:
- **Setup** - Age deck construction, starting hands, Gene Pool initialization
- **Gene Pool** - Hand size management (range 1-8, stabilization rules)
- **Turn Structure** - Play trait → Follow effects → Stabilize
- **Ages** - Round-based effects and restrictions
- **Catastrophes** - Gene Pool effect + Catastrophic effect + World's End effect
- **World's End** - End game resolution order
- **Scoring** - Face values + bonuses + World's End modifiers + Gene Pool leader bonus
- **Dominant Traits** - Protection rules, 2-card limit, exceptions

The game engine may not yet implement all rules in this document. Use it as the specification for continued development.

---

## Game Engine & Card Data Architecture

### Overview

The game logic flows through three main files:
- **`js/cards-data.js`** - Card definitions (traits, ages, catastrophes)
- **`js/game-engine.js`** - Game state management and action processing
- **`game.html`** - Frontend rendering and user interaction

### Card Data Structure (`js/cards-data.js`)

Each trait card can have:

```javascript
{
  name: 'Card Name',
  faceValue: 2,              // Base point value (shown on card)
  color: 'Red',              // Red, Blue, Green, Purple, Colorless, or multi (e.g., 'Red_Blue')
  expansion: 'Base',
  actions: [...],            // Triggered WHEN PLAYED (one-time effects)
  effects: [...],            // PASSIVE scoring bonuses (calculated at end)
  actionDescription: '...'   // UI tooltip text
}
```

### Actions vs Effects

| Type | When Triggered | Examples |
|------|----------------|----------|
| **Actions** | Once, when card is played | Draw cards, steal traits, view deck, give cards |
| **Effects** | Continuously, during scoring | "+1 per blue trait", "double if most traits" |

### Action Processing Flow

1. Player plays a card → `game-engine.js: playCard()`
2. For each action in `card.actions`:
   - `ActionProcessor.processAction(action, player, gameState)` is called
   - Returns `{ needsInput: false }` if action completes immediately
   - Returns `{ needsInput: true, inputType: '...', options: [...] }` if user input needed
3. If input needed → `pendingAction` is set → Frontend shows modal
4. User selects → `handlePendingAction()` → action completes

### Common Action Types

| Action Name | Purpose | Key Params |
|-------------|---------|------------|
| `draw_cards` | Draw from trait deck | `num_cards`, `affected_players` |
| `discard_trait` | Discard from trait pile | `affected_players`, `color_filter` |
| `steal_trait` | Take opponent's trait | `color_filter` |
| `view_age_deck` | Peek at upcoming ages | `value` (count) |
| `play_another_trait` | Grant extra play | `num_traits` |
| `modify_gene_pool` | Change hand size | `value`, `affected_players` |
| `give_cards` | Give cards to opponent | `num_cards` |

### Pending Action Input Types

When an action needs user input, it returns an `inputType`:

| Input Type | Modal Shown | User Selects |
|------------|-------------|--------------|
| `select_opponent` | List of opponents | One opponent |
| `select_opponent_trait` | Opponent trait piles | One trait card |
| `select_own_cards` | Player's hand | Card(s) to discard/give |
| `select_own_trait` | Player's trait pile | One of own traits |
| `select_from_discard` | Discard pile | Card to retrieve |
| `view_cards` | Card display | Nothing (just viewing) |

### Adding a New Card

1. Add card definition to `js/cards-data.js` in the appropriate array
2. If new action type needed, add handler in `ActionProcessor.processAction()`
3. If new input type needed, add modal handler in `game.html`
4. Add tooltip description to `cardDescriptions` object in `game.html`
5. Ensure card image exists at `images/cards/CARD NAME.png` (uppercase)

### Example: Card with Action

```javascript
{
  name: 'The Third Eye',
  faceValue: 0,
  color: 'Colorless',
  actions: [
    { name: 'view_age_deck', params: { value: 1 } },      // See next age
    { name: 'play_another_trait', params: { num_traits: 1 } }  // Extra play
  ],
  actionDescription: 'Peek at next age, play another trait'
}
```

### Example: Card with Scoring Effect

```javascript
{
  name: 'Pack Mentality',
  faceValue: 1,
  color: 'Red',
  effects: [{
    name: 'bonus_per_color',
    params: { color: 'Red', value: 1 }  // +1 per other red trait
  }]
}
```

### Dominant Cards

Dominant cards are powerful traits with special protection. Key properties:

```javascript
{
  name: 'Apex Predator',
  faceValue: 4,
  color: 'Red',
  isDominant: true,                    // REQUIRED: Marks as dominant
  bonusPoints: { name: 'bonus_more_traits', params: { value: 4 } },
  bonusDescription: '+4 if you have the most traits',
  playConditions: [...],               // Optional: Requirements to play
  removeEffects: [...]                 // Optional: Triggers when removed
}
```

**Dominant Protection:**
- Cannot be stolen by opponents
- Cannot be discarded by opponent effects
- Cannot be swapped with opponents
- The game engine automatically filters dominants out of target lists

**Dominant-Specific Properties:**

| Property | Purpose |
|----------|---------|
| `isDominant: true` | Marks card as dominant (enables protection) |
| `bonusPoints` | Scoring bonus (different from `effects`) |
| `bonusDescription` | UI text explaining the bonus |
| `playConditions` | Requirements to play (e.g., "need 3 green traits") |
| `removeEffects` | Effects when card leaves trait pile (undo gene pool changes) |

**Example: Dominant with Play Condition**

```javascript
{
  name: 'Bioluminescence',
  faceValue: 7,
  color: 'Green',
  isDominant: true,
  playConditions: [{ name: 'at_least_n_traits', params: { num_traits: 3, color: 'Green' } }],
  requirementDescription: 'Requires 3 Green traits in your trait pile'
}
```

**Example: Dominant with Remove Effects**

```javascript
{
  name: 'Neoteny',
  faceValue: 10,
  color: 'Red',
  isDominant: true,
  effects: [{ name: 'modify_gene_pool', params: { affected_players: 'self', value: -2 } }],
  removeEffects: [{ name: 'modify_gene_pool', params: { affected_players: 'self', value: 2 } }]
  // When played: Gene Pool -2. When removed: Gene Pool +2 (restores it)
}
```

---

## Ages and Catastrophes

### Game Flow Overview

The game progresses through **Ages** until 3 **Catastrophes** occur, ending the game:

1. Game starts with "Birth of Life" (special starting age)
2. Age deck is built: 3 piles of ~10 ages each, with 1 catastrophe shuffled into each pile
3. Each round, a new age is revealed from the deck
4. When a catastrophe is drawn, it triggers immediately and the next age begins
5. After the 3rd catastrophe, the game ends and World's End effects resolve

### Age Card Structure

```javascript
{
  type: 'age',
  name: 'Tropical Lands',
  turnEffects: [...],      // Restrictions/rules that apply this ROUND
  instantEffects: [...],   // One-time effects when age is revealed
  expansion: 'Base',
  description: 'Cannot play Colorless traits this round'  // UI text
}
```

### Age Effect Types

| Effect Array | When Applied | Purpose |
|--------------|--------------|---------|
| `turnEffects` | Stored for the round | Restrictions/rules players must follow |
| `instantEffects` | Immediately on reveal | One-time effects (draw cards, modify gene pool) |

### Common Turn Effects (Restrictions)

Turn effects create restrictions for the current round:

```javascript
// Color restriction - blocks playing certain colors
{ name: 'add_turn_restriction', params: {
  restricted_attribute: 'color',
  restricted_value: 'Blue',      // Red, Blue, Green, Purple, Colorless
  restricted_type: 'equal'
}}

// Face value restriction - blocks high/low value cards
{ name: 'add_turn_restriction', params: {
  restricted_attribute: 'face_value',
  restricted_value: 3,
  restricted_type: 'greater_than'  // or 'less_than'
}}

// Ignore all action effects this round
{ name: 'turn_ignore_actions', params: {} }

// Override stabilization target
{ name: 'set_end_turn_number_cards', params: { num_cards: 4 } }
```

### Common Instant Effects

```javascript
// All players draw cards
{ name: 'draw_cards', params: { affected_players: 'all', value: 2 } }

// Modify gene pool
{ name: 'modify_gene_pool', params: { affected_players: 'all', value: 5 } }

// Random discard from hand
{ name: 'discard_card_from_hand', params: {
  affected_players: 'all',
  num_cards: 1,
  random_discard: true
}}

// Auto-play Heroic cards
{ name: 'play_heroic', params: {} }

// Stabilize all players to gene pool
{ name: 'stabilize_all_players', params: { reset_stabilize: true } }
```

### Birth of Life (Special Starting Age)

The game always starts with this special age:

```javascript
{
  type: 'age',
  name: 'The Birth of Life',
  instantEffects: [
    { name: 'modify_gene_pool', params: { affected_players: 'all', value: 5 } },
    { name: 'stabilize_all_players', params: { reset_stabilize: true } },
    { name: 'modify_number_cards_turn', params: { affected_players: 'all', value: 1 } }
  ]
}
```

This sets each player's gene pool to 5 and draws their starting hand.

---

### Catastrophe Card Structure

```javascript
{
  type: 'catastrophe',
  name: 'Ice Age',
  genePoolEffect: -1,           // Permanent gene pool change for ALL players
  catastropheEffects: [...],    // Immediate effects when catastrophe hits
  worldEndEffect: {...},        // Applied at game end (3rd catastrophe only affects scoring)
  expansion: 'Base',
  description: 'Gene Pool -1. Discard 1 card for each Red trait...'
}
```

### Catastrophe Processing Order

When a catastrophe is revealed:

1. **Gene Pool Effect** - All players' gene pools modified permanently
2. **First Player Rotation** - First player marker moves left
3. **Catastrophe Effects** - Immediate effects resolve
4. **Game End Check** - If 3rd catastrophe, game ends
5. **World's End Effects** - Only the final catastrophe's `worldEndEffect` applies to scoring

### Common Catastrophe Effects

```javascript
// Discard cards for each trait of a color
{ name: 'discard_card_from_hand_for_every_color', params: {
  affected_players: 'all',
  color: 'Red'
}}

// Discard cards for each dominant trait
{ name: 'discard_card_from_hand_for_every_dominant', params: {
  affected_players: 'all'
}}

// Draw cards for unique colors in trait pile
{ name: 'draw_card_for_every_color_type', params: {
  affected_players: 'all'
}}
```

### World's End Effects (Final Scoring)

Only the 3rd catastrophe's `worldEndEffect` modifies final scoring:

```javascript
// Points for fewest traits
{ name: 'modify_world_end_points_fewest_traits', params: {
  affected_players: 'all',
  value: 4
}}

// Points per color trait (usually negative)
{ name: 'modify_world_end_points_for_every_color', params: {
  affected_players: 'all',
  color: 'Red',
  value: -1
}}

// Points per face value comparison
{ name: 'modify_world_end_points_face_value', params: {
  affected_players: 'all',
  face_value: 2,
  compare_type: 'greater_than',
  value: -1
}}

// Force discard from trait pile
{ name: 'discard_card_from_trait_pile', params: {
  affected_players: 'all',
  color: 'Green',
  num_cards: 1
}}
```

### Example: Complete Catastrophe

```javascript
{
  type: 'catastrophe',
  name: 'Ice Age',
  genePoolEffect: -1,  // All gene pools -1
  catastropheEffects: [
    // Discard 1 card from hand per Red trait you have
    { name: 'discard_card_from_hand_for_every_color', params: {
      affected_players: 'all',
      color: 'Red'
    }}
  ],
  worldEndEffect: {
    // At game end: -1 point per Red trait
    name: 'modify_world_end_points_for_every_color',
    params: { affected_players: 'all', color: 'Red', value: -1 }
  },
  description: 'Gene Pool -1. Discard 1 card for each Red trait. World\'s End: -1 point per Red trait.'
}
```

### Adding a New Age

1. Add to `ageCards` array in `js/cards-data.js`
2. Use existing effect types or add new handlers in `game-engine.js`:
   - Turn effects: `canPlayCard()` checks restrictions
   - Instant effects: `applyInstantEffects()` processes them
3. Add description text for UI display

### Adding a New Catastrophe

1. Add to `catastrophes` array in `js/cards-data.js`
2. Set `genePoolEffect` (positive or negative integer)
3. Add `catastropheEffects` using existing effect types or add handlers in `CardEffects.applyCatastropheEffects()`
4. Add `worldEndEffect` using existing types or add handlers in `CardEffects.applyWorldEndEffect()`
5. Write description for UI
