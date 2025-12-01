# Pipeline Architecture Implementation Plan

## Document Purpose

This document serves as the PRD/TRD for implementing the pipeline-based card effect system described in `PIPELINE_ARCHITECTURE.md`. It provides a phased approach with clear milestones, technical tasks, and success criteria.

---

## Executive Summary

### Goal
Transform the card effect system from imperative action handlers to a declarative pipeline model, enabling:
- Purely declarative card definitions
- Reusable atomic operations
- Simplified expansion card development
- Consistent behavior across all card types

### Scope
- Trait cards (actions and effects)
- Age cards (restrictions and modifiers)
- Catastrophe cards (immediate and World's End effects)
- Reaction cards (play any time)
- World's End trait effects

### Estimated Effort
- **Phase 1-2**: Foundation (can be done incrementally)
- **Phase 3-4**: Core migration (bulk of work)
- **Phase 5-6**: Advanced features
- **Phase 7**: Polish and optimization

---

## Current State Analysis

### Existing Architecture

```
cards-data.js          → Card definitions with actions[] array
game-engine.js         → CardEffects.executeAction() switch statement
                       → ~50 action type handlers
                       → Custom state machines (multiPlayerAction, pendingAction)
peer-manager.js        → Network sync, message routing
game.html              → UI modals, input handling
```

### Pain Points to Address
1. New complex cards require new handler code
2. Multi-player actions need custom state machines
3. Reaction cards not fully implemented
4. World's End effects handled inconsistently
5. Age/catastrophe effects use different patterns than traits

---

## Phase 1: Core Infrastructure

### Objective
Create the foundational modules without breaking existing functionality.

### Deliverables
- [ ] `js/pipeline/actions.js` - Atomic action functions
- [ ] `js/pipeline/collectors.js` - User input collection functions
- [ ] `js/pipeline/conditions.js` - Predicate functions
- [ ] `js/pipeline/filters.js` - Target filtering functions
- [ ] `js/pipeline/executor.js` - Pipeline execution engine
- [ ] `js/pipeline/index.js` - Module exports

### Technical Tasks

#### 1.1 Create Actions Module
```javascript
// js/pipeline/actions.js

export const Actions = {
  /**
   * Draw cards from trait deck
   * @param {GameState} gameState
   * @param {Object} params - { player, count, source? }
   * @returns {Object} - { drawn: Card[] }
   */
  drawCards(gameState, { player, count, source = 'traitDeck' }) {
    // Implementation
  },

  /**
   * Discard cards from hand
   * @param {GameState} gameState
   * @param {Object} params - { player, cardIndices }
   * @returns {Object} - { discarded: Card[] }
   */
  discardFromHand(gameState, { player, cardIndices }) {
    // Implementation
  },

  // ... implement all actions from PIPELINE_ARCHITECTURE.md
};
```

**Actions to implement (Priority Order):**

| Priority | Action | Description |
|----------|--------|-------------|
| P0 | `drawCards` | Draw from deck |
| P0 | `discardFromHand` | Discard from hand |
| P0 | `addToTraitPile` | Play trait |
| P0 | `modifyGenePool` | Change gene pool |
| P1 | `stealTrait` | Take opponent's trait |
| P1 | `stealFromHand` | Take from opponent's hand |
| P1 | `giveCards` | Transfer cards |
| P1 | `discardFromTraitPile` | Remove traits |
| P2 | `swapTraits` | Exchange traits |
| P2 | `returnToHand` | Trait back to hand |
| P2 | `shuffleIntoDeck` | Return cards to deck |
| P2 | `setExtraPlays` | Grant extra plays |
| P3 | `revealCards` | Make cards visible |
| P3 | `copyTraitEffects` | Clone trait |
| P3 | `setTraitColor` | Change trait color |

#### 1.2 Create Conditions Module
```javascript
// js/pipeline/conditions.js

export const Conditions = {
  hasCardsInHand(gameState, { player, count }) {
    return player.hand.length >= count;
  },

  hasTraitsOfColor(gameState, { player, color, count }) {
    const matching = player.traitPile.filter(t => t.color === color);
    return matching.length >= count;
  },

  // ... implement all conditions
};
```

**Conditions to implement:**

| Condition | Parameters | Used By |
|-----------|------------|---------|
| `hasCardsInHand` | player, count | Discard effects |
| `hasTraitsOfColor` | player, color, count | Play requirements |
| `hasTraitCount` | player, count | Dominant requirements |
| `hasDominantTrait` | player | Various checks |
| `isNotDominant` | trait | Target filtering |
| `opponentHasTraits` | opponent | Steal targeting |
| `collectionNotEmpty` | collection | Pipeline flow |
| `isColorPlayable` | color | Age restrictions |

#### 1.3 Create Filters Module
```javascript
// js/pipeline/filters.js

export const Filters = {
  notDominant: (card) => !card.isDominant,
  colorEquals: (color) => (card) => card.color === color,
  colorNotEquals: (color) => (card) => card.color !== color,
  faceValueAtLeast: (n) => (card) => card.faceValue >= n,
  faceValueAtMost: (n) => (card) => card.faceValue <= n,
  hasAction: (card) => card.actions && card.actions.length > 0,
  notSelf: (selfId) => (player) => player.id !== selfId,
  hasCardsInHand: (player) => player.hand.length > 0
};
```

#### 1.4 Create Collectors Module (Stub)
```javascript
// js/pipeline/collectors.js

export const Collectors = {
  /**
   * Request card selection from player's hand
   * Returns promise that resolves when UI submits selection
   */
  async selectFromHand(gameState, { player, count, filters, message }) {
    // Will be implemented in Phase 2
    throw new Error('Collectors not yet implemented');
  },

  // Stub all collectors for later implementation
};
```

#### 1.5 Create Pipeline Executor
```javascript
// js/pipeline/executor.js

export class PipelineExecutor {
  constructor(gameState) {
    this.gameState = gameState;
    this.context = {};
  }

  async execute(pipeline, sourcePlayer, sourceCard) {
    // Initialize context with $ variables
    // Execute each step in sequence
    // Handle async collection steps
    // Return result
  }

  resolveValue(value) {
    // Handle $variable resolution
  }

  // ... implement as specified in PIPELINE_ARCHITECTURE.md
}
```

### Testing Requirements
- [ ] Unit tests for each Action function
- [ ] Unit tests for each Condition function
- [ ] Unit tests for Filter combinations
- [ ] Integration test: PipelineExecutor with simple pipeline

### Success Criteria
- All P0 and P1 actions implemented and tested
- All conditions implemented and tested
- PipelineExecutor can run simple action-only pipelines
- No changes to existing game functionality

---

## Phase 2: Collector Integration

### Objective
Implement the async collection system that bridges pipelines with UI input.

### Deliverables
- [ ] Complete `js/pipeline/collectors.js`
- [ ] `js/pipeline/pending-input.js` - Pending input state management
- [ ] Updated `game.html` - Unified input handlers
- [ ] Updated `peer-manager.js` - Collection message routing

### Technical Tasks

#### 2.1 Pending Input State Structure
```javascript
// Add to GameState
this.pendingPipelineInput = null;

// Structure when awaiting input:
pendingPipelineInput = {
  type: 'select_from_hand',
  playerId: 'player-123',
  params: {
    count: 2,
    filters: ['notDominant'],
    message: 'Select 2 cards to discard'
  },
  resolve: (result) => void,  // Promise resolver
  reject: (error) => void,
  timeout: 30000,
  timeoutId: null
};
```

#### 2.2 Implement Collectors

| Collector | Input Type | UI Modal |
|-----------|------------|----------|
| `selectFromHand` | `select_own_cards` | Existing modal |
| `selectFromTraitPile` | `select_own_trait` | Existing modal |
| `selectOpponent` | `select_opponent` | Existing modal |
| `selectOpponentTrait` | `select_opponent_trait` | Existing modal |
| `selectFromDiscard` | `select_from_discard` | Existing modal |
| `selectColor` | `select_color` | Existing modal |
| `viewCards` | `view_cards` | Existing modal |
| `confirmAction` | `confirm_action` | New simple modal |

#### 2.3 Multi-Player Collectors
```javascript
// js/pipeline/collectors.js

async revealFromHand(gameState, { players, count }) {
  const participantIds = players.map(p => p.id);

  gameState.pendingMultiInput = {
    type: 'reveal_cards',
    participants: Object.fromEntries(
      participantIds.map(id => [id, { responded: false, response: null }])
    ),
    count,
    resolve: null
  };

  return new Promise((resolve) => {
    gameState.pendingMultiInput.resolve = resolve;
  });
}
```

#### 2.4 Update game.html Input Handler
```javascript
// Unified handler for pipeline inputs
function handlePipelineInput(input) {
  const handlers = {
    'select_from_hand': showSelectOwnCardsModal,
    'select_opponent': showSelectOpponentModal,
    'select_opponent_trait': showSelectOpponentTraitModal,
    'reveal_cards': showRevealCardModal,
    // ... map all input types
  };

  const handler = handlers[input.type];
  if (handler) {
    handler({
      ...input.params,
      onComplete: (result) => {
        peerManager.submitPipelineInput(result);
      }
    });
  }
}
```

#### 2.5 Update peer-manager.js
```javascript
// Add message types
case 'submitPipelineInput':
  this.gameState.resolvePipelineInput(data.playerId, data.result);
  this.broadcastState();
  break;

// Client method
submitPipelineInput(result) {
  if (this.isHost) {
    this.gameState.resolvePipelineInput(this.myPlayerId, result);
    this.broadcastState();
  } else {
    this.hostConnection.send({
      type: 'submitPipelineInput',
      playerId: this.myPlayerId,
      result
    });
  }
}
```

### Testing Requirements
- [ ] Test each collector triggers correct UI modal
- [ ] Test input submission resolves collector promise
- [ ] Test timeout handling
- [ ] Test multi-player collection (revealFromHand)
- [ ] Network sync test: host and client collection

### Success Criteria
- All collectors implemented and working
- Existing modals work with new collector system
- Multi-player collection (Clever card flow) works via pipeline
- Timeout prevents indefinite waiting

---

## Phase 3: Simple Card Migration

### Objective
Migrate simple trait cards to pipeline format while maintaining backward compatibility.

### Deliverables
- [ ] Pipeline support in `CardEffects.handleAction()`
- [ ] 20+ simple cards migrated to pipeline format
- [ ] Migration utility script
- [ ] Validation tests

### Technical Tasks

#### 3.1 Add Pipeline Support to CardEffects
```javascript
// In game-engine.js CardEffects class

static async handleAction(gameState, player, card) {
  // Check for new pipeline format first
  if (card.pipeline) {
    const executor = new PipelineExecutor(gameState);
    return await executor.execute(card.pipeline, player, card);
  }

  // Fall back to legacy actions array
  if (card.actions) {
    for (const action of card.actions) {
      const result = this.executeAction(gameState, player, action, card);
      if (result.needsInput) {
        return result;
      }
    }
  }

  return { needsInput: false };
}
```

#### 3.2 Migration Priority

**Batch 1: Draw-only cards**
```javascript
// Before
{ name: 'Forager', actions: [{ name: 'draw_cards', params: { value: 1 } }] }

// After
{
  name: 'Forager',
  pipeline: [
    { action: 'drawCards', params: { player: '$self', count: 1 } }
  ]
}
```

Cards: Forager, Swarming, Regeneration, etc.

**Batch 2: Gene pool modifiers**
```javascript
{
  name: 'Big Brain',
  pipeline: [
    { action: 'modifyGenePool', params: { player: '$self', delta: 1 } }
  ]
}
```

Cards: Big Brain, Tiny, Tall, etc.

**Batch 3: Simple discard**
```javascript
{
  name: 'Hot Temper',
  pipeline: [
    {
      collect: 'selectFromHand',
      params: { player: '$self', count: 2, message: 'Select 2 cards to discard' },
      storeAs: 'toDiscard'
    },
    { action: 'discardFromHand', params: { player: '$self', cardIndices: '$toDiscard.indices' } }
  ]
}
```

**Batch 4: Draw + discard combos**

Cards: Molt, etc.

#### 3.3 Create Migration Utility
```javascript
// scripts/migrate-card.js

function migrateLegacyCard(card) {
  if (card.pipeline) return card; // Already migrated

  const pipeline = [];

  for (const action of card.actions || []) {
    const migrated = migrateAction(action);
    pipeline.push(...migrated);
  }

  return { ...card, pipeline };
}

function migrateAction(action) {
  const migrations = {
    'draw_cards': (params) => [{
      action: 'drawCards',
      params: { player: '$self', count: params.value || params.num_cards || 1 }
    }],
    'modify_gene_pool': (params) => [{
      action: 'modifyGenePool',
      params: { player: '$self', delta: params.value }
    }],
    // ... map all action types
  };

  const migrator = migrations[action.name];
  if (migrator) {
    return migrator(action.params);
  }

  console.warn(`No migration for action: ${action.name}`);
  return [];
}
```

### Testing Requirements
- [ ] Each migrated card works identically to before
- [ ] Regression test suite for all migrated cards
- [ ] Mixed mode: some cards pipeline, some legacy
- [ ] Performance test: pipeline vs legacy execution time

### Success Criteria
- 20+ simple cards migrated
- All migrated cards pass regression tests
- No gameplay differences detected
- Legacy cards continue to work

---

## Phase 4: Complex Card Migration

### Objective
Migrate complex multi-step cards including opponent targeting, stealing, and multi-player actions.

### Deliverables
- [ ] Complex targeting cards migrated
- [ ] Steal/give cards migrated
- [ ] Multi-player action cards migrated (Clever, etc.)
- [ ] Remove legacy `multiPlayerAction` system

### Technical Tasks

#### 4.1 Opponent Targeting Cards
```javascript
{
  name: 'Spiny',
  pipeline: [
    {
      collect: 'selectOpponent',
      params: { player: '$self', filter: 'hasCardsInHand' },
      storeAs: 'target'
    },
    {
      action: 'forceDiscard',
      params: { player: '$target', count: 1, random: true }
    }
  ]
}
```

#### 4.2 Steal Cards
```javascript
{
  name: 'Thieving',
  pipeline: [
    {
      collect: 'selectOpponentTrait',
      params: {
        player: '$self',
        filter: 'notDominant',
        message: 'Select a trait to steal'
      },
      storeAs: 'stolen'
    },
    {
      action: 'stealTrait',
      params: {
        fromPlayer: '$stolen.owner',
        toPlayer: '$self',
        traitIndex: '$stolen.index'
      }
    }
  ]
}
```

#### 4.3 Multi-Player Actions (Clever)
```javascript
{
  name: 'Clever',
  pipeline: [
    {
      collect: 'revealFromHand',
      params: { players: '$opponents', count: 1 },
      storeAs: 'revealed'
    },
    {
      condition: 'collectionNotEmpty',
      params: { collection: '$revealed' },
      onFail: 'abort'
    },
    {
      collect: 'selectFromRevealed',
      params: { player: '$self', cards: '$revealed' },
      storeAs: 'chosen'
    },
    {
      action: 'stealFromHand',
      params: {
        fromPlayer: '$chosen.owner',
        toPlayer: '$self',
        cardIndex: '$chosen.index'
      },
      storeAs: 'stolenCard'
    },
    {
      action: 'playTrait',
      params: { player: '$self', card: '$stolenCard', triggerEffects: true }
    }
  ]
}
```

#### 4.4 Remove Legacy multiPlayerAction
Once all multi-player cards are migrated:
1. Remove `multiPlayerAction` from GameState
2. Remove `submitMultiPlayerResponse()` method
3. Remove `resolveMultiPlayerAction()` method
4. Remove related peer-manager handlers
5. Update serialization

### Testing Requirements
- [ ] Each complex card works correctly
- [ ] Multi-player flow tested with 2+ players
- [ ] Network latency simulation tests
- [ ] Edge cases: target has no valid options

### Success Criteria
- All targeting cards migrated
- All steal/give cards migrated
- Clever and similar cards work via pipeline
- Legacy multiPlayerAction code removed

---

## Phase 5: Ages and Catastrophes

### Objective
Migrate age and catastrophe effects to pipeline format.

### Deliverables
- [ ] Age cards using pipeline for `onReveal`
- [ ] Catastrophe cards using pipeline for `onReveal`
- [ ] Restriction system implemented
- [ ] Modifier system implemented
- [ ] World's End catastrophe effects

### Technical Tasks

#### 5.1 Age Card Migration
```javascript
{
  type: 'age',
  name: 'Age of Reason',

  onReveal: [
    {
      action: 'setPendingDiscard',
      params: { players: '$allPlayers', count: 1 }
    }
  ],

  restrictions: [
    // None for this age
  ],

  modifiers: [
    // None for this age
  ]
}
```

#### 5.2 Implement Restriction Checker
```javascript
// In game-engine.js

function canPlayCard(player, card) {
  const restrictions = this.currentAge?.restrictions || [];

  for (const restriction of restrictions) {
    switch (restriction.type) {
      case 'colorBlocked':
        if (card.color === restriction.color) {
          return { allowed: false, reason: `Cannot play ${restriction.color} this age` };
        }
        break;
      case 'faceValueMax':
        if (card.faceValue > restriction.value) {
          return { allowed: false, reason: `Cannot play cards with face value > ${restriction.value}` };
        }
        break;
      // ... other restrictions
    }
  }

  return { allowed: true };
}
```

#### 5.3 Implement Modifier System
```javascript
// Modifiers applied to game state when age starts

function applyAgeModifiers(age) {
  for (const modifier of age.modifiers || []) {
    switch (modifier.type) {
      case 'previewNextAge':
        this.previewNextAge = modifier.value;
        break;
      case 'optionalStabilization':
        this.optionalStabilization = modifier.value;
        break;
      // ... other modifiers
    }
  }
}
```

#### 5.4 Catastrophe Pipeline
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

#### 5.5 Dynamic Count Resolution
```javascript
// In pipeline executor

resolveCount(countSpec, player) {
  if (typeof countSpec === 'number') {
    return countSpec;
  }

  if (countSpec.perTraitOfColor) {
    return player.traitPile.filter(t => t.color === countSpec.perTraitOfColor).length;
  }

  if (countSpec.perDominantTrait) {
    return player.traitPile.filter(t => t.isDominant).length;
  }

  if (countSpec.perUniqueColor) {
    return new Set(player.traitPile.map(t => t.color)).size;
  }

  return 1;
}
```

### Testing Requirements
- [ ] Each age works correctly with restrictions
- [ ] Each age works correctly with modifiers
- [ ] Each catastrophe onReveal works
- [ ] Dynamic counts resolve correctly
- [ ] Gene pool effects apply correctly

### Success Criteria
- All ages migrated to new format
- All catastrophes migrated to new format
- Restriction system working
- Modifier system working

---

## Phase 6: Reaction Cards and World's End Traits

### Objective
Implement the event system for reaction cards and the World's End resolution system.

### Deliverables
- [ ] `js/pipeline/events.js` - Event bus system
- [ ] Reaction card support
- [ ] World's End trait effect resolution
- [ ] UI for reaction prompts
- [ ] UI for World's End choices

### Technical Tasks

#### 6.1 Create Event Bus
```javascript
// js/pipeline/events.js

export const GameEvents = {
  PLAYER_TARGETED: 'player_targeted',
  CATASTROPHE_REVEALED: 'catastrophe_revealed',
  OPPONENT_PLAYED_TRAIT: 'opponent_played_trait',
  AGE_RESTRICTS_COLOR: 'age_restricts_color',
  BEFORE_STABILIZE: 'before_stabilize',
  GAME_ENDING: 'game_ending'
};

export class EventBus {
  constructor(gameState) {
    this.gameState = gameState;
  }

  async emit(event, data) {
    // Check all players' hands for reaction cards
    const reactions = this.findReactions(event, data);

    if (reactions.length === 0) {
      return { interrupted: false };
    }

    // Prompt players with reactions
    for (const reaction of reactions) {
      const played = await this.promptReaction(reaction);
      if (played && reaction.card.reaction.interruptBehavior === 'cancel') {
        return { interrupted: true, cancelledBy: reaction };
      }
    }

    return { interrupted: false };
  }

  findReactions(event, data) {
    // Find cards in hands that react to this event
  }

  async promptReaction(reaction) {
    // Show UI prompt, await response
  }
}
```

#### 6.2 Integrate Events into Pipeline
```javascript
// Before executing steal action
const eventResult = await this.eventBus.emit(GameEvents.PLAYER_TARGETED, {
  targetPlayer: targetPlayer,
  sourcePlayer: sourcePlayer,
  action: 'steal_trait'
});

if (eventResult.interrupted) {
  return { cancelled: true, reason: 'Blocked by reaction' };
}

// Proceed with steal
```

#### 6.3 Reaction Card Definition
```javascript
{
  name: 'Automimicry (-1)',
  faceValue: -1,
  color: 'Blue',

  reaction: {
    trigger: 'PLAYER_TARGETED',
    condition: { target: '$self' },
    prompt: 'Play Automimicry to negate this effect?',
    interruptBehavior: 'cancel'
  },

  pipeline: [
    { action: 'cancelPendingEffect', params: {} },
    { action: 'addToTraitPile', params: { player: '$self', card: '$thisCard' } }
  ]
}
```

#### 6.4 World's End Resolution System
```javascript
// In game-engine.js

async resolveWorldsEnd() {
  const priorities = ['early', 'normal', 'late', 'scoring'];

  for (const priority of priorities) {
    // Process in turn order
    for (let i = 0; i < this.players.length; i++) {
      const playerIdx = (this.firstPlayerIndex + i) % this.players.length;
      const player = this.players[playerIdx];

      const traits = player.traitPile.filter(t =>
        t.worldsEnd?.priority === priority
      );

      for (const trait of traits) {
        const executor = new PipelineExecutor(this);
        await executor.execute(trait.worldsEnd.pipeline, player, trait);
        this.broadcastState();
      }
    }
  }

  // Apply catastrophe World's End
  await this.applyCatastropheWorldEnd();

  // Final scoring
  this.calculateFinalScores();
}
```

#### 6.5 World's End Trait Migration
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

#### 6.6 Reaction UI
```javascript
// In game.html

function showReactionPrompt(reaction) {
  const modal = document.createElement('div');
  modal.className = 'reaction-prompt-overlay';
  modal.innerHTML = `
    <div class="reaction-prompt">
      <div class="reaction-card">
        <!-- Show the reaction card -->
      </div>
      <p>${reaction.card.reaction.prompt}</p>
      <div class="reaction-timer"></div>
      <div class="reaction-buttons">
        <button onclick="playReaction(true)">Play</button>
        <button onclick="playReaction(false)">Decline</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Start countdown timer
  startReactionTimer(reaction.timeout);
}
```

### Testing Requirements
- [ ] Event emission triggers reaction checks
- [ ] Reaction prompts appear correctly
- [ ] Cancel reactions prevent original action
- [ ] Respond reactions don't prevent original
- [ ] World's End effects resolve in correct order
- [ ] Async World's End choices work
- [ ] Timeout handling for reactions and World's End

### Success Criteria
- All reaction cards working
- Event system properly integrated
- World's End resolution working
- All World's End traits migrated
- UI smooth and responsive

---

## Phase 7: Cleanup and Optimization

### Objective
Remove legacy code, optimize performance, and polish the system.

### Deliverables
- [ ] Legacy action handlers removed
- [ ] Legacy state properties removed
- [ ] Performance optimizations
- [ ] Comprehensive documentation
- [ ] Full test coverage

### Technical Tasks

#### 7.1 Remove Legacy Code
- Remove `CardEffects.executeAction()` switch statement
- Remove individual action handlers
- Remove `pendingAction` in favor of `pendingPipelineInput`
- Remove `multiPlayerAction` completely
- Remove legacy age/catastrophe effect handlers

#### 7.2 Migrate Remaining Cards
- Audit all cards in `cards-data.js`
- Ensure every card has `pipeline` (traits) or equivalent
- Remove `actions` array from all cards

#### 7.3 Performance Optimization
```javascript
// Cache compiled pipelines
const pipelineCache = new Map();

function getPipeline(card) {
  if (!pipelineCache.has(card.name)) {
    pipelineCache.set(card.name, compilePipeline(card.pipeline));
  }
  return pipelineCache.get(card.name);
}

// Pre-resolve static values
function compilePipeline(pipeline) {
  return pipeline.map(step => ({
    ...step,
    params: preResolveParams(step.params)
  }));
}
```

#### 7.4 Documentation
- Update `CLAUDE.md` with pipeline patterns
- Document all Actions, Collectors, Conditions
- Add examples for common card patterns
- Create troubleshooting guide

#### 7.5 Test Coverage
- Unit tests: 100% coverage on pipeline modules
- Integration tests: Every card in the game
- Network tests: All multiplayer flows
- Performance tests: Pipeline execution benchmarks

### Testing Requirements
- [ ] Full regression test of all cards
- [ ] Performance benchmarks show no regression
- [ ] Network play tested thoroughly
- [ ] Edge cases documented and tested

### Success Criteria
- Zero legacy code remaining
- All cards using pipeline
- Performance equal or better than legacy
- Documentation complete
- Test coverage > 90%

---

## Risk Mitigation

### Risk: Regression in Card Behavior
**Mitigation**:
- Parallel mode during migration (pipeline + legacy)
- Comprehensive regression tests per card
- A/B testing capability

### Risk: Performance Degradation
**Mitigation**:
- Benchmark before/after each phase
- Pipeline compilation/caching
- Lazy evaluation where possible

### Risk: Network Sync Issues
**Mitigation**:
- State hash verification
- Deterministic pipeline execution
- Extensive multiplayer testing

### Risk: UI Responsiveness
**Mitigation**:
- Async/await properly throughout
- Loading indicators during collection
- Timeout handling with defaults

---

## Success Metrics

### Functional
- [ ] All 100+ cards working via pipeline
- [ ] All ages/catastrophes working via pipeline
- [ ] All reaction cards working
- [ ] All World's End effects working

### Performance
- [ ] Pipeline execution < 10ms per card
- [ ] No noticeable UI lag
- [ ] Network sync within 100ms

### Developer Experience
- [ ] New card definition < 15 minutes
- [ ] No new handler code needed for new cards
- [ ] Clear error messages for invalid pipelines

### Code Quality
- [ ] Test coverage > 90%
- [ ] Zero legacy action handlers
- [ ] Fully documented API

---

## Timeline Flexibility

This plan is designed for incremental implementation:

- **Minimum Viable**: Phases 1-3 (foundation + simple cards)
- **Core Complete**: Phases 1-5 (adds complex cards, ages, catastrophes)
- **Full Feature**: Phases 1-7 (adds reactions, World's End, cleanup)

Each phase can be paused after completion with a working game. Later phases build on earlier work but the game remains playable throughout.

---

## Appendix: Card Migration Checklist

Use this checklist when migrating each card:

```markdown
## Card: [Card Name]

### Pre-Migration
- [ ] Document current behavior
- [ ] Identify all actions
- [ ] Identify input requirements
- [ ] Note edge cases

### Migration
- [ ] Write pipeline definition
- [ ] Test basic flow
- [ ] Test with different player counts
- [ ] Test edge cases
- [ ] Test network sync

### Post-Migration
- [ ] Remove legacy actions array
- [ ] Update card description if needed
- [ ] Add to regression test suite
```
