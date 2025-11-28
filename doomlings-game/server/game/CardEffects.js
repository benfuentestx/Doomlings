const DeckManager = require('./DeckManager');

class CardEffects {
  // Card effect definitions for Classic edition action cards
  // Effects are inferred from card names and common Doomlings mechanics
  static effects = {
    // BLUE CARDS (typically manipulation, defense)
    'Automimicry (0)': {
      type: 'copy_trait',
      description: 'Copy the top trait of any opponent\'s trait pile',
      needsTarget: true,
      targetType: 'opponent_trait',
      optional: true
    },
    'Cold Blood': {
      type: 'draw',
      count: 1,
      description: 'Draw 1 card'
    },
    'Costly Signaling': {
      type: 'steal_random',
      description: 'Steal a random card from an opponent\'s hand',
      needsTarget: true,
      targetType: 'opponent'
    },
    'Flight': {
      type: 'return_trait',
      description: 'Return one of your traits to your hand',
      needsTarget: true,
      targetType: 'own_trait',
      optional: true
    },
    'Iridescent Scales': {
      type: 'swap_hands_partial',
      count: 1,
      description: 'Swap 1 card from your hand with an opponent',
      needsTarget: true,
      targetType: 'opponent_and_card'
    },
    'Painted Shell': {
      type: 'view_hand',
      description: 'Look at an opponent\'s hand',
      needsTarget: true,
      targetType: 'opponent'
    },
    'Scutes': {
      type: 'protect',
      description: 'Your traits cannot be stolen until your next turn',
      persistent_until: 'next_turn'
    },
    'Selective Memory': {
      type: 'search_discard',
      description: 'Take a card from the discard pile',
      needsTarget: true,
      targetType: 'discard_pile',
      optional: true
    },
    'Sweat': {
      type: 'discard_draw',
      discard: 1,
      draw: 2,
      description: 'Discard 1 card, draw 2 cards',
      needsTarget: true,
      targetType: 'own_hand'
    },
    'Tentacles': {
      type: 'steal_trait',
      description: 'Steal a trait from an opponent',
      needsTarget: true,
      targetType: 'opponent_trait',
      optional: true
    },

    // GREEN CARDS (typically growth, nature)
    'Photosynthesis': {
      type: 'draw',
      count: 1,
      description: 'Draw 1 card'
    },
    'Propagation': {
      type: 'draw_if_color',
      color: 'Green',
      count: 1,
      description: 'If you have another Green trait, draw 1 card'
    },
    'Self-Replicating': {
      type: 'draw_each_round',
      count: 1,
      description: 'Draw 1 card at the start of each round (persistent)',
      persistent: true
    },
    'Tiny Little Melons': {
      type: 'give_card',
      description: 'Give a card from your hand to another player',
      needsTarget: true,
      targetType: 'player_and_card',
      optional: true
    },
    'Trunk': {
      type: 'draw',
      count: 2,
      description: 'Draw 2 cards'
    },

    // PURPLE CARDS (typically mind, manipulation)
    'Clever': {
      type: 'view_top_deck',
      count: 3,
      description: 'Look at the top 3 cards of the deck'
    },
    'Directly Register': {
      type: 'draw',
      count: 1,
      description: 'Draw 1 card'
    },
    'Impatience': {
      type: 'draw_discard',
      draw: 2,
      discard: 1,
      description: 'Draw 2 cards, then discard 1 card',
      needsTarget: true,
      targetType: 'own_hand_after_draw'
    },
    'Inventive': {
      type: 'rearrange_traits',
      description: 'Rearrange the order of your trait pile',
      optional: true
    },
    'Memory': {
      type: 'search_discard',
      description: 'Take a card from the discard pile',
      needsTarget: true,
      targetType: 'discard_pile',
      optional: true
    },
    'Nosy': {
      type: 'view_hand',
      description: 'Look at an opponent\'s hand',
      needsTarget: true,
      targetType: 'opponent'
    },
    'Persuasive': {
      type: 'swap_trait',
      description: 'Swap one of your traits with an opponent\'s trait',
      needsTarget: true,
      targetType: 'trait_swap',
      optional: true
    },
    'Poisonous': {
      type: 'discard_opponent_trait',
      description: 'Discard a trait from an opponent\'s pile',
      needsTarget: true,
      targetType: 'opponent_trait',
      optional: true
    },
    'Selfish': {
      type: 'steal_random',
      description: 'Steal a random card from an opponent\'s hand',
      needsTarget: true,
      targetType: 'opponent'
    },
    'Telekinetic': {
      type: 'move_trait',
      description: 'Move a trait from one player to another',
      needsTarget: true,
      targetType: 'trait_move',
      optional: true
    },
    'Venomous': {
      type: 'discard_opponent_hand',
      count: 2,
      description: 'An opponent discards 2 cards from their hand',
      needsTarget: true,
      targetType: 'opponent'
    },

    // RED CARDS (typically aggressive, risky)
    'Bad': {
      type: 'discard_opponent_hand',
      count: 1,
      description: 'An opponent discards 1 card from their hand',
      needsTarget: true,
      targetType: 'opponent'
    },
    'Brave (2)': {
      type: 'draw',
      count: 1,
      description: 'Draw 1 card'
    },
    'Hot Temper': {
      type: 'discard_draw',
      discard: 2,
      draw: 3,
      description: 'Discard up to 2 cards, draw that many +1',
      needsTarget: true,
      targetType: 'own_hand_multi',
      optional: true
    },
    'Reckless': {
      type: 'discard_draw_all',
      description: 'Discard your entire hand, draw that many cards +1'
    },
    'Territorial': {
      type: 'steal_trait_red',
      description: 'Steal a Red trait from an opponent',
      needsTarget: true,
      targetType: 'opponent_red_trait',
      optional: true
    },
    'Voracious': {
      type: 'draw',
      count: 2,
      description: 'Draw 2 cards'
    },

    // COLORLESS CARDS
    'Boredom (1)': {
      type: 'draw',
      count: 1,
      description: 'Draw 1 card'
    },
    'Doting': {
      type: 'give_cards',
      count: 2,
      description: 'Give 2 cards from your hand to another player',
      needsTarget: true,
      targetType: 'player_and_cards',
      optional: true
    },
    'Introspective': {
      type: 'draw',
      count: 1,
      description: 'Draw 1 card'
    },
    'The Third Eye': {
      type: 'view_ages',
      count: 3,
      description: 'Look at the top 3 cards of the Age deck'
    }
  };

  // Check play_when requirements
  static checkPlayWhen(gameState, player, card) {
    // Most play_when cards have specific requirements
    // For Classic, we'll allow all cards to be played (simplified)
    return { allowed: true };
  }

  // Handle action card effects
  static handleAction(gameState, player, card) {
    const effect = this.effects[card.trait];

    if (!effect) {
      // No special effect, just a standard play
      return { needsInput: false };
    }

    // Handle effects that don't need player input
    switch (effect.type) {
      case 'draw':
        const drawn = gameState.drawCards(effect.count);
        player.hand.push(...drawn);
        gameState.log(`${player.name} drew ${drawn.length} card(s)`);
        return { needsInput: false };

      case 'draw_if_color':
        const hasColor = player.traitPile.some(c =>
          c.instanceId !== card.instanceId && DeckManager.isColor(c, effect.color)
        );
        if (hasColor) {
          const colorDrawn = gameState.drawCards(effect.count);
          player.hand.push(...colorDrawn);
          gameState.log(`${player.name} drew ${colorDrawn.length} card(s)`);
        }
        return { needsInput: false };

      case 'discard_draw_all':
        const handSize = player.hand.length;
        gameState.discardPile.push(...player.hand);
        player.hand = [];
        const newCards = gameState.drawCards(handSize + 1);
        player.hand.push(...newCards);
        gameState.log(`${player.name} discarded entire hand and drew ${newCards.length} cards`);
        return { needsInput: false };

      case 'protect':
        player.protected = true;
        player.protectedUntil = gameState.round + 1;
        gameState.log(`${player.name}'s traits are protected`);
        return { needsInput: false };

      case 'view_top_deck':
        // Just show the player the top cards (sent via gameState)
        return {
          needsInput: true,
          inputType: 'view_cards',
          cards: gameState.traitDeck.slice(0, effect.count),
          message: `Top ${effect.count} cards of the deck`,
          optional: true
        };

      case 'view_ages':
        return {
          needsInput: true,
          inputType: 'view_cards',
          cards: gameState.ageDeck.slice(0, effect.count),
          message: `Top ${effect.count} Age cards`,
          optional: true
        };

      case 'view_hand':
        // Need to select opponent first
        return {
          needsInput: true,
          inputType: 'select_opponent',
          options: gameState.players.filter(p => p.id !== player.id).map(p => ({
            id: p.id,
            name: p.name
          })),
          message: 'Choose an opponent to view their hand',
          effectType: 'view_hand'
        };

      case 'steal_random':
        return {
          needsInput: true,
          inputType: 'select_opponent',
          options: gameState.players.filter(p => p.id !== player.id && p.hand.length > 0).map(p => ({
            id: p.id,
            name: p.name,
            handSize: p.hand.length
          })),
          message: 'Choose an opponent to steal a random card from',
          effectType: 'steal_random'
        };

      case 'steal_trait':
      case 'copy_trait':
      case 'discard_opponent_trait':
        const opponents = gameState.players.filter(p =>
          p.id !== player.id && p.traitPile.length > 0 &&
          !(p.protected && p.protectedUntil > gameState.round)
        );
        if (opponents.length === 0) {
          gameState.log('No valid targets');
          return { needsInput: false };
        }
        return {
          needsInput: true,
          inputType: 'select_opponent_trait',
          options: opponents.map(p => ({
            id: p.id,
            name: p.name,
            traits: p.traitPile.map((t, i) => ({ index: i, trait: t.trait, color: t.color, face: t.face }))
          })),
          message: effect.type === 'steal_trait' ? 'Choose a trait to steal' :
                   effect.type === 'copy_trait' ? 'Choose a trait to copy' :
                   'Choose a trait to discard',
          effectType: effect.type,
          optional: effect.optional
        };

      case 'steal_trait_red':
        const redOpponents = gameState.players.filter(p =>
          p.id !== player.id &&
          p.traitPile.some(t => DeckManager.isColor(t, 'Red')) &&
          !(p.protected && p.protectedUntil > gameState.round)
        );
        if (redOpponents.length === 0) {
          gameState.log('No valid targets with Red traits');
          return { needsInput: false };
        }
        return {
          needsInput: true,
          inputType: 'select_opponent_trait',
          options: redOpponents.map(p => ({
            id: p.id,
            name: p.name,
            traits: p.traitPile
              .map((t, i) => ({ index: i, trait: t.trait, color: t.color, face: t.face }))
              .filter(t => t.color.includes('Red'))
          })),
          message: 'Choose a Red trait to steal',
          effectType: 'steal_trait',
          optional: effect.optional
        };

      case 'return_trait':
        if (player.traitPile.length <= 1) {
          // Can't return the card just played
          return { needsInput: false };
        }
        return {
          needsInput: true,
          inputType: 'select_own_trait',
          options: player.traitPile.slice(0, -1).map((t, i) => ({
            index: i,
            trait: t.trait,
            color: t.color,
            face: t.face
          })),
          message: 'Choose a trait to return to your hand',
          effectType: 'return_trait',
          optional: effect.optional
        };

      case 'discard_draw':
      case 'swap_hands_partial':
        return {
          needsInput: true,
          inputType: 'select_own_cards',
          count: effect.discard || effect.count,
          options: player.hand.map((c, i) => ({
            index: i,
            trait: c.trait,
            color: c.color,
            face: c.face
          })),
          message: `Choose ${effect.discard || effect.count} card(s) to ${effect.type === 'discard_draw' ? 'discard' : 'swap'}`,
          effectType: effect.type,
          drawAfter: effect.draw
        };

      case 'draw_discard':
        // First draw, then select cards to discard
        const drawnCards = gameState.drawCards(effect.draw);
        player.hand.push(...drawnCards);
        gameState.log(`${player.name} drew ${drawnCards.length} cards`);
        return {
          needsInput: true,
          inputType: 'select_own_cards',
          count: effect.discard,
          options: player.hand.map((c, i) => ({
            index: i,
            trait: c.trait,
            color: c.color,
            face: c.face
          })),
          message: `Choose ${effect.discard} card(s) to discard`,
          effectType: 'discard_selected'
        };

      case 'discard_opponent_hand':
        return {
          needsInput: true,
          inputType: 'select_opponent',
          options: gameState.players.filter(p => p.id !== player.id && p.hand.length > 0).map(p => ({
            id: p.id,
            name: p.name,
            handSize: p.hand.length
          })),
          message: `Choose an opponent to discard ${effect.count} card(s)`,
          effectType: 'discard_opponent_hand',
          count: effect.count
        };

      case 'swap_trait':
        if (player.traitPile.length <= 1) {
          return { needsInput: false };
        }
        const swapOpponents = gameState.players.filter(p =>
          p.id !== player.id && p.traitPile.length > 0 &&
          !(p.protected && p.protectedUntil > gameState.round)
        );
        if (swapOpponents.length === 0) {
          return { needsInput: false };
        }
        return {
          needsInput: true,
          inputType: 'select_trait_swap',
          ownTraits: player.traitPile.slice(0, -1).map((t, i) => ({
            index: i,
            trait: t.trait,
            color: t.color,
            face: t.face
          })),
          opponents: swapOpponents.map(p => ({
            id: p.id,
            name: p.name,
            traits: p.traitPile.map((t, i) => ({
              index: i,
              trait: t.trait,
              color: t.color,
              face: t.face
            }))
          })),
          message: 'Choose traits to swap',
          effectType: 'swap_trait',
          optional: effect.optional
        };

      case 'give_card':
      case 'give_cards':
        if (player.hand.length === 0) {
          return { needsInput: false };
        }
        return {
          needsInput: true,
          inputType: 'select_player_and_cards',
          count: effect.count || 1,
          players: gameState.players.filter(p => p.id !== player.id).map(p => ({
            id: p.id,
            name: p.name
          })),
          cards: player.hand.map((c, i) => ({
            index: i,
            trait: c.trait,
            color: c.color,
            face: c.face
          })),
          message: `Choose ${effect.count || 1} card(s) to give to another player`,
          effectType: 'give_cards',
          optional: effect.optional
        };

      case 'search_discard':
        if (gameState.discardPile.length === 0) {
          gameState.log('Discard pile is empty');
          return { needsInput: false };
        }
        return {
          needsInput: true,
          inputType: 'select_from_discard',
          options: gameState.discardPile.map((c, i) => ({
            index: i,
            trait: c.trait,
            color: c.color,
            face: c.face
          })),
          message: 'Choose a card from the discard pile',
          effectType: 'search_discard',
          optional: effect.optional
        };

      case 'move_trait':
        // Complex: select a trait from any player and move it to another
        const playersWithTraits = gameState.players.filter(p => p.traitPile.length > 0);
        if (playersWithTraits.length < 2) {
          return { needsInput: false };
        }
        return {
          needsInput: true,
          inputType: 'select_trait_move',
          players: playersWithTraits.map(p => ({
            id: p.id,
            name: p.name,
            traits: p.traitPile.map((t, i) => ({
              index: i,
              trait: t.trait,
              color: t.color,
              face: t.face
            }))
          })),
          message: 'Choose a trait to move and its destination',
          effectType: 'move_trait',
          optional: effect.optional
        };

      default:
        return { needsInput: false };
    }
  }

  // Resolve target selection
  static resolveTargetSelection(gameState, pendingAction, data) {
    const player = gameState.getPlayer(pendingAction.player);
    const targetPlayer = gameState.getPlayer(data.targetId);

    switch (pendingAction.effectType) {
      case 'view_hand':
        // Return the opponent's hand for viewing
        return {
          success: true,
          needsMoreInput: true,
          viewHand: targetPlayer.hand.map(c => ({
            trait: c.trait,
            color: c.color,
            face: c.face
          })),
          message: `${targetPlayer.name}'s hand`
        };

      case 'steal_random':
        if (targetPlayer.hand.length === 0) {
          return { success: false, error: 'Target has no cards' };
        }
        const randomIndex = Math.floor(Math.random() * targetPlayer.hand.length);
        const stolenCard = targetPlayer.hand.splice(randomIndex, 1)[0];
        player.hand.push(stolenCard);
        gameState.log(`${player.name} stole a card from ${targetPlayer.name}`);
        return { success: true };

      case 'discard_opponent_hand':
        const count = Math.min(pendingAction.count, targetPlayer.hand.length);
        // Randomly discard cards
        for (let i = 0; i < count; i++) {
          const idx = Math.floor(Math.random() * targetPlayer.hand.length);
          const discarded = targetPlayer.hand.splice(idx, 1)[0];
          gameState.discardPile.push(discarded);
        }
        gameState.log(`${targetPlayer.name} discarded ${count} card(s)`);
        return { success: true };

      case 'steal_trait':
        const traitIndex = data.traitIndex;
        if (traitIndex < 0 || traitIndex >= targetPlayer.traitPile.length) {
          return { success: false, error: 'Invalid trait selection' };
        }
        const stolenTrait = targetPlayer.traitPile.splice(traitIndex, 1)[0];
        player.traitPile.push(stolenTrait);
        gameState.log(`${player.name} stole ${stolenTrait.trait} from ${targetPlayer.name}`);
        return { success: true };

      case 'copy_trait':
        const copyIndex = data.traitIndex;
        if (copyIndex < 0 || copyIndex >= targetPlayer.traitPile.length) {
          return { success: false, error: 'Invalid trait selection' };
        }
        // Create a copy of the trait
        const copiedTrait = { ...targetPlayer.traitPile[copyIndex] };
        copiedTrait.instanceId = `copy_${copiedTrait.trait}_${Date.now()}`;
        player.traitPile.push(copiedTrait);
        gameState.log(`${player.name} copied ${copiedTrait.trait} from ${targetPlayer.name}`);
        return { success: true };

      case 'discard_opponent_trait':
        const discardIndex = data.traitIndex;
        if (discardIndex < 0 || discardIndex >= targetPlayer.traitPile.length) {
          return { success: false, error: 'Invalid trait selection' };
        }
        const discardedTrait = targetPlayer.traitPile.splice(discardIndex, 1)[0];
        gameState.discardPile.push(discardedTrait);
        gameState.log(`${player.name} discarded ${discardedTrait.trait} from ${targetPlayer.name}`);
        return { success: true };

      default:
        return { success: false, error: 'Unknown effect type' };
    }
  }

  // Resolve card selection
  static resolveCardSelection(gameState, pendingAction, data) {
    const player = gameState.getPlayer(pendingAction.player);

    switch (pendingAction.effectType) {
      case 'discard_selected':
        const indices = Array.isArray(data.indices) ? data.indices : [data.indices];
        // Sort indices in reverse order to remove from end first
        indices.sort((a, b) => b - a);
        for (const idx of indices) {
          if (idx >= 0 && idx < player.hand.length) {
            const discarded = player.hand.splice(idx, 1)[0];
            gameState.discardPile.push(discarded);
          }
        }
        gameState.log(`${player.name} discarded ${indices.length} card(s)`);
        return { success: true };

      case 'discard_draw':
        const discardIndices = Array.isArray(data.indices) ? data.indices : [data.indices];
        discardIndices.sort((a, b) => b - a);
        for (const idx of discardIndices) {
          if (idx >= 0 && idx < player.hand.length) {
            const discarded = player.hand.splice(idx, 1)[0];
            gameState.discardPile.push(discarded);
          }
        }
        const drawCount = discardIndices.length + (pendingAction.drawAfter - (pendingAction.discard || 0));
        const drawn = gameState.drawCards(Math.max(0, pendingAction.drawAfter || discardIndices.length));
        player.hand.push(...drawn);
        gameState.log(`${player.name} discarded ${discardIndices.length} and drew ${drawn.length} cards`);
        return { success: true };

      case 'return_trait':
        const returnIndex = data.index;
        if (returnIndex < 0 || returnIndex >= player.traitPile.length - 1) {
          return { success: false, error: 'Invalid trait selection' };
        }
        const returnedTrait = player.traitPile.splice(returnIndex, 1)[0];
        player.hand.push(returnedTrait);
        gameState.log(`${player.name} returned ${returnedTrait.trait} to hand`);
        return { success: true };

      case 'search_discard':
        const discardPickIndex = data.index;
        if (discardPickIndex < 0 || discardPickIndex >= gameState.discardPile.length) {
          return { success: false, error: 'Invalid card selection' };
        }
        const pickedCard = gameState.discardPile.splice(discardPickIndex, 1)[0];
        player.hand.push(pickedCard);
        gameState.log(`${player.name} took ${pickedCard.trait} from discard`);
        return { success: true };

      case 'give_cards':
        const targetId = data.targetId;
        const giveIndices = Array.isArray(data.indices) ? data.indices : [data.indices];
        const targetPlayer = gameState.getPlayer(targetId);
        if (!targetPlayer) {
          return { success: false, error: 'Target player not found' };
        }
        giveIndices.sort((a, b) => b - a);
        const givenCards = [];
        for (const idx of giveIndices) {
          if (idx >= 0 && idx < player.hand.length) {
            givenCards.push(player.hand.splice(idx, 1)[0]);
          }
        }
        targetPlayer.hand.push(...givenCards);
        gameState.log(`${player.name} gave ${givenCards.length} card(s) to ${targetPlayer.name}`);
        return { success: true };

      case 'swap_trait':
        const ownIndex = data.ownTraitIndex;
        const oppId = data.opponentId;
        const oppIndex = data.opponentTraitIndex;
        const opponent = gameState.getPlayer(oppId);
        if (!opponent) {
          return { success: false, error: 'Opponent not found' };
        }
        if (ownIndex < 0 || ownIndex >= player.traitPile.length - 1) {
          return { success: false, error: 'Invalid own trait selection' };
        }
        if (oppIndex < 0 || oppIndex >= opponent.traitPile.length) {
          return { success: false, error: 'Invalid opponent trait selection' };
        }
        // Swap traits
        const ownTrait = player.traitPile[ownIndex];
        const oppTrait = opponent.traitPile[oppIndex];
        player.traitPile[ownIndex] = oppTrait;
        opponent.traitPile[oppIndex] = ownTrait;
        gameState.log(`${player.name} swapped ${ownTrait.trait} with ${opponent.name}'s ${oppTrait.trait}`);
        return { success: true };

      case 'move_trait':
        const fromPlayerId = data.fromPlayerId;
        const fromIndex = data.fromIndex;
        const toPlayerId = data.toPlayerId;
        const fromPlayer = gameState.getPlayer(fromPlayerId);
        const toPlayer = gameState.getPlayer(toPlayerId);
        if (!fromPlayer || !toPlayer) {
          return { success: false, error: 'Player not found' };
        }
        if (fromIndex < 0 || fromIndex >= fromPlayer.traitPile.length) {
          return { success: false, error: 'Invalid trait selection' };
        }
        const movedTrait = fromPlayer.traitPile.splice(fromIndex, 1)[0];
        toPlayer.traitPile.push(movedTrait);
        gameState.log(`${player.name} moved ${movedTrait.trait} from ${fromPlayer.name} to ${toPlayer.name}`);
        return { success: true };

      default:
        return { success: true };
    }
  }

  // Apply catastrophe effects
  static applyCatastropheEffect(gameState, player, catastrophe) {
    switch (catastrophe.action) {
      case 'discard_trait':
        if (player.traitPile.length > 0) {
          // Discard a random trait
          const idx = Math.floor(Math.random() * player.traitPile.length);
          const discarded = player.traitPile.splice(idx, 1)[0];
          gameState.discardPile.push(discarded);
          gameState.log(`${player.name} lost ${discarded.trait} to the catastrophe`);
        }
        break;

      case 'discard_lowest':
        if (player.traitPile.length > 0) {
          // Find lowest value trait
          let lowestIdx = 0;
          let lowestValue = DeckManager.getFaceValue(player.traitPile[0], gameState, player);
          for (let i = 1; i < player.traitPile.length; i++) {
            const val = DeckManager.getFaceValue(player.traitPile[i], gameState, player);
            if (val < lowestValue) {
              lowestValue = val;
              lowestIdx = i;
            }
          }
          const discarded = player.traitPile.splice(lowestIdx, 1)[0];
          gameState.discardPile.push(discarded);
          gameState.log(`${player.name} lost ${discarded.trait} (lowest value) to the catastrophe`);
        }
        break;

      case 'discard_colorless':
        const colorlessCards = player.traitPile.filter(c => c.color === 'Colorless');
        for (const card of colorlessCards) {
          const idx = player.traitPile.indexOf(card);
          if (idx !== -1) {
            player.traitPile.splice(idx, 1);
            gameState.discardPile.push(card);
          }
        }
        if (colorlessCards.length > 0) {
          gameState.log(`${player.name} lost ${colorlessCards.length} Colorless trait(s)`);
        }
        break;

      case 'discard_color':
        const colorCards = player.traitPile.filter(c => DeckManager.isColor(c, catastrophe.color));
        if (colorCards.length > 0) {
          const idx = player.traitPile.indexOf(colorCards[0]);
          if (idx !== -1) {
            player.traitPile.splice(idx, 1);
            gameState.discardPile.push(colorCards[0]);
            gameState.log(`${player.name} lost ${colorCards[0].trait} to the catastrophe`);
          }
        }
        break;
    }
  }

  // Handle pass cards catastrophe
  static handlePassCards(gameState, count) {
    // Collect cards to pass from each player
    const cardsToPass = [];
    for (const player of gameState.players) {
      const passing = player.hand.splice(0, Math.min(count, player.hand.length));
      cardsToPass.push(passing);
    }

    // Pass to left (next player in array)
    for (let i = 0; i < gameState.players.length; i++) {
      const nextIdx = (i + 1) % gameState.players.length;
      gameState.players[nextIdx].hand.push(...cardsToPass[i]);
    }

    gameState.log(`All players passed ${count} cards to the left`);
  }
}

module.exports = CardEffects;
