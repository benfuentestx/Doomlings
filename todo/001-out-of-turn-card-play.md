# Out-of-Turn Card Play

## Problem Statement

Several trait cards have a `playWhen` property that allows them to be played reactively, outside of the player's normal turn. Currently, the game engine does not implement this functionality - these cards can only be played during the player's regular turn like any other trait.

### Affected Cards

| Card | playWhen | Trigger |
|------|----------|---------|
| Parasitic | `opponent_plays` | When an opponent plays a trait |
| Chromatophores | `restriction` | When an age restricts a color |
| Automimicry (-1) | `targeted` | When targeted by a trait effect |
| Defensive Herding | `targeted` | When targeted by an effect |

### Rulebook Reference (Page 2)

> **OUT OF TURN:** Some traits can be played out of turn. If the trait is played as instructed, it does not count as your turn! Do not stabilize until the end of your turn!

## Current Behavior

- Cards with `playWhen` properties are treated like normal cards
- Players can only play them during their turn
- The reactive trigger conditions are ignored

## Desired Behavior

1. When a trigger event occurs (opponent plays trait, player targeted, etc.), the game should pause
2. Players with matching reactive cards in hand should be given a window to respond
3. If they play the reactive card:
   - Card goes to their trait pile
   - It does NOT count as their turn
   - They do NOT stabilize
   - Any card effects still trigger
4. If they decline or timeout, play continues normally

## Potential Solution

### Architecture Changes

1. **Add reaction phase after trigger events:**
   - After `playCard()` completes, check if any opponents have `playWhen: 'opponent_plays'` cards
   - After targeting effects resolve, check for `playWhen: 'targeted'` cards
   - After age reveal with restrictions, check for `playWhen: 'restriction'` cards

2. **New game state properties:**
   ```javascript
   this.reactionWindow = null; // { trigger: 'opponent_plays', triggeringPlayer: id, eligiblePlayers: [...] }
   this.pendingReactions = new Map(); // playerId -> 'waiting' | 'passed' | cardIndex
   ```

3. **New methods:**
   ```javascript
   checkForReactions(trigger, context) // Check if any player can react
   offerReaction(playerId, trigger)    // Prompt player to react
   playReaction(playerId, cardIndex)   // Play a reactive card
   passReaction(playerId)              // Decline to react
   ```

4. **Frontend changes:**
   - Modal or notification when you can play a reactive card
   - "Play" and "Pass" buttons
   - Timeout timer (optional, for multiplayer fairness)

### Implementation Steps

1. Add `reactionWindow` state tracking to GameState
2. Modify `playCard()` to check for `opponent_plays` reactions after completion
3. Modify targeting effects to check for `targeted` reactions
4. Modify `handleAgeEffect()` to check for `restriction` reactions
5. Add `playReaction()` method that plays card without advancing turn
6. Add frontend UI for reaction prompts
7. Add multiplayer support in peer-manager

### Complexity Considerations

- **Multiplayer timing:** Need to wait for all eligible players to respond or pass
- **Nested reactions:** What if a reactive card triggers another reaction?
- **Timeout handling:** Should there be a time limit to respond?
- **UI clarity:** Players need to clearly understand when they can react

## Priority

Medium - These cards exist in the base game and should work as designed, but the game is playable without them.
