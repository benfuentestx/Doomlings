# Card Verification & Fix Prompt

## Your Task
Verify that a specific card's implementation in `js/cards-data.js` matches the actual card text from the card image. Fix any discrepancies completely - do not leave work incomplete.

## Files
- **Card Images:** `images/cards/CARD NAME.png` (uppercase)
- **Card Data:** `js/cards-data.js` - card definitions
- **Game Engine:** `js/game-engine.js` - action handlers (modify if needed)
- **Frontend:** `game.html` - UI modal handlers (rarely needs changes)

## Process

### Step 1: Read the Card Image
Use the Read tool on the card image file. Extract:
- Card name
- Face value (bottom left number, or star/null for variable)
- Color (border color: Red, Blue, Green, Purple, or Gray=Colorless)
- Effect text (text below the character artwork)
- Any special indicators (DOMINANT tag, action symbol, etc.)

### Step 2: Find Current Implementation
Search `js/cards-data.js` for the card by name. Note the current implementation.

### Step 3: Compare & Identify Issues
Compare the card's effect text to the implementation. Common issues:
- Wrong action type (e.g., `steal_trait` vs `swap_trait`)
- Missing parameters (e.g., `same_color: true`)
- Wrong target (`self` vs `opponents` vs `all`)
- Missing play conditions
- Wrong face value or color
- Wrong number values (draw 1 vs draw 3, etc.)

### Step 4: Fix Completely
If discrepancy found, you MUST complete the fix:

1. **Edit `js/cards-data.js`** with correct implementation
2. **If action exists in game-engine.js** - use it with correct params
3. **If action does NOT exist** - you MUST add it to game-engine.js (see below)

## Available Action Types (in game-engine.js)
**PREFER these existing actions.** Only create new ones if truly necessary:

| Action Name | Purpose | Key Params |
|-------------|---------|------------|
| `draw_cards` | Draw cards | `value`, `affected_players` (self/all/opponents) |
| `discard_card_from_hand` | Discard from hand | `num_cards`, `affected_players`, `random_discard` |
| `discard_card_from_trait_pile` | Discard trait | `num_cards`, `color`, `affected_players` |
| `play_another_trait` | Extra play | `num_traits`, `ignore_actions` |
| `view_top_deck` | See trait deck | `value` (count) |
| `view_age_deck` | See age deck | `value` (count) |
| `view_opponent_hand` | See opponent's hand | - |
| `search_discard` | Take from discard | - |
| `steal_trait` | Take opponent's trait | `face_value` (optional filter) |
| `steal_random_card` | Steal from hand | - |
| `return_trait_to_hand` | Return own trait | - |
| `return_opponent_trait_to_hand` | Return opponent's trait to their hand | - |
| `protect_traits` | Prevent removal | - |
| `discard_hand_draw_new` | Redraw hand +1 | - |
| `discard_opponent_trait` | Remove opponent trait | - |
| `copy_opponent_trait` | Copy trait effect | - |
| `give_cards` | Give to opponent | `num_cards` |
| `swap_trait` | Exchange traits | `same_color` (optional) |
| `rearrange_traits` | Reorder pile | - |

## Adding a New Action to game-engine.js

If you need an action that doesn't exist, you MUST add it. Follow this pattern:

### Step 1: Add the action case in `executeAction` method (around line 370-720)
```javascript
case 'your_new_action': {
  // Filter/find targets
  const opponents = gameState.players.filter(p => p.id !== player.id && /* conditions */);
  if (opponents.length === 0) return { needsInput: false };
  return {
    needsInput: true,
    inputType: 'select_opponent_trait', // or other input type
    options: /* build options */,
    message: 'Choose something',
    effectType: 'your_new_action',
    optional: true
  };
}
```

### Step 2: Add resolution in `resolveTargetSelection` method (around line 760-845)
```javascript
case 'your_new_action':
  if (!targetPlayer) return { success: false, error: 'No target selected' };
  // Do the actual effect
  gameState.log(`${player.name} did something to ${targetPlayer.name}`);
  return { success: true };
```

### Input Types Available
- `select_opponent` - Choose an opponent
- `select_opponent_trait` - Choose opponent's trait
- `select_own_cards` - Choose cards from hand
- `select_own_trait` - Choose own trait
- `select_from_discard` - Choose from discard
- `view_cards` - Just view (no selection)
- `select_trait_swap` - Two-step swap selection

## Available Effect Types (passive/scoring)
| Effect Name | Purpose | Params |
|-------------|---------|--------|
| `modify_gene_pool` | Change gene pool | `value`, `affected_players` |
| `bonus_for_every_color` | +X per color | `color`, `value` |
| `bonus_gene_pool` | Points = gene pool | - |
| `bonus_number_cards_hand` | Points = hand size | `card_type` (optional) |
| `bonus_number_traits` | Points per trait | `value` |

## Available Play Conditions
| Condition | Purpose | Params |
|-----------|---------|--------|
| `at_least_n_traits` | Require N traits | `num_traits`, `color` (optional) |

## Output Format (REQUIRED)

Respond with this exact format:

```
## CARD TEST RESULTS

### [CARD NAME]
- **Image:** [face value] | [color]
- **Effect:** "[effect text from card]"
- **Status:** ✅ Correct / 🔧 Fixed
- **Changes:** None / [brief description]
- **Files Modified:** None / cards-data.js / cards-data.js + game-engine.js

[Repeat for each card]

## BATCH SUMMARY
| Card | Status | Changes |
|------|--------|---------|
| NAME | ✅/🔧 | None/description |
```

## Important Rules
1. **COMPLETE YOUR WORK** - Do not leave cards in a broken state
2. **PREFER existing actions** - Only add new ones if truly necessary
3. **If you add a new action** - Add BOTH the action case AND the resolution handler
4. Always preserve the card's `expansion` field
5. Always include `actionDescription` for action cards
6. Always include `bonusDescription` for bonus point cards
7. Test your logic mentally - will this actually work?
