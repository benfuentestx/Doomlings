# Pipeline Architecture for Card Effects

## Overview

This document outlines a proposed refactoring of the card effect system from the current action-handler approach to a declarative pipeline model. The goal is to make card definitions purely declarative, with all game logic handled by composable, reusable primitives.

---

## Current State Analysis

### What Works Well

1. **Action-based card definitions**: Cards define `actions: [{ name, params }]` arrays
2. **Centralized execution**: `CardEffects.executeAction()` handles action dispatch
3. **Common operations exist**: `draw_cards`, `discard_trait`, `modify_gene_pool`, etc.

### Pain Points

1. **Complex cards require custom handlers**: Cards like "Clever" need bespoke state machines (`multiPlayerAction`)
2. **Mixed concerns**: Action handlers combine operations, UI flow, and state management
3. **Scattered validation**: Play requirements and target filtering are embedded throughout
4. **Hard to compose**: No clean way to chain operations with conditions between them
5. **Expansion friction**: Each new complex card potentially requires new handler code

---

## The Pipeline Model

### Core Concept

Every card effect is a **pipeline** of steps executed in sequence. Each step is one of:

- **Action**: A state-changing operation (draw, discard, steal, etc.)
- **Collect**: A user input request (select cards, choose opponent, etc.)
- **Condition**: A validation check (has enough cards, valid target, etc.)
- **Branch**: Conditional execution based on game state

The pipeline executor runs steps in order, passing results forward, and handles async collection steps transparently.

### Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Card Definitions                      │
│         (Declarative JSON/JS pipeline specs)            │
├─────────────────────────────────────────────────────────┤
│                   Pipeline Executor                      │
│    (Runs steps, manages state, handles async flow)      │
├─────────────────────────────────────────────────────────┤
│  Collectors       │  Actions        │  Conditions       │
│  (User input)     │  (Operations)   │  (Predicates)     │
├─────────────────────────────────────────────────────────┤
│                    Game State                            │
│              (Players, cards, decks, etc.)              │
└─────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Atomic Actions

Pure functions that modify game state. Each does ONE thing.

| Action | Parameters | Description |
|--------|------------|-------------|
| `drawCards` | `player`, `count`, `source?` | Draw cards from trait deck (or specified source) |
| `discardFromHand` | `player`, `cardRefs` | Move cards from hand to discard pile |
| `discardFromTraitPile` | `player`, `cardRefs`, `filters?` | Remove traits from trait pile |
| `addToTraitPile` | `player`, `card` | Add a card to player's trait pile |
| `giveCards` | `fromPlayer`, `toPlayer`, `cardRefs` | Transfer cards between hands |
| `stealTrait` | `fromPlayer`, `toPlayer`, `traitRef` | Move trait between trait piles |
| `stealFromHand` | `fromPlayer`, `toPlayer`, `cardRef` | Take card from opponent's hand |
| `modifyGenePool` | `player`, `delta` | Adjust gene pool (clamped 1-8) |
| `swapTraits` | `playerA`, `traitA`, `playerB`, `traitB` | Exchange traits between players |
| `shuffleIntoDeck` | `cards`, `deck` | Shuffle cards into specified deck |
| `revealCards` | `cards`, `toPlayers` | Make cards visible (state flag) |
| `playTrait` | `player`, `card`, `triggerEffects?` | Add trait and optionally trigger its actions |
| `returnToHand` | `player`, `traitRef` | Move trait back to hand |
| `setExtraPlays` | `player`, `count` | Grant additional plays this turn |

**Implementation Pattern:**
```javascript
const Actions = {
  drawCards(gameState, { player, count, source = 'traitDeck' }) {
    const deck = gameState[source];
    const drawn = deck.splice(0, Math.min(count, deck.length));
    player.hand.push(...drawn);
    return { drawn }; // Return result for pipeline
  },

  stealTrait(gameState, { fromPlayer, toPlayer, traitIndex }) {
    const trait = fromPlayer.traitPile.splice(traitIndex, 1)[0];
    toPlayer.traitPile.push(trait);
    return { stolenTrait: trait };
  }
  // ... etc
};
```

### 2. Collectors

Async operations that gather user input. Each returns a promise that resolves when input is received.

| Collector | Parameters | Returns |
|-----------|------------|---------|
| `selectFromHand` | `player`, `count`, `filters?`, `message?` | `{ selectedCards, selectedIndices }` |
| `selectFromTraitPile` | `player`, `count`, `filters?` | `{ selectedTraits, selectedIndices }` |
| `selectOpponent` | `player`, `filters?` | `{ opponent }` |
| `selectOpponentTrait` | `player`, `filters?` | `{ opponent, trait, traitIndex }` |
| `selectFromDiscard` | `player`, `count`, `filters?` | `{ selectedCards }` |
| `selectColor` | `player`, `options?` | `{ color }` |
| `revealFromHand` | `players`, `count` | `{ revealedCards: [{ player, card, index }] }` |
| `viewCards` | `player`, `cards`, `message?` | `{}` (acknowledgment only) |
| `confirmAction` | `player`, `message` | `{ confirmed: boolean }` |

**Multi-player collectors** (like `revealFromHand`) handle the complexity of gathering input from multiple players simultaneously.

**Implementation Pattern:**
```javascript
const Collectors = {
  async selectFromHand(gameState, { player, count, filters, message }) {
    // Set up pending input state
    gameState.pendingInput = {
      type: 'select_from_hand',
      playerId: player.id,
      count,
      filters,
      message,
      resolve: null
    };

    // Return promise that resolves when UI submits selection
    return new Promise(resolve => {
      gameState.pendingInput.resolve = resolve;
    });
  },

  async revealFromHand(gameState, { players, count }) {
    // Multi-player collection
    const pending = {};
    players.forEach(p => {
      pending[p.id] = { responded: false, revealed: null };
    });

    gameState.pendingMultiInput = {
      type: 'reveal_cards',
      participants: pending,
      count,
      resolve: null
    };

    return new Promise(resolve => {
      gameState.pendingMultiInput.resolve = resolve;
    });
  }
};
```

### 3. Conditions

Predicate functions that return boolean. Used for validation and branching.

| Condition | Parameters | Description |
|-----------|------------|-------------|
| `hasCardsInHand` | `player`, `count` | Player has at least N cards |
| `hasTraitsOfColor` | `player`, `color`, `count` | Player has N traits of color |
| `hasTraitCount` | `player`, `count` | Player has at least N traits |
| `hasDominantTrait` | `player` | Player has any dominant trait |
| `isNotDominant` | `trait` | Trait is not dominant |
| `matchesColor` | `card`, `color` | Card matches specified color |
| `opponentHasTraits` | `opponent` | Opponent has traits to target |
| `deckHasCards` | `deck`, `count` | Deck has at least N cards |
| `isColorPlayable` | `gameState`, `color` | Color not restricted this age |

**Implementation Pattern:**
```javascript
const Conditions = {
  hasTraitsOfColor(gameState, { player, color, count }) {
    const matching = player.traitPile.filter(t => t.color === color);
    return matching.length >= count;
  },

  isNotDominant(gameState, { trait }) {
    return !trait.isDominant;
  }
};
```

### 4. Filters

Reusable filter definitions for narrowing targets.

```javascript
const Filters = {
  notDominant: (card) => !card.isDominant,
  colorEquals: (color) => (card) => card.color === color,
  colorNotEquals: (color) => (card) => card.color !== color,
  faceValueAtLeast: (n) => (card) => card.faceValue >= n,
  faceValueAtMost: (n) => (card) => card.faceValue <= n,
  hasAction: (card) => card.actions && card.actions.length > 0,
  notSelf: (selfId) => (player) => player.id !== selfId
};
```

---

## Pipeline Definition Format

### Step Types

```javascript
// Action step - modifies game state
{ action: 'actionName', params: { ... } }

// Collect step - gathers user input
{ collect: 'collectorName', params: { ... }, storeAs: 'variableName' }

// Condition step - validates and can abort pipeline
{ condition: 'conditionName', params: { ... }, onFail?: 'abort' | 'skip' | 'branch' }

// Branch step - conditional execution
{
  branch: 'conditionName',
  params: { ... },
  then: [ ...steps ],
  else: [ ...steps ]
}

// Loop step - repeat for each item
{
  forEach: '$collectionVariable',
  as: 'itemVariable',
  do: [ ...steps ]
}
```

### Variable References

Pipeline variables use `$` prefix:
- `$self` - The player who played the card
- `$opponents` - All other players
- `$selected` - Result from most recent collect
- `$stolenCard` - Named result from previous step
- `$target` - Selected opponent
- `$revealed` - Revealed cards collection

### Card Definition Examples

**Simple: Draw Cards (Forager)**
```javascript
{
  name: 'Forager',
  faceValue: 1,
  color: 'Green',
  pipeline: [
    { action: 'drawCards', params: { player: '$self', count: 1 } }
  ]
}
```

**Medium: Discard and Draw (Molt)**
```javascript
{
  name: 'Molt',
  faceValue: 1,
  color: 'Blue',
  pipeline: [
    {
      collect: 'selectFromHand',
      params: { player: '$self', count: 1, message: 'Select a card to discard' },
      storeAs: 'toDiscard'
    },
    { action: 'discardFromHand', params: { player: '$self', cardRefs: '$toDiscard' } },
    { action: 'drawCards', params: { player: '$self', count: 2 } }
  ]
}
```

**Complex: Clever (Multi-player reveal, steal, play)**
```javascript
{
  name: 'Clever',
  faceValue: 1,
  color: 'Purple',
  pipeline: [
    // All opponents reveal 1 card
    {
      collect: 'revealFromHand',
      params: { players: '$opponents', count: 1 },
      storeAs: 'revealed'
    },
    // Source player picks one to steal
    {
      condition: 'collectionNotEmpty',
      params: { collection: '$revealed' },
      onFail: 'abort'
    },
    {
      collect: 'selectFromRevealed',
      params: { player: '$self', cards: '$revealed', message: 'Choose a card to steal' },
      storeAs: 'chosen'
    },
    // Steal the card
    {
      action: 'stealFromHand',
      params: {
        fromPlayer: '$chosen.owner',
        toPlayer: '$self',
        cardIndex: '$chosen.index'
      },
      storeAs: 'stolenCard'
    },
    // Play it immediately
    {
      action: 'playTrait',
      params: { player: '$self', card: '$stolenCard', triggerEffects: true }
    }
  ]
}
```

**Complex: Nocturnal (Steal random, choice to keep or return)**
```javascript
{
  name: 'Nocturnal',
  faceValue: 2,
  color: 'Purple',
  pipeline: [
    {
      collect: 'selectOpponent',
      params: { player: '$self', filter: 'hasCardsInHand' },
      storeAs: 'target'
    },
    {
      action: 'stealRandomFromHand',
      params: { fromPlayer: '$target', toPlayer: '$self' },
      storeAs: 'stolenCard'
    },
    {
      collect: 'viewCards',
      params: { player: '$self', cards: ['$stolenCard'], message: 'You stole:' }
    },
    {
      collect: 'confirmAction',
      params: { player: '$self', message: 'Keep this card?' },
      storeAs: 'keepChoice'
    },
    {
      branch: '$keepChoice.confirmed',
      then: [], // Keep it (do nothing, card already in hand)
      else: [
        { action: 'giveCards', params: { from: '$self', to: '$target', cards: ['$stolenCard'] } }
      ]
    }
  ]
}
```

**With Play Conditions: Bioluminescence (Dominant)**
```javascript
{
  name: 'Bioluminescence',
  faceValue: 7,
  color: 'Green',
  isDominant: true,
  playConditions: [
    { condition: 'hasTraitsOfColor', params: { player: '$self', color: 'Green', count: 3 } }
  ],
  pipeline: [] // No action, just a high-value dominant
}
```

---

## Pipeline Executor

### Core Executor Class

```javascript
class PipelineExecutor {
  constructor(gameState) {
    this.gameState = gameState;
    this.context = {}; // Pipeline variables
  }

  async execute(pipeline, sourcePlayer, sourceCard) {
    // Initialize context
    this.context = {
      $self: sourcePlayer,
      $opponents: this.gameState.players.filter(p => p.id !== sourcePlayer.id),
      $sourceCard: sourceCard,
      $gameState: this.gameState
    };

    for (const step of pipeline) {
      const result = await this.executeStep(step);

      if (result.abort) {
        return { success: false, aborted: true, reason: result.reason };
      }

      if (result.skip) {
        continue;
      }
    }

    return { success: true };
  }

  async executeStep(step) {
    if (step.action) {
      return this.executeAction(step);
    } else if (step.collect) {
      return this.executeCollect(step);
    } else if (step.condition) {
      return this.executeCondition(step);
    } else if (step.branch) {
      return this.executeBranch(step);
    } else if (step.forEach) {
      return this.executeForEach(step);
    }

    throw new Error(`Unknown step type: ${JSON.stringify(step)}`);
  }

  async executeAction(step) {
    const params = this.resolveParams(step.params);
    const actionFn = Actions[step.action];

    if (!actionFn) {
      throw new Error(`Unknown action: ${step.action}`);
    }

    const result = actionFn(this.gameState, params);

    if (step.storeAs) {
      this.context[step.storeAs] = result;
    }

    this.gameState.broadcastState();
    return { success: true };
  }

  async executeCollect(step) {
    const params = this.resolveParams(step.params);
    const collectFn = Collectors[step.collect];

    if (!collectFn) {
      throw new Error(`Unknown collector: ${step.collect}`);
    }

    // This awaits user input
    const result = await collectFn(this.gameState, params);

    if (step.storeAs) {
      this.context['$' + step.storeAs] = result;
    }

    return { success: true };
  }

  executeCondition(step) {
    const params = this.resolveParams(step.params);
    const conditionFn = Conditions[step.condition];

    if (!conditionFn) {
      throw new Error(`Unknown condition: ${step.condition}`);
    }

    const passed = conditionFn(this.gameState, params);

    if (!passed) {
      switch (step.onFail) {
        case 'abort':
          return { abort: true, reason: `Condition failed: ${step.condition}` };
        case 'skip':
          return { skip: true };
        default:
          return { success: true }; // Continue by default
      }
    }

    return { success: true };
  }

  async executeBranch(step) {
    const params = this.resolveParams(step.params || {});
    const conditionFn = Conditions[step.branch];
    const passed = conditionFn ? conditionFn(this.gameState, params) : this.resolveValue(step.branch);

    const branchSteps = passed ? (step.then || []) : (step.else || []);

    for (const branchStep of branchSteps) {
      const result = await this.executeStep(branchStep);
      if (result.abort) return result;
    }

    return { success: true };
  }

  async executeForEach(step) {
    const collection = this.resolveValue(step.forEach);

    for (const item of collection) {
      this.context['$' + step.as] = item;

      for (const loopStep of step.do) {
        const result = await this.executeStep(loopStep);
        if (result.abort) return result;
      }
    }

    return { success: true };
  }

  resolveParams(params) {
    const resolved = {};
    for (const [key, value] of Object.entries(params)) {
      resolved[key] = this.resolveValue(value);
    }
    return resolved;
  }

  resolveValue(value) {
    if (typeof value === 'string' && value.startsWith('$')) {
      return this.getContextValue(value);
    }
    if (Array.isArray(value)) {
      return value.map(v => this.resolveValue(v));
    }
    if (typeof value === 'object' && value !== null) {
      return this.resolveParams(value);
    }
    return value;
  }

  getContextValue(path) {
    const parts = path.split('.');
    let value = this.context;

    for (const part of parts) {
      if (value === undefined) return undefined;
      value = value[part] || value[part.substring(1)]; // Handle $ prefix
    }

    return value;
  }
}
```

---

## UI Integration

### Pending Input State

The game state would have a standardized pending input structure:

```javascript
gameState.pendingInput = {
  type: 'select_from_hand' | 'select_opponent' | 'reveal_cards' | ...,
  playerId: string,           // Who needs to provide input
  params: { ... },            // Type-specific parameters
  resolve: (result) => void   // Promise resolver
};

// For multi-player inputs
gameState.pendingMultiInput = {
  type: 'reveal_cards',
  participants: {
    [playerId]: { responded: boolean, response: any }
  },
  resolve: (results) => void
};
```

### UI Handler Mapping

```javascript
const InputHandlers = {
  'select_from_hand': showSelectFromHandModal,
  'select_opponent': showSelectOpponentModal,
  'select_opponent_trait': showSelectOpponentTraitModal,
  'reveal_cards': showRevealCardModal,
  'view_cards': showViewCardsModal,
  'confirm_action': showConfirmModal,
  // ... etc
};

function handlePendingInput(input) {
  const handler = InputHandlers[input.type];
  if (handler) {
    handler(input);
  }
}
```

---

## Migration Strategy

### Phase 1: Infrastructure (Non-breaking)

1. Create `Actions`, `Collectors`, `Conditions` modules alongside existing code
2. Implement `PipelineExecutor` class
3. Add `pipeline` property support to card definitions (optional, falls back to `actions`)

### Phase 2: Parallel Support

1. Modify `CardEffects.handleAction()` to check for `pipeline` first
2. If `pipeline` exists, use `PipelineExecutor`
3. If not, fall back to existing `actions` array handling
4. Migrate simple cards first (draw, discard only)

### Phase 3: Collector Unification

1. Refactor existing pending action handlers to use unified `Collectors`
2. Ensure UI modals work with new collector format
3. Migrate medium-complexity cards

### Phase 4: Multi-Player Collectors

1. Implement multi-player collectors (reveal, simultaneous selection)
2. Migrate complex cards like Clever
3. Remove old `multiPlayerAction` custom handling

### Phase 5: Cleanup

1. Remove legacy action handlers
2. Convert all remaining cards to pipeline format
3. Remove `actions` array support (or keep as syntactic sugar)

---

## Benefits

### For Development

1. **Adding new cards is declarative**: No new handler code needed
2. **Testable primitives**: Each action/collector can be unit tested
3. **Clear separation of concerns**: Operations, UI, and flow are separate
4. **Self-documenting**: Pipeline definitions describe exactly what happens

### For Expansions

1. **New mechanics = new primitives**: Add one collector or action, use everywhere
2. **Complex combos are composable**: Chain existing primitives
3. **Consistent behavior**: All cards use same underlying operations

### For Debugging

1. **Pipeline state inspection**: Can log/inspect at each step
2. **Step-by-step replay**: Easy to reproduce issues
3. **Clear error context**: Know exactly which step failed

---

## Example Migration: Hot Temper

### Current Definition
```javascript
{
  name: 'Hot Temper',
  faceValue: 2,
  color: 'Red',
  actions: [{ name: 'discard_card_from_hand', params: { affected_players: 'self', num_cards: 2 } }]
}
```

### Pipeline Definition
```javascript
{
  name: 'Hot Temper',
  faceValue: 2,
  color: 'Red',
  pipeline: [
    {
      collect: 'selectFromHand',
      params: {
        player: '$self',
        count: 2,
        message: 'Select 2 cards to discard'
      },
      storeAs: 'toDiscard'
    },
    {
      action: 'discardFromHand',
      params: { player: '$self', cardRefs: '$toDiscard' }
    }
  ]
}
```

---

## Ages and Catastrophes

Ages and catastrophes are distinct from trait cards but share many of the same atomic operations. They fit into the pipeline model with some extensions.

### Age Card Structure

Ages have three effect categories:

| Category | When Triggered | Examples |
|----------|----------------|----------|
| `instantEffects` | Once, when age is revealed | Draw cards, modify gene pool, stabilize all |
| `turnEffects` | Apply as restrictions each turn | Color restrictions, face value limits |
| `passiveEffects` | Ongoing rules for the round | Skip stabilization, preview next age |

### Age Pipeline Definition

```javascript
{
  type: 'age',
  name: 'Tropical Lands',

  // Executed once when age is revealed
  onReveal: [
    { action: 'drawCards', params: { players: '$allPlayers', count: 1 } }
  ],

  // Applied as turn restrictions (checked before card play)
  restrictions: [
    { type: 'colorBlocked', color: 'Colorless' }
  ],

  // Passive modifiers active for the round
  modifiers: [
    { type: 'previewNextAge', value: true }
  ]
}
```

### Restriction Types

Restrictions are checked by `Conditions` before allowing card play:

| Restriction | Parameters | Description |
|-------------|------------|-------------|
| `colorBlocked` | `color` | Cannot play cards of this color |
| `colorRequired` | `color` | Must play cards of this color (if able) |
| `faceValueMax` | `value` | Cannot play cards with face value > N |
| `faceValueMin` | `value` | Cannot play cards with face value < N |
| `actionsIgnored` | - | Card actions don't trigger this round |
| `dominantsBlocked` | - | Cannot play dominant cards |

**Implementation:**
```javascript
const Restrictions = {
  colorBlocked: (card, params) => card.color !== params.color,
  faceValueMax: (card, params) => card.faceValue <= params.value,
  actionsIgnored: () => true, // Always passes, but flags action skip
};

function canPlayCard(gameState, player, card) {
  const restrictions = gameState.currentAge.restrictions || [];

  for (const restriction of restrictions) {
    const checkFn = Restrictions[restriction.type];
    if (checkFn && !checkFn(card, restriction)) {
      return { allowed: false, reason: `Blocked by ${gameState.currentAge.name}` };
    }
  }

  return { allowed: true };
}
```

### Modifier Types

Modifiers change game rules for the round:

| Modifier | Effect |
|----------|--------|
| `previewNextAge` | Current player can see next age card |
| `optionalStabilization` | Players may skip stabilization |
| `stabilizeTarget` | Override gene pool target (e.g., everyone stabilizes to 4) |
| `extraCardPerTurn` | Players may play additional cards |
| `drawAfterStabilize` | Draw N cards after stabilizing |
| `colorGrantsExtraPlay` | Playing specified color grants extra play |
| `protectTraits` | Traits cannot be stolen/discarded this round |

### Age Examples

**Simple Age: Tropical Lands**
```javascript
{
  type: 'age',
  name: 'Tropical Lands',
  restrictions: [
    { type: 'colorBlocked', color: 'Colorless' }
  ],
  onReveal: [],
  modifiers: []
}
```

**Complex Age: Age of Reason**
```javascript
{
  type: 'age',
  name: 'Age of Reason',
  onReveal: [
    // Each player must discard 1 card before their turn
    {
      action: 'setPendingDiscard',
      params: { players: '$allPlayers', count: 1 }
    }
  ],
  restrictions: [],
  modifiers: []
}
```

**Complex Age: Awakening**
```javascript
{
  type: 'age',
  name: 'Awakening',
  onReveal: [],
  restrictions: [],
  modifiers: [
    { type: 'previewNextAge', value: true }
  ]
}
```

**Complex Age: Prosperity**
```javascript
{
  type: 'age',
  name: 'Prosperity',
  onReveal: [
    { action: 'modifyGenePool', params: { players: '$allPlayers', delta: 1 } }
  ],
  restrictions: [],
  modifiers: [
    { type: 'optionalStabilization', value: true }
  ]
}
```

---

### Catastrophe Card Structure

Catastrophes have four effect categories:

| Category | When Triggered | Examples |
|----------|----------------|----------|
| `genePoolEffect` | Immediately on reveal | All gene pools -1 |
| `onReveal` | Immediately after gene pool | Discard per color, draw per trait |
| `worldEndEffect` | Only if 3rd catastrophe, at game end | Scoring modifiers |
| `duringGame` | Ongoing until game ends | Persistent rules (rare) |

### Catastrophe Pipeline Definition

```javascript
{
  type: 'catastrophe',
  name: 'Ice Age',

  // Immediate gene pool modification
  genePoolEffect: -1,

  // Executed when catastrophe is revealed
  onReveal: [
    {
      forEach: '$allPlayers',
      as: 'player',
      do: [
        {
          action: 'discardFromHandPerColor',
          params: {
            player: '$player',
            color: 'Red',
            countSource: 'traitPile'  // 1 card per Red trait
          }
        }
      ]
    }
  ],

  // Applied only if this is the 3rd catastrophe
  worldEndEffect: {
    type: 'pointsPerColor',
    params: { color: 'Red', pointsPer: -1 }
  }
}
```

### World's End Effect Types

These modify final scoring when applied:

| Effect Type | Parameters | Description |
|-------------|------------|-------------|
| `pointsPerColor` | `color`, `pointsPer` | +/- N points per trait of color |
| `pointsPerFaceValue` | `comparator`, `value`, `pointsPer` | Points per card matching condition |
| `pointsForFewestTraits` | `points` | Bonus for player(s) with fewest traits |
| `pointsForMostColor` | `color`, `points` | Bonus for most traits of color |
| `discardFromTraitPile` | `color`, `count` | Force discard traits at game end |
| `flatBonus` | `points`, `condition` | Flat points if condition met |

**Implementation:**
```javascript
const WorldEndEffects = {
  pointsPerColor(gameState, player, params) {
    const count = player.traitPile.filter(t => t.color === params.color).length;
    return count * params.pointsPer;
  },

  pointsForFewestTraits(gameState, player, params) {
    const traitCounts = gameState.players.map(p => p.traitPile.length);
    const minTraits = Math.min(...traitCounts);
    return player.traitPile.length === minTraits ? params.points : 0;
  },

  discardFromTraitPile(gameState, player, params) {
    const matching = player.traitPile.filter(t => t.color === params.color);
    const toDiscard = matching.slice(0, params.count);
    // Remove and return point adjustment (negative of discarded face values)
    // ... implementation
  }
};
```

### Catastrophe Examples

**Ice Age**
```javascript
{
  type: 'catastrophe',
  name: 'Ice Age',
  genePoolEffect: -1,
  onReveal: [
    {
      forEach: '$allPlayers',
      as: 'player',
      do: [
        {
          action: 'discardRandomFromHand',
          params: {
            player: '$player',
            count: { perTraitOfColor: 'Red' }
          }
        }
      ]
    }
  ],
  worldEndEffect: {
    type: 'pointsPerColor',
    params: { color: 'Red', pointsPer: -1 }
  }
}
```

**Meteor Strike**
```javascript
{
  type: 'catastrophe',
  name: 'Meteor Strike',
  genePoolEffect: -2,
  onReveal: [
    {
      forEach: '$allPlayers',
      as: 'player',
      do: [
        {
          action: 'discardRandomFromHand',
          params: {
            player: '$player',
            count: { perDominantTrait: true }
          }
        }
      ]
    }
  ],
  worldEndEffect: {
    type: 'pointsPerFaceValue',
    params: { comparator: 'greaterThan', value: 3, pointsPer: -1 }
  }
}
```

**Solar Flare**
```javascript
{
  type: 'catastrophe',
  name: 'Solar Flare',
  genePoolEffect: -1,
  onReveal: [
    {
      forEach: '$allPlayers',
      as: 'player',
      do: [
        {
          action: 'drawCards',
          params: {
            player: '$player',
            count: { perUniqueColor: true }
          }
        }
      ]
    }
  ],
  worldEndEffect: {
    type: 'pointsForFewestTraits',
    params: { points: 4 }
  }
}
```

---

### Age/Catastrophe Execution Flow

```
┌─────────────────────────────────────────────────────────┐
│                    NEW AGE REVEALED                      │
├─────────────────────────────────────────────────────────┤
│  1. Display age announcement UI                         │
│  2. If catastrophe: apply genePoolEffect to all         │
│  3. Execute onReveal pipeline                           │
│  4. Apply restrictions to game state                    │
│  5. Apply modifiers to game state                       │
│  6. If 3rd catastrophe: trigger game end                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    GAME END FLOW                         │
├─────────────────────────────────────────────────────────┤
│  1. Apply World's End effects from TRAITS (turn order)  │
│  2. Apply World's End effect from final CATASTROPHE     │
│  3. Calculate base scores (face values + effects)       │
│  4. Apply gene pool leader bonus (+2)                   │
│  5. Determine winner                                    │
└─────────────────────────────────────────────────────────┘
```

### Dynamic Count Parameters

Several effects need counts derived from game state:

```javascript
// Count parameter types
const CountResolvers = {
  perTraitOfColor: (player, color) => {
    return player.traitPile.filter(t => t.color === color).length;
  },

  perDominantTrait: (player) => {
    return player.traitPile.filter(t => t.isDominant).length;
  },

  perUniqueColor: (player) => {
    const colors = new Set(player.traitPile.map(t => t.color));
    return colors.size;
  },

  perTotalTraits: (player) => {
    return player.traitPile.length;
  },

  fixed: (value) => value
};

// Usage in action resolution
function resolveCount(countSpec, player, gameState) {
  if (typeof countSpec === 'number') {
    return countSpec;
  }

  if (countSpec.perTraitOfColor) {
    return CountResolvers.perTraitOfColor(player, countSpec.perTraitOfColor);
  }
  // ... etc
}
```

---

## Reaction Cards (Play Any Time)

Some cards can be played outside of a player's normal turn, as reactions to specific game events. These "interrupt" cards require a different execution model.

### Current Implementation

Cards have a `playWhen` property indicating their trigger:

```javascript
{
  name: 'Automimicry (-1)',
  faceValue: -1,
  color: 'Blue',
  playWhen: 'targeted',
  playWhenDescription: 'Play when you are targeted by a trait effect'
}
```

### Trigger Types

| Trigger | When Activates | Examples |
|---------|----------------|----------|
| `targeted` | Player is targeted by an opponent's effect | Automimicry, Self-Awareness |
| `catastrophe` | A catastrophe is revealed | Heroic cards |
| `opponent_plays` | Any opponent plays a trait | Parasitic |
| `restriction` | Age restricts a color you have | Chromatophores |
| `before_stabilize` | Before stabilization phase | (potential expansion) |
| `on_steal` | When one of your traits would be stolen | (potential expansion) |
| `on_discard` | When you must discard | (potential expansion) |

### Pipeline Integration: Event System

Reaction cards require an **event system** layered on top of the pipeline:

```
┌─────────────────────────────────────────────────────────┐
│                    Event Bus                             │
│  (Broadcasts game events to all listeners)              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   Event: "player_targeted"                              │
│   ├─ Check each player's hand for playWhen: 'targeted' │
│   ├─ If found, prompt: "Play Automimicry?"              │
│   ├─ If yes, interrupt current pipeline                 │
│   ├─ Execute reaction card's pipeline                   │
│   └─ Resume original pipeline (possibly modified)       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Event Definitions

```javascript
const GameEvents = {
  PLAYER_TARGETED: 'player_targeted',
  CATASTROPHE_REVEALED: 'catastrophe_revealed',
  OPPONENT_PLAYED_TRAIT: 'opponent_played_trait',
  AGE_RESTRICTS_COLOR: 'age_restricts_color',
  TRAIT_WOULD_BE_STOLEN: 'trait_would_be_stolen',
  TRAIT_WOULD_BE_DISCARDED: 'trait_would_be_discarded',
  BEFORE_STABILIZE: 'before_stabilize',
  GAME_ENDING: 'game_ending'
};
```

### Reaction Card Definition

```javascript
{
  name: 'Automimicry (-1)',
  faceValue: -1,
  color: 'Blue',

  // Reaction trigger
  reaction: {
    trigger: 'PLAYER_TARGETED',
    condition: { target: '$self' },  // Only when I'm the target
    prompt: 'Play Automimicry to negate this effect?',
    interruptBehavior: 'cancel'  // 'cancel', 'redirect', 'modify'
  },

  // What happens when played as reaction
  pipeline: [
    { action: 'cancelPendingEffect', params: {} },
    { action: 'addToTraitPile', params: { player: '$self', card: '$thisCard' } }
  ]
}
```

### Interrupt Behaviors

| Behavior | Effect on Original Action |
|----------|---------------------------|
| `cancel` | Original effect is completely negated |
| `redirect` | Effect targets different player/trait |
| `modify` | Effect parameters are changed |
| `respond` | Reaction happens, but original continues |

### Reaction Resolution Flow

```
┌─────────────────────────────────────────────────────────┐
│              REACTION RESOLUTION FLOW                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Action triggers event (e.g., "steal trait")         │
│  2. Event bus broadcasts to all players                 │
│  3. Check each player's hand for matching reactions     │
│  4. If reactions exist:                                 │
│     a. Pause original pipeline                          │
│     b. Prompt player(s) with reaction option            │
│     c. Set timeout for response (prevent stalling)      │
│     d. If played: execute reaction pipeline             │
│     e. Apply interrupt behavior to original             │
│  5. Resume original pipeline (if not cancelled)         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Multi-Player Reaction Priority

When multiple players could react:

```javascript
const ReactionPriority = {
  // Order of resolution
  order: 'target_first',  // or 'turn_order', 'simultaneous'

  // Stacking rules
  stacking: 'last_wins',  // or 'all_apply', 'first_wins'

  // Timeout handling
  timeout: 15000,  // 15 seconds to decide
  defaultOnTimeout: 'decline'  // or 'auto_play'
};
```

### Example: Parasitic

```javascript
{
  name: 'Parasitic',
  faceValue: -2,
  color: 'Purple',

  reaction: {
    trigger: 'OPPONENT_PLAYED_TRAIT',
    condition: { triggerPlayer: { not: '$self' } },
    prompt: 'Play Parasitic to copy this trait?',
    interruptBehavior: 'respond'  // Original still happens
  },

  pipeline: [
    // Copy the just-played trait's effects
    {
      action: 'copyTraitEffects',
      params: { source: '$triggerCard', target: '$thisCard' }
    },
    { action: 'addToTraitPile', params: { player: '$self', card: '$thisCard' } }
  ]
}
```

### Example: Heroic (Catastrophe Reaction)

```javascript
{
  name: 'Heroic',
  faceValue: 3,
  color: 'Red',

  reaction: {
    trigger: 'CATASTROPHE_REVEALED',
    condition: null,  // Always can play
    prompt: 'Play Heroic in response to the catastrophe?',
    interruptBehavior: 'respond',
    autoPrompt: true  // Always ask, don't require manual trigger
  },

  pipeline: [
    { action: 'addToTraitPile', params: { player: '$self', card: '$thisCard' } }
    // No special effect, just allows playing during catastrophe
  ]
}
```

### UI Considerations

1. **Reaction Window**: Brief pause after triggering events to allow reactions
2. **Visual Indicator**: Highlight cards in hand that can react
3. **Quick Actions**: Swipe or tap-hold to play reaction instantly
4. **Decline Option**: Easy way to pass on reaction opportunity
5. **Timeout Bar**: Visual countdown when reaction window is open

---

## World's End Trait Effects

Some traits have effects that trigger at the end of the game, during the World's End resolution phase. These require special handling separate from regular scoring effects.

### Current Implementation

Traits with World's End effects have:

```javascript
{
  name: 'Hyper-Intelligence',
  faceValue: 4,
  color: 'Red',
  isDominant: true,
  worldsEnd: true,
  worldsEndEffect: { name: 'play_from_hand', params: {} },
  worldsEndDescription: "World's End: Play all remaining traits from hand"
}
```

### World's End Effect Types

| Effect | Parameters | Description |
|--------|------------|-------------|
| `worlds_end_draw` | `value` | Draw N cards (adds to hand, then scoring) |
| `play_from_hand` | - | Play all remaining hand cards to trait pile |
| `play_from_hand_at_end` | `card_name` | Play specific card from hand if held |
| `may_change_color` | - | Choose this trait's color for scoring |
| `choose_color` | - | Declare this trait as any color |
| `choose_catastrophe_world_end` | - | Pick World's End effect from any catastrophe |
| `copy_opponent_trait` | - | Copy another player's trait for scoring |
| `double_if_condition` | `condition` | Double this trait's value if condition met |
| `bonus_per_condition` | `condition`, `value` | +N per matching item |

### Pipeline Definition for World's End

```javascript
{
  name: 'Hyper-Intelligence',
  faceValue: 4,
  color: 'Red',
  isDominant: true,

  worldsEnd: {
    // Order matters for effects that modify the game state
    priority: 'early',  // 'early', 'normal', 'late', 'scoring'

    // Pipeline executed during World's End
    pipeline: [
      {
        forEach: '$self.hand',
        as: 'card',
        do: [
          {
            action: 'addToTraitPile',
            params: { player: '$self', card: '$card' }
          }
        ]
      }
    ],

    description: "Play all remaining traits from hand"
  }
}
```

### World's End Resolution Order

The order of World's End resolution is critical:

```
┌─────────────────────────────────────────────────────────┐
│              WORLD'S END RESOLUTION ORDER                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  PHASE 1: State-Modifying Effects (turn order)          │
│  ├─ Hyper-Intelligence: Play all cards from hand        │
│  ├─ Sneaky: Play Sneaky from hand                       │
│  └─ (effects that add/remove traits)                    │
│                                                          │
│  PHASE 2: Color-Choosing Effects (turn order)           │
│  ├─ Faith: Choose this trait's color                    │
│  ├─ Sentience: Choose this trait's color                │
│  └─ (effects that change trait properties)              │
│                                                          │
│  PHASE 3: Information-Gathering Effects                 │
│  ├─ Adaptable: Draw 2 cards (for hand bonus scoring)    │
│  └─ (effects that matter for final scoring)             │
│                                                          │
│  PHASE 4: Catastrophe World's End Effect                │
│  └─ Apply 3rd catastrophe's worldEndEffect              │
│                                                          │
│  PHASE 5: Final Scoring                                 │
│  ├─ Calculate face values                               │
│  ├─ Apply trait scoring effects                         │
│  ├─ Apply World's End bonuses/penalties                 │
│  └─ Gene pool leader bonus (+2)                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Priority Levels

```javascript
const WorldsEndPriority = {
  EARLY: 1,      // State changes (play cards, add traits)
  NORMAL: 2,    // Standard effects
  LATE: 3,       // Effects that depend on other World's End effects
  SCORING: 4    // Pure scoring modifications
};
```

### World's End Effect Examples

**Adaptable (Draw at End)**
```javascript
{
  name: 'Adaptable',
  faceValue: 1,
  color: 'Colorless',

  worldsEnd: {
    priority: 'early',
    pipeline: [
      { action: 'drawCards', params: { player: '$self', count: 2 } }
    ],
    description: "Draw 2 cards"
  }
}
```

**Faith (Choose Color)**
```javascript
{
  name: 'Faith',
  faceValue: 4,
  color: 'Colorless',
  isDominant: true,

  worldsEnd: {
    priority: 'normal',
    pipeline: [
      {
        collect: 'selectColor',
        params: {
          player: '$self',
          options: ['Red', 'Blue', 'Green', 'Purple', 'Colorless'],
          message: 'Choose a color for Faith'
        },
        storeAs: 'chosenColor'
      },
      {
        action: 'setTraitColor',
        params: { trait: '$thisCard', color: '$chosenColor' }
      }
    ],
    description: "This trait may become any color"
  }
}
```

**Time Travel (Choose Catastrophe Effect)**
```javascript
{
  name: 'Time Travel',
  faceValue: 2,
  color: 'Colorless',

  worldsEnd: {
    priority: 'late',  // After other effects, before scoring
    pipeline: [
      {
        collect: 'selectFromOptions',
        params: {
          player: '$self',
          options: '$allCatastrophes.worldEndEffects',
          message: "Choose a World's End effect to apply"
        },
        storeAs: 'chosenEffect'
      },
      {
        action: 'applyWorldEndEffect',
        params: { effect: '$chosenEffect', player: '$self' }
      }
    ],
    description: "Choose a World's End effect from the 3 catastrophes"
  }
}
```

### Async Collection During World's End

World's End effects may require user input (choosing colors, selecting effects). The pipeline executor must:

1. Process effects in turn order within each priority level
2. Await user input for collection steps
3. Apply timeout with default selection
4. Broadcast state after each player's effects resolve

```javascript
async function resolveWorldsEnd(gameState) {
  const priorities = ['early', 'normal', 'late', 'scoring'];

  for (const priority of priorities) {
    // Get all traits with this priority level
    const traitsAtPriority = getAllWorldsEndTraits(gameState, priority);

    // Process in turn order (starting from first player)
    for (let i = 0; i < gameState.players.length; i++) {
      const playerIdx = (gameState.firstPlayerIndex + i) % gameState.players.length;
      const player = gameState.players[playerIdx];

      const playerTraits = traitsAtPriority.filter(t => t.owner === player.id);

      for (const trait of playerTraits) {
        await executePipeline(trait.worldsEnd.pipeline, player, trait);
        gameState.broadcastState();
      }
    }
  }

  // Apply catastrophe World's End
  await applyCatastropheWorldEnd(gameState);

  // Final scoring
  calculateFinalScores(gameState);
}
```

### World's End vs Scoring Effects

Important distinction:

| Type | When Evaluated | Can Modify State | Examples |
|------|----------------|------------------|----------|
| **World's End** | Once, at game end | Yes | Play cards, choose colors |
| **Scoring Effects** | During score calc | No (read-only) | +1 per blue trait |

Scoring effects (`effects` array) are evaluated during `calculateScore()` and should not modify game state. World's End effects (`worldsEnd.pipeline`) execute before scoring and CAN modify state.

### UI Considerations for World's End

1. **Resolution Log**: Show each World's End effect as it resolves
2. **Player Prompts**: Clear indication when player input is needed
3. **Effect Preview**: Show what the effect will do before confirming
4. **Turn Order Indicator**: Show which player is resolving effects
5. **Skip Option**: Allow declining optional World's End effects

---

## Open Questions

1. **Undo support?** Pipeline steps could be logged for potential undo
2. **Animation hooks?** Add `onComplete` callbacks for visual effects
3. **Conditional actions in arrays?** Some cards have "do X OR Y" - need clean syntax
4. **Nested card triggers?** When stolen card triggers its own pipeline
5. **Reaction timing conflicts?** Multiple players react simultaneously - who resolves first?
6. **World's End order disputes?** Two traits at same priority - does player choose order?

---

## Conclusion

The pipeline model transforms card implementation from imperative handler code to declarative specifications. While the initial investment is significant, it pays dividends as the card pool grows, especially with expansions introducing new mechanics.

The key insight is that Doomlings (and most card games) have a finite set of atomic operations. Once those are solid, any card is just a recipe combining them.
