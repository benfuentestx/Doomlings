// Doomlings Game Engine - Browser Version
// Combines DeckManager, CardEffects, Scoring, and GameState

import { classicCards, birthOfLife, ageCards, catastrophes } from './cards-data.js';

// ============== DECK MANAGER ==============

export class DeckManager {
  static shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  static createAgeDeck() {
    const ages = this.shuffle([...ageCards]);
    const cats = this.shuffle([...catastrophes]).slice(0, 3);

    const pile1 = ages.slice(0, 9);
    const pile2 = ages.slice(9, 19);
    const pile3 = ages.slice(19, 28);

    pile1.push(cats[0]);
    pile2.push(cats[1]);
    pile3.push(cats[2]);

    return [
      { ...birthOfLife },
      ...this.shuffle(pile1),
      ...this.shuffle(pile2),
      ...this.shuffle(pile3)
    ];
  }

  static createTraitDeck() {
    const deck = [];
    for (const card of classicCards) {
      if (card.in_game !== 'yes') continue;
      const copies = card.n_cards || 1;
      for (let i = 0; i < copies; i++) {
        deck.push({
          ...card,
          instanceId: `${card.trait}_${i}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
      }
    }
    return this.shuffle(deck);
  }

  static isColor(card, targetColor) {
    const cardColor = card.color || 'Colorless';
    if (targetColor === 'Colorless') return cardColor === 'Colorless';
    return cardColor === targetColor || cardColor.includes(targetColor);
  }

  static getColors(card) {
    return (card.color || 'Colorless').split('_');
  }

  static getFaceValue(card, gameState, player) {
    const face = card.face;
    if (typeof face === 'number') return face;
    if (face === 'variable') return 0;
    if (face === 'copy_1st_dominant' && player) {
      const firstDominant = player.traitPile.find(c => c.dominant && c.instanceId !== card.instanceId);
      if (firstDominant) return this.getFaceValue(firstDominant, gameState, player);
    }
    return 0;
  }
}

// ============== SCORING ==============

export class Scoring {
  static calculateScore(gameState, player) {
    let total = 0;
    for (const card of player.traitPile) {
      let cardScore = this.getBaseFaceValue(card, gameState, player);
      if (card.drops && card.drop_effect) {
        cardScore += this.calculateDropEffect(card, gameState, player);
      }
      total += cardScore;
    }
    total += this.calculateGenePoolBonus(gameState, player);
    return total;
  }

  static getBaseFaceValue(card, gameState, player) {
    const face = card.face;
    if (typeof face === 'number') return face;
    if (face === 'variable') return 0;
    if (face === 'copy_1st_dominant' && player) {
      const firstDominant = player.traitPile.find(c => c.dominant && c.instanceId !== card.instanceId);
      if (firstDominant) return this.getBaseFaceValue(firstDominant, gameState, player);
    }
    return 0;
  }

  static calculateDropEffect(card, gameState, player) {
    const effect = card.drop_effect;
    if (!effect) return 0;

    const parts = effect.split(' ');
    if (parts.length < 2) return 0;

    const valueStr = parts[0];
    const target = parts[1];
    const condition = parts[2] || '';

    let bonus = 0;

    switch (condition) {
      case 'n_hand':
        bonus = this.countValue(valueStr, player.hand.length);
        break;
      case 'n_traits':
        bonus = this.countValue(valueStr, player.traitPile.length);
        break;
      case 'n_blue':
        bonus = this.countValue(valueStr, this.countColor(player.traitPile, 'Blue'));
        break;
      case 'n_green':
        bonus = this.countValue(valueStr, this.countColor(player.traitPile, 'Green'));
        break;
      case 'n_purple':
        bonus = this.countValue(valueStr, this.countColor(player.traitPile, 'Purple'));
        break;
      case 'n_colorless':
        bonus = this.countValue(valueStr, this.countColor(player.traitPile, 'Colorless'));
        break;
      case 'n_negative':
        bonus = this.countValue(valueStr, this.countNegative(player.traitPile, gameState, player));
        break;
      case 'n_dominant':
        bonus = this.countValue(valueStr, this.countDominant(player.hand));
        break;
      case 'n_colors':
        bonus = this.countValue(valueStr, this.countUniqueColors(player.traitPile));
        break;
      case 'n_colors_hand':
        bonus = this.countValue(valueStr, this.countUniqueColors(player.hand));
        break;
      case 'n_face_is_1':
        bonus = this.countValue(valueStr, this.countFaceValue(player.traitPile, 1, gameState, player));
        break;
      case 'n_color_pairs':
        bonus = this.countValue(valueStr, this.countColorPairs(player.traitPile));
        break;
      case 'n_green_pairs':
        bonus = this.countValue(valueStr, this.countGreenPairsOthers(gameState, player));
        break;
      case 'n_color_worlds_end':
        bonus = this.countValue(valueStr, gameState.catastropheCount);
        break;
      case 'n_kidney':
        bonus = this.countValue(valueStr, this.countAllKidney(gameState));
        break;
      case 'n_swarm':
        bonus = this.countValue(valueStr, this.countAllSwarm(gameState));
        break;
      case 'cards_with_effects':
        bonus = this.countValue(valueStr, this.countCardsWithEffects(player.hand));
        break;
      case 'gene_pool':
        bonus = this.calculateGenePoolBonus(gameState, player);
        break;
      case 'lowest_color_count':
        bonus = this.countValue(valueStr, this.getLowestColorCount(player.traitPile));
        break;
      case 'if_most_traits':
        if (this.hasMostTraits(gameState, player)) bonus = parseInt(valueStr) || 0;
        break;
      case 'if_green_most_traits':
        if (this.hasColorMostTraits(gameState, player, 'Green')) bonus = parseInt(valueStr) || 0;
        break;
    }

    if (target === 'opponents') return -bonus;
    return bonus;
  }

  static countValue(valueStr, count) {
    if (valueStr === 'n') return count;
    return (parseInt(valueStr) || 0) * count;
  }

  static countColor(cards, color) {
    return cards.filter(c => DeckManager.isColor(c, color)).length;
  }

  static countNegative(cards, gameState, player) {
    return cards.filter(c => this.getBaseFaceValue(c, gameState, player) < 0).length;
  }

  static countDominant(cards) {
    return cards.filter(c => c.dominant).length;
  }

  static countUniqueColors(cards) {
    const colors = new Set();
    for (const card of cards) {
      DeckManager.getColors(card).forEach(c => colors.add(c));
    }
    colors.delete('Colorless');
    return colors.size;
  }

  static countFaceValue(cards, targetValue, gameState, player) {
    return cards.filter(c => this.getBaseFaceValue(c, gameState, player) === targetValue).length;
  }

  static countColorPairs(cards) {
    const colorCounts = { Red: 0, Blue: 0, Green: 0, Purple: 0 };
    for (const card of cards) {
      for (const color of DeckManager.getColors(card)) {
        if (colorCounts[color] !== undefined) colorCounts[color]++;
      }
    }
    return Object.values(colorCounts).reduce((sum, c) => sum + Math.floor(c / 2), 0);
  }

  static countGreenPairsOthers(gameState, player) {
    let greenCount = 0;
    for (const p of gameState.players) {
      if (p.id !== player.id) greenCount += this.countColor(p.traitPile, 'Green');
    }
    return Math.floor(greenCount / 2);
  }

  static countAllKidney(gameState) {
    let count = 0;
    for (const p of gameState.players) {
      count += p.traitPile.filter(c => c.trait.includes('Kidney')).length;
    }
    return count;
  }

  static countAllSwarm(gameState) {
    let count = 0;
    for (const p of gameState.players) {
      count += p.traitPile.filter(c => c.trait.includes('Swarm')).length;
    }
    return count;
  }

  static countCardsWithEffects(cards) {
    return cards.filter(c => c.action || c.dominant || c.drops || c.gene_pool).length;
  }

  static getLowestColorCount(cards) {
    const colorCounts = { Red: 0, Blue: 0, Green: 0, Purple: 0 };
    for (const card of cards) {
      for (const color of DeckManager.getColors(card)) {
        if (colorCounts[color] !== undefined) colorCounts[color]++;
      }
    }
    return Math.min(...Object.values(colorCounts));
  }

  static hasMostTraits(gameState, player) {
    const myCount = player.traitPile.length;
    return !gameState.players.some(p => p.id !== player.id && p.traitPile.length >= myCount);
  }

  static hasColorMostTraits(gameState, player, color) {
    const myCount = this.countColor(player.traitPile, color);
    if (myCount === 0) return false;
    return !gameState.players.some(p => p.id !== player.id && this.countColor(p.traitPile, color) >= myCount);
  }

  static calculateGenePoolBonus(gameState, player) {
    // This is called during scoring - gene pool end-game bonus
    // The player with the most genes gets +3 points
    // Calculate this player's gene count
    const myGenes = this.getPlayerGeneCount(player);

    // Find the max gene count among all players
    let maxGenes = 0;
    let playersWithMax = 0;
    for (const p of gameState.players) {
      const genes = this.getPlayerGeneCount(p);
      if (genes > maxGenes) {
        maxGenes = genes;
        playersWithMax = 1;
      } else if (genes === maxGenes) {
        playersWithMax++;
      }
    }

    // Award bonus if this player has the most genes (and it's positive)
    if (myGenes > 0 && myGenes === maxGenes && playersWithMax === 1) {
      return 3; // Sole leader gets +3 points
    }

    return 0;
  }

  static getPlayerGeneCount(player) {
    let genes = 0;
    for (const card of player.traitPile) {
      if (card.gene_pool) {
        genes += card.gene_pool_effect || 0;
      }
    }
    return genes;
  }
}

// ============== CARD EFFECTS ==============

export class CardEffects {
  static effects = {
    'Automimicry (0)': { type: 'copy_trait', needsTarget: true, targetType: 'opponent_trait', optional: true },
    'Cold Blood': { type: 'draw', count: 1 },
    'Costly Signaling': { type: 'steal_random', needsTarget: true, targetType: 'opponent' },
    'Flight': { type: 'return_trait', needsTarget: true, targetType: 'own_trait', optional: true },
    'Iridescent Scales': { type: 'swap_hands_partial', count: 1, needsTarget: true, targetType: 'opponent_and_card' },
    'Painted Shell': { type: 'view_hand', needsTarget: true, targetType: 'opponent' },
    'Scutes': { type: 'protect' },
    'Selective Memory': { type: 'search_discard', needsTarget: true, targetType: 'discard_pile', optional: true },
    'Sweat': { type: 'discard_draw', discard: 1, draw: 2, needsTarget: true, targetType: 'own_hand' },
    'Tentacles': { type: 'steal_trait', needsTarget: true, targetType: 'opponent_trait', optional: true },
    'Photosynthesis': { type: 'draw', count: 1 },
    'Propagation': { type: 'draw_if_color', color: 'Green', count: 1 },
    'Self-Replicating': { type: 'draw_each_round', count: 1, persistent: true },
    'Tiny Little Melons': { type: 'give_card', needsTarget: true, targetType: 'player_and_card', optional: true },
    'Trunk': { type: 'draw', count: 2 },
    'Clever': { type: 'view_top_deck', count: 3 },
    'Directly Register': { type: 'draw', count: 1 },
    'Impatience': { type: 'draw_discard', draw: 2, discard: 1, needsTarget: true, targetType: 'own_hand_after_draw' },
    'Inventive': { type: 'rearrange_traits', optional: true },
    'Memory': { type: 'search_discard', needsTarget: true, targetType: 'discard_pile', optional: true },
    'Nosy': { type: 'view_hand', needsTarget: true, targetType: 'opponent' },
    'Persuasive': { type: 'swap_trait', needsTarget: true, targetType: 'trait_swap', optional: true },
    'Poisonous': { type: 'discard_opponent_trait', needsTarget: true, targetType: 'opponent_trait', optional: true },
    'Selfish': { type: 'steal_random', needsTarget: true, targetType: 'opponent' },
    'Telekinetic': { type: 'move_trait', needsTarget: true, targetType: 'trait_move', optional: true },
    'Venomous': { type: 'discard_opponent_hand', count: 2, needsTarget: true, targetType: 'opponent' },
    'Bad': { type: 'discard_opponent_hand', count: 1, needsTarget: true, targetType: 'opponent' },
    'Brave (2)': { type: 'draw', count: 1 },
    'Hot Temper': { type: 'discard_draw', discard: 2, draw: 3, needsTarget: true, targetType: 'own_hand_multi', optional: true },
    'Reckless': { type: 'discard_draw_all' },
    'Territorial': { type: 'steal_trait_red', needsTarget: true, targetType: 'opponent_red_trait', optional: true },
    'Voracious': { type: 'draw', count: 2 },
    'Boredom (1)': { type: 'draw', count: 1 },
    'Doting': { type: 'give_cards', count: 2, needsTarget: true, targetType: 'player_and_cards', optional: true },
    'Introspective': { type: 'draw', count: 1 },
    'The Third Eye': { type: 'view_ages', count: 3 }
  };

  static handleAction(gameState, player, card) {
    const effect = this.effects[card.trait];
    if (!effect) return { needsInput: false };

    switch (effect.type) {
      case 'draw':
        const drawn = gameState.drawCards(effect.count);
        player.hand.push(...drawn);
        gameState.log(`${player.name} drew ${drawn.length} card(s)`);
        return { needsInput: false };

      case 'draw_if_color':
        const hasColor = player.traitPile.some(c => c.instanceId !== card.instanceId && DeckManager.isColor(c, effect.color));
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

      default:
        if (effect.needsTarget) {
          return this.prepareTargetSelection(gameState, player, card, effect);
        }
        return { needsInput: false };
    }
  }

  static prepareTargetSelection(gameState, player, card, effect) {
    switch (effect.type) {
      case 'view_hand':
      case 'steal_random':
      case 'discard_opponent_hand':
        const opponents = gameState.players.filter(p => p.id !== player.id && p.hand.length > 0);
        if (opponents.length === 0) return { needsInput: false };
        return {
          needsInput: true,
          inputType: 'select_opponent',
          options: opponents.map(p => ({ id: p.id, name: p.name, handSize: p.hand.length })),
          message: effect.type === 'view_hand' ? 'Choose opponent to view hand' :
                   effect.type === 'steal_random' ? 'Choose opponent to steal from' :
                   `Choose opponent to discard ${effect.count} card(s)`,
          effectType: effect.type,
          count: effect.count,
          optional: effect.optional
        };

      case 'steal_trait':
      case 'copy_trait':
      case 'discard_opponent_trait':
        const traitOpponents = gameState.players.filter(p =>
          p.id !== player.id && p.traitPile.length > 0 && !(p.protected && p.protectedUntil > gameState.round)
        );
        if (traitOpponents.length === 0) return { needsInput: false };
        return {
          needsInput: true,
          inputType: 'select_opponent_trait',
          options: traitOpponents.map(p => ({
            id: p.id, name: p.name,
            traits: p.traitPile.map((t, i) => ({ index: i, trait: t.trait, color: t.color, face: t.face }))
          })),
          message: effect.type === 'steal_trait' ? 'Choose trait to steal' :
                   effect.type === 'copy_trait' ? 'Choose trait to copy' : 'Choose trait to discard',
          effectType: effect.type,
          optional: effect.optional
        };

      case 'return_trait':
        if (player.traitPile.length <= 1) return { needsInput: false };
        return {
          needsInput: true,
          inputType: 'select_own_trait',
          options: player.traitPile.slice(0, -1).map((t, i) => ({ index: i, trait: t.trait, color: t.color, face: t.face })),
          message: 'Choose trait to return to hand',
          effectType: 'return_trait',
          optional: effect.optional
        };

      case 'search_discard':
        if (gameState.discardPile.length === 0) return { needsInput: false };
        return {
          needsInput: true,
          inputType: 'select_from_discard',
          options: gameState.discardPile.map((c, i) => ({ index: i, trait: c.trait, color: c.color, face: c.face })),
          message: 'Choose card from discard pile',
          effectType: 'search_discard',
          optional: effect.optional
        };

      case 'discard_draw':
      case 'draw_discard':
        if (effect.type === 'draw_discard') {
          const drawnCards = gameState.drawCards(effect.draw);
          player.hand.push(...drawnCards);
          gameState.log(`${player.name} drew ${drawnCards.length} cards`);
        }
        return {
          needsInput: true,
          inputType: 'select_own_cards',
          count: effect.discard,
          options: player.hand.map((c, i) => ({ index: i, trait: c.trait, color: c.color, face: c.face })),
          message: `Choose ${effect.discard} card(s) to discard`,
          effectType: effect.type === 'draw_discard' ? 'discard_selected' : 'discard_draw',
          drawAfter: effect.draw
        };

      default:
        return { needsInput: false };
    }
  }

  static resolveTargetSelection(gameState, player, pendingAction, data) {
    const targetPlayer = gameState.getPlayer(data.targetId);

    switch (pendingAction.effectType) {
      case 'view_hand':
        return {
          success: true,
          viewHand: targetPlayer.hand.map(c => ({ trait: c.trait, color: c.color, face: c.face })),
          message: `${targetPlayer.name}'s hand`
        };

      case 'steal_random':
        if (targetPlayer.hand.length === 0) return { success: false, error: 'No cards to steal' };
        const randomIndex = Math.floor(Math.random() * targetPlayer.hand.length);
        const stolenCard = targetPlayer.hand.splice(randomIndex, 1)[0];
        player.hand.push(stolenCard);
        gameState.log(`${player.name} stole a card from ${targetPlayer.name}`);
        return { success: true };

      case 'discard_opponent_hand':
        const count = Math.min(pendingAction.count, targetPlayer.hand.length);
        for (let i = 0; i < count; i++) {
          const idx = Math.floor(Math.random() * targetPlayer.hand.length);
          gameState.discardPile.push(targetPlayer.hand.splice(idx, 1)[0]);
        }
        gameState.log(`${targetPlayer.name} discarded ${count} card(s)`);
        return { success: true };

      case 'steal_trait':
        // Remove from target (reversing their gene pool effect)
        const stolenTrait = gameState.removeTraitFromPile(targetPlayer, data.traitIndex);
        if (stolenTrait) {
          // Add to player's pile and apply gene pool effect to new owner
          player.traitPile.push(stolenTrait);
          if (stolenTrait.gene_pool && stolenTrait.gene_pool_effect) {
            const target = stolenTrait.gene_pool_target || 'self';
            if (target === 'self') {
              player.genePool = Math.max(1, Math.min(10, player.genePool + stolenTrait.gene_pool_effect));
              gameState.log(`${player.name}'s Gene Pool is now ${player.genePool}`);
            }
          }
          gameState.log(`${player.name} stole ${stolenTrait.trait} from ${targetPlayer.name}`);
        }
        return { success: true };

      case 'copy_trait':
        const copiedTrait = { ...targetPlayer.traitPile[data.traitIndex], instanceId: `copy_${Date.now()}` };
        player.traitPile.push(copiedTrait);
        // Apply gene pool effect for the copy
        if (copiedTrait.gene_pool && copiedTrait.gene_pool_effect) {
          const target = copiedTrait.gene_pool_target || 'self';
          if (target === 'self') {
            player.genePool = Math.max(1, Math.min(10, player.genePool + copiedTrait.gene_pool_effect));
            gameState.log(`${player.name}'s Gene Pool is now ${player.genePool}`);
          }
        }
        gameState.log(`${player.name} copied ${copiedTrait.trait}`);
        return { success: true };

      case 'discard_opponent_trait':
        // Remove from target (reversing their gene pool effect)
        const discardedTrait = gameState.removeTraitFromPile(targetPlayer, data.traitIndex);
        if (discardedTrait) {
          gameState.discardPile.push(discardedTrait);
          gameState.log(`${player.name} discarded ${discardedTrait.trait} from ${targetPlayer.name}`);
        }
        return { success: true };

      default:
        return { success: true };
    }
  }

  static resolveCardSelection(gameState, player, pendingAction, data) {
    switch (pendingAction.effectType) {
      case 'discard_selected':
      case 'discard_draw':
        const indices = Array.isArray(data.indices) ? data.indices : [data.indices];
        indices.sort((a, b) => b - a);
        for (const idx of indices) {
          if (idx >= 0 && idx < player.hand.length) {
            gameState.discardPile.push(player.hand.splice(idx, 1)[0]);
          }
        }
        if (pendingAction.effectType === 'discard_draw' && pendingAction.drawAfter) {
          const drawn = gameState.drawCards(pendingAction.drawAfter);
          player.hand.push(...drawn);
          gameState.log(`${player.name} discarded ${indices.length} and drew ${drawn.length} cards`);
        } else {
          gameState.log(`${player.name} discarded ${indices.length} card(s)`);
        }
        return { success: true };

      case 'return_trait':
        // Remove from trait pile (reversing gene pool effect)
        const returnedTrait = gameState.removeTraitFromPile(player, data.index);
        if (returnedTrait) {
          player.hand.push(returnedTrait);
          gameState.log(`${player.name} returned ${returnedTrait.trait} to hand`);
        }
        return { success: true };

      case 'search_discard':
        const pickedCard = gameState.discardPile.splice(data.index, 1)[0];
        player.hand.push(pickedCard);
        gameState.log(`${player.name} took ${pickedCard.trait} from discard`);
        return { success: true };

      case 'give_cards':
        const target = gameState.getPlayer(data.targetId);
        const giveIndices = Array.isArray(data.indices) ? data.indices : [data.indices];
        giveIndices.sort((a, b) => b - a);
        const givenCards = [];
        for (const idx of giveIndices) {
          if (idx >= 0 && idx < player.hand.length) {
            givenCards.push(player.hand.splice(idx, 1)[0]);
          }
        }
        target.hand.push(...givenCards);
        gameState.log(`${player.name} gave ${givenCards.length} card(s) to ${target.name}`);
        return { success: true };

      default:
        return { success: true };
    }
  }

  static applyCatastropheEffect(gameState, player, catastrophe) {
    switch (catastrophe.action) {
      case 'discard_trait':
        if (player.traitPile.length > 0) {
          const idx = Math.floor(Math.random() * player.traitPile.length);
          const discarded = gameState.removeTraitFromPile(player, idx);
          if (discarded) {
            gameState.discardPile.push(discarded);
            gameState.log(`${player.name} lost ${discarded.trait}`);
          }
        }
        break;

      case 'discard_lowest':
        if (player.traitPile.length > 0) {
          let lowestIdx = 0;
          let lowestValue = Scoring.getBaseFaceValue(player.traitPile[0], gameState, player);
          for (let i = 1; i < player.traitPile.length; i++) {
            const val = Scoring.getBaseFaceValue(player.traitPile[i], gameState, player);
            if (val < lowestValue) { lowestValue = val; lowestIdx = i; }
          }
          const discarded = gameState.removeTraitFromPile(player, lowestIdx);
          if (discarded) {
            gameState.discardPile.push(discarded);
            gameState.log(`${player.name} lost ${discarded.trait} (lowest)`);
          }
        }
        break;

      case 'discard_colorless':
        // Find all colorless traits and remove them (in reverse order to maintain indices)
        const colorlessIndices = [];
        for (let i = 0; i < player.traitPile.length; i++) {
          if (player.traitPile[i].color === 'Colorless' && !player.traitPile[i].dominant) {
            colorlessIndices.push(i);
          }
        }
        let removedCount = 0;
        for (let i = colorlessIndices.length - 1; i >= 0; i--) {
          const discarded = gameState.removeTraitFromPile(player, colorlessIndices[i]);
          if (discarded) {
            gameState.discardPile.push(discarded);
            removedCount++;
          }
        }
        if (removedCount > 0) gameState.log(`${player.name} lost ${removedCount} Colorless trait(s)`);
        break;

      case 'discard_color':
        const colorIdx = player.traitPile.findIndex(c => DeckManager.isColor(c, catastrophe.color) && !c.dominant);
        if (colorIdx !== -1) {
          const discarded = gameState.removeTraitFromPile(player, colorIdx);
          if (discarded) {
            gameState.discardPile.push(discarded);
            gameState.log(`${player.name} lost ${discarded.trait}`);
          }
        }
        break;
    }
  }

  static handlePassCards(gameState, count) {
    const cardsToPass = gameState.players.map(p => p.hand.splice(0, Math.min(count, p.hand.length)));
    for (let i = 0; i < gameState.players.length; i++) {
      const nextIdx = (i + 1) % gameState.players.length;
      gameState.players[nextIdx].hand.push(...cardsToPass[i]);
    }
    gameState.log(`All players passed ${count} cards to the left`);
  }
}

// ============== GAME STATE ==============

export class GameState {
  constructor(gameId) {
    this.gameId = gameId;
    this.state = 'lobby';
    this.players = [];
    this.currentPlayerIndex = 0;
    this.firstPlayerIndex = 0; // Tracks first player (changes on catastrophe)
    this.round = 0;
    this.catastropheCount = 0;
    this.ageDeck = [];
    this.traitDeck = [];
    this.discardPile = [];
    this.currentAge = null;
    this.actionLog = [];
    this.pendingAction = null;
    this.turnPhase = 'waiting'; // 'waiting', 'play', 'stabilize', 'action'
    this.playersPlayedThisRound = new Set();
    this.ageEffect = null; // Current age's rule effect
  }

  addPlayer(id, name, isHost) {
    if (this.players.length >= 6) return null;
    const player = {
      id,
      name,
      isHost,
      ready: isHost,
      hand: [],
      traitPile: [],
      score: 0,
      genePool: 5, // Starting gene pool size
      connected: true,
      needsStabilize: false
    };
    this.players.push(player);
    return player;
  }

  // Count dominant traits in player's trait pile
  countDominants(player) {
    return player.traitPile.filter(c => c.dominant).length;
  }

  // Check if a trait can be removed from player's pile
  canRemoveTrait(player, card) {
    // Dominant traits cannot be removed
    if (card.dominant) return false;
    // Check for age effects that protect traits
    if (this.ageEffect === 'protect_traits') return false;
    return true;
  }

  removePlayer(id) {
    const index = this.players.findIndex(p => p.id === id);
    if (index !== -1) this.players.splice(index, 1);
  }

  getPlayer(id) {
    return this.players.find(p => p.id === id);
  }

  startGame() {
    this.state = 'playing';
    this.ageDeck = DeckManager.createAgeDeck();
    this.traitDeck = DeckManager.createTraitDeck();

    // Each player starts with their gene pool size worth of cards (5)
    for (const player of this.players) {
      player.hand = this.drawCards(player.genePool);
      player.genePool = 5;
    }

    // Random first player
    this.firstPlayerIndex = Math.floor(Math.random() * this.players.length);
    this.currentPlayerIndex = this.firstPlayerIndex;
    this.startNewRound();
    this.log(`Game started with ${this.players.length} players!`);
  }

  startNewRound() {
    this.round++;
    this.playersPlayedThisRound.clear();
    this.ageEffect = null;

    // Start from first player
    this.currentPlayerIndex = this.firstPlayerIndex;

    if (this.ageDeck.length > 0) {
      this.currentAge = this.ageDeck.shift();

      if (this.currentAge.type === 'catastrophe') {
        this.handleCatastrophe();
      } else {
        this.log(`Age: ${this.currentAge.name}`);
        this.handleAgeEffect();
      }
    }
  }

  handleAgeEffect() {
    const age = this.currentAge;

    // Apply one-time effects first
    if (age.oneTimeEffect) {
      this.applyOneTimeEffect(age.oneTimeEffect);
    }

    // Store persistent rule effects for the round
    if (age.ruleEffect) {
      this.ageEffect = age.ruleEffect;
      this.log(`Round effect: ${age.ruleEffectText || age.ruleEffect}`);
    }

    // Draw phase - all players draw based on age
    const drawCount = age.draw || 0;
    if (drawCount > 0) {
      for (const player of this.players) {
        player.hand.push(...this.drawCards(drawCount));
      }
      this.log(`All players drew ${drawCount} card${drawCount !== 1 ? 's' : ''}`);
    }

    this.turnPhase = 'play';
  }

  applyOneTimeEffect(effect) {
    switch (effect) {
      case 'draw_discard_1':
        // All players draw 1, discard 1
        for (const player of this.players) {
          player.hand.push(...this.drawCards(1));
        }
        this.log('All players drew 1 card (discard 1 when you stabilize)');
        break;
      case 'shuffle_hands':
        // Collect all hands and redistribute
        const allCards = [];
        for (const player of this.players) {
          allCards.push(...player.hand);
          player.hand = [];
        }
        const shuffled = DeckManager.shuffle(allCards);
        const perPlayer = Math.floor(shuffled.length / this.players.length);
        for (let i = 0; i < this.players.length; i++) {
          this.players[i].hand = shuffled.splice(0, perPlayer);
        }
        // Remaining cards go to first player
        if (shuffled.length > 0) {
          this.players[this.firstPlayerIndex].hand.push(...shuffled);
        }
        this.log('All hands were shuffled and redistributed!');
        break;
    }
  }

  handleCatastrophe() {
    this.catastropheCount++;
    this.log(`CATASTROPHE ${this.catastropheCount}/3: ${this.currentAge.name}!`);

    // First player rotates left on catastrophe
    this.firstPlayerIndex = (this.firstPlayerIndex + 1) % this.players.length;

    // Apply Gene Pool effect (permanent)
    if (this.currentAge.genePoolEffect) {
      const effect = this.currentAge.genePoolEffect;
      for (const player of this.players) {
        player.genePool = Math.max(1, Math.min(10, player.genePool + effect));
      }
      this.log(`All Gene Pools ${effect > 0 ? '+' : ''}${effect}`);
    }

    // Check for game end (3rd catastrophe)
    if (this.catastropheCount >= 3) {
      this.endGame();
      return;
    }

    // Apply catastrophic effect (immediate, this round only)
    const action = this.currentAge.action;
    if (action === 'pass_cards') {
      CardEffects.handlePassCards(this, this.currentAge.count);
    } else if (action) {
      for (const player of this.players) {
        CardEffects.applyCatastropheEffect(this, player, this.currentAge);
      }
    }

    this.startNewRound();
  }

  drawCards(count) {
    const cards = [];
    for (let i = 0; i < count; i++) {
      if (this.traitDeck.length === 0) {
        if (this.discardPile.length > 0) {
          this.traitDeck = DeckManager.shuffle(this.discardPile);
          this.discardPile = [];
          this.log('Discard pile reshuffled');
        } else break;
      }
      cards.push(this.traitDeck.shift());
    }
    return cards;
  }

  // Check if a card can be played based on current age rules and play conditions
  canPlayCard(player, card) {
    // Check age rule effects
    if (this.ageEffect === 'no_green' && DeckManager.isColor(card, 'Green')) {
      return { canPlay: false, reason: 'Cannot play Green traits this age' };
    }
    if (this.ageEffect === 'no_purple' && DeckManager.isColor(card, 'Purple')) {
      return { canPlay: false, reason: 'Cannot play Purple traits this age' };
    }
    if (this.ageEffect === 'no_red' && DeckManager.isColor(card, 'Red')) {
      return { canPlay: false, reason: 'Cannot play Red traits this age' };
    }
    if (this.ageEffect === 'no_blue' && DeckManager.isColor(card, 'Blue')) {
      return { canPlay: false, reason: 'Cannot play Blue traits this age' };
    }

    // Check dominant limit (max 2)
    if (card.dominant && this.countDominants(player) >= 2) {
      return { canPlay: false, reason: 'Already have 2 dominant traits' };
    }

    // Check play conditions (e.g., Heroic needs 3 Green, Delicious needs 1 Colorless)
    const conditionCheck = this.checkPlayConditions(player, card);
    if (!conditionCheck.canPlay) {
      return conditionCheck;
    }

    return { canPlay: true };
  }

  // Check card-specific play conditions
  checkPlayConditions(player, card) {
    const traitName = card.trait;

    // Heroic: Requires at least 3 Green traits in trait pile
    if (traitName === 'Heroic') {
      const greenCount = player.traitPile.filter(c => DeckManager.isColor(c, 'Green')).length;
      if (greenCount < 3) {
        return { canPlay: false, reason: 'Heroic requires 3 Green traits in your trait pile' };
      }
    }

    // Delicious: Requires at least 1 Colorless trait in trait pile
    if (traitName === 'Delicious') {
      const colorlessCount = player.traitPile.filter(c => c.color === 'Colorless').length;
      if (colorlessCount < 1) {
        return { canPlay: false, reason: 'Delicious requires 1 Colorless trait in your trait pile' };
      }
    }

    return { canPlay: true };
  }

  // Remove a trait from a player's pile and apply remove effects (reverse gene pool changes)
  removeTraitFromPile(player, cardIndex) {
    if (cardIndex < 0 || cardIndex >= player.traitPile.length) return null;

    const card = player.traitPile.splice(cardIndex, 1)[0];

    // Apply remove effects - reverse gene pool changes
    if (card.gene_pool && card.gene_pool_effect) {
      const reverseEffect = -card.gene_pool_effect;
      const target = card.gene_pool_target || 'self';

      if (target === 'self') {
        player.genePool = Math.max(1, Math.min(10, player.genePool + reverseEffect));
        this.log(`${player.name}'s Gene Pool changed to ${player.genePool} (${card.trait} removed)`);
      } else if (target === 'all') {
        for (const p of this.players) {
          p.genePool = Math.max(1, Math.min(10, p.genePool + reverseEffect));
        }
        this.log(`All Gene Pools adjusted (${card.trait} removed)`);
      } else if (target === 'opponents') {
        for (const p of this.players) {
          if (p.id !== player.id) {
            p.genePool = Math.max(1, Math.min(10, p.genePool + reverseEffect));
          }
        }
        this.log(`Opponents' Gene Pools adjusted (${card.trait} removed)`);
      }
    }

    return card;
  }

  // Check if player has any playable cards
  hasPlayableCards(player) {
    return player.hand.some(card => this.canPlayCard(player, card).canPlay);
  }

  playCard(playerId, cardIndex) {
    if (this.state !== 'playing') return { success: false, error: 'Game not in progress' };
    if (this.turnPhase !== 'play') return { success: false, error: 'Not play phase' };
    if (this.pendingAction) return { success: false, error: 'Resolve action first' };

    const player = this.getPlayer(playerId);
    if (!player) return { success: false, error: 'Player not found' };

    const currentPlayer = this.players[this.currentPlayerIndex];
    if (currentPlayer.id !== playerId) return { success: false, error: 'Not your turn' };
    if (this.playersPlayedThisRound.has(playerId)) return { success: false, error: 'Already played' };
    if (cardIndex < 0 || cardIndex >= player.hand.length) return { success: false, error: 'Invalid card' };

    const card = player.hand[cardIndex];

    // Check if card can be played
    const canPlay = this.canPlayCard(player, card);
    if (!canPlay.canPlay) {
      return { success: false, error: canPlay.reason };
    }

    // Remove card from hand and add to trait pile
    player.hand.splice(cardIndex, 1);
    player.traitPile.push(card);
    this.log(`${player.name} played ${card.trait}`);
    this.playersPlayedThisRound.add(playerId);

    // Apply gene pool effect from trait if any
    if (card.gene_pool && card.gene_pool_effect) {
      player.genePool = Math.max(1, Math.min(10, player.genePool + card.gene_pool_effect));
      this.log(`${player.name}'s Gene Pool is now ${player.genePool}`);
    }

    // Handle action effects
    if (card.action) {
      const effectResult = CardEffects.handleAction(this, player, card);
      if (effectResult.needsInput) {
        this.pendingAction = { type: 'action', card, player: playerId, ...effectResult };
        player.needsStabilize = true;
        return { success: true, needsInput: true, inputType: effectResult.inputType };
      }
    }

    // Mark player needs to stabilize and move to stabilize phase
    player.needsStabilize = true;
    this.turnPhase = 'stabilize';
    return { success: true, needsStabilize: true };
  }

  // Skip turn - used when player can't play any cards
  skipTurn(playerId) {
    const player = this.getPlayer(playerId);
    if (!player) return { success: false, error: 'Player not found' };

    const currentPlayer = this.players[this.currentPlayerIndex];
    if (currentPlayer.id !== playerId) return { success: false, error: 'Not your turn' };
    if (this.playersPlayedThisRound.has(playerId)) return { success: false, error: 'Already played' };

    // Can only skip if no playable cards or hand is empty
    if (player.hand.length > 0 && this.hasPlayableCards(player)) {
      return { success: false, error: 'You have playable cards' };
    }

    // Draw 3 cards when skipping
    player.hand.push(...this.drawCards(3));
    this.log(`${player.name} couldn't play and drew 3 cards`);
    this.playersPlayedThisRound.add(playerId);

    // Skip stabilization when skipping turn
    this.advanceTurn();
    return { success: true };
  }

  // Discard entire hand and draw 3 (optional action)
  discardAndDraw(playerId) {
    const player = this.getPlayer(playerId);
    if (!player) return { success: false, error: 'Player not found' };

    const currentPlayer = this.players[this.currentPlayerIndex];
    if (currentPlayer.id !== playerId) return { success: false, error: 'Not your turn' };
    if (this.playersPlayedThisRound.has(playerId)) return { success: false, error: 'Already played' };

    // Discard entire hand
    this.discardPile.push(...player.hand);
    const discardCount = player.hand.length;
    player.hand = [];

    // Draw 3 cards
    player.hand.push(...this.drawCards(3));
    this.log(`${player.name} discarded ${discardCount} cards and drew 3`);
    this.playersPlayedThisRound.add(playerId);

    // Skip stabilization when using this action
    this.advanceTurn();
    return { success: true };
  }

  // Stabilize - draw or discard to match gene pool
  stabilize(playerId, discardIndices = []) {
    const player = this.getPlayer(playerId);
    if (!player) return { success: false, error: 'Player not found' };

    const currentPlayer = this.players[this.currentPlayerIndex];
    if (currentPlayer.id !== playerId) return { success: false, error: 'Not your turn' };
    if (this.turnPhase !== 'stabilize') return { success: false, error: 'Not stabilize phase' };

    const handSize = player.hand.length;
    const targetSize = player.genePool;

    if (handSize < targetSize) {
      // Draw up to gene pool
      const drawCount = targetSize - handSize;
      player.hand.push(...this.drawCards(drawCount));
      this.log(`${player.name} stabilized (drew ${drawCount})`);
    } else if (handSize > targetSize) {
      // Must discard down to gene pool
      const discardCount = handSize - targetSize;
      if (discardIndices.length !== discardCount) {
        return {
          success: false,
          error: `Must discard ${discardCount} card(s)`,
          needsDiscard: true,
          discardCount
        };
      }
      // Discard selected cards (sort indices descending to remove correctly)
      discardIndices.sort((a, b) => b - a);
      for (const idx of discardIndices) {
        if (idx >= 0 && idx < player.hand.length) {
          this.discardPile.push(player.hand.splice(idx, 1)[0]);
        }
      }
      this.log(`${player.name} stabilized (discarded ${discardCount})`);
    } else {
      this.log(`${player.name} stabilized`);
    }

    player.needsStabilize = false;
    this.advanceTurn();
    return { success: true };
  }

  advanceTurn() {
    this.turnPhase = 'play';

    if (this.playersPlayedThisRound.size >= this.players.length) {
      this.startNewRound();
      return;
    }
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
  }

  handleTargetSelection(playerId, data) {
    if (!this.pendingAction || this.pendingAction.player !== playerId) {
      return { success: false, error: 'No pending action' };
    }

    const player = this.getPlayer(playerId);
    const result = CardEffects.resolveTargetSelection(this, player, this.pendingAction, data);

    if (result.success && !result.viewHand) {
      this.pendingAction = null;
      // Move to stabilize phase instead of advancing turn directly
      this.turnPhase = 'stabilize';
    }

    return result;
  }

  handleCardSelection(playerId, data) {
    if (!this.pendingAction || this.pendingAction.player !== playerId) {
      return { success: false, error: 'No pending action' };
    }

    const player = this.getPlayer(playerId);
    const result = CardEffects.resolveCardSelection(this, player, this.pendingAction, data);

    if (result.success) {
      this.pendingAction = null;
      // Move to stabilize phase instead of advancing turn directly
      this.turnPhase = 'stabilize';
    }

    return result;
  }

  skipAction(playerId) {
    if (!this.pendingAction || this.pendingAction.player !== playerId) {
      return { success: false, error: 'No pending action' };
    }
    if (!this.pendingAction.optional) {
      return { success: false, error: 'Action not optional' };
    }

    this.log(`${this.getPlayer(playerId).name} skipped action`);
    this.pendingAction = null;
    // Move to stabilize phase instead of advancing turn directly
    this.turnPhase = 'stabilize';
    return { success: true };
  }

  endGame() {
    this.state = 'finished';
    this.turnPhase = 'finished';

    // Apply final catastrophe's gene pool effect
    if (this.currentAge.genePoolEffect) {
      const effect = this.currentAge.genePoolEffect;
      for (const player of this.players) {
        player.genePool = Math.max(1, Math.min(10, player.genePool + effect));
      }
    }

    // Apply World's End effects from traits (in turn order starting from first player)
    this.log("Resolving World's End effects...");
    for (let i = 0; i < this.players.length; i++) {
      const playerIdx = (this.firstPlayerIndex + i) % this.players.length;
      const player = this.players[playerIdx];

      for (const card of player.traitPile) {
        if (card.worlds_end && card.worlds_end_task) {
          this.applyWorldsEndEffect(player, card);
        }
      }
    }

    // Apply final catastrophe's World's End effect
    if (this.currentAge.worldsEndEffect) {
      this.log(`Final Catastrophe: ${this.currentAge.worldsEndText || 'Special effect'}`);
      this.applyFinalCatastropheEffect(this.currentAge);
    }

    // Calculate final scores
    for (const player of this.players) {
      player.score = Scoring.calculateScore(this, player);
    }

    const winner = [...this.players].sort((a, b) => b.score - a.score)[0];
    this.log(`GAME OVER! Winner: ${winner.name} with ${winner.score} points!`);
  }

  applyWorldsEndEffect(player, card) {
    const effect = card.worlds_end_task;
    switch (effect) {
      case 'draw_2':
        player.hand.push(...this.drawCards(2));
        this.log(`${player.name}: ${card.trait} - Drew 2 cards`);
        break;
      case 'discard_1':
        if (player.hand.length > 0) {
          this.discardPile.push(player.hand.pop());
          this.log(`${player.name}: ${card.trait} - Discarded 1 card`);
        }
        break;
      case 'gene_pool_plus_1':
        player.genePool = Math.min(10, player.genePool + 1);
        this.log(`${player.name}: ${card.trait} - Gene Pool +1`);
        break;
      case 'gene_pool_minus_1':
        player.genePool = Math.max(1, player.genePool - 1);
        this.log(`${player.name}: ${card.trait} - Gene Pool -1`);
        break;
    }
  }

  applyFinalCatastropheEffect(catastrophe) {
    switch (catastrophe.worldsEndEffect) {
      case 'most_cards_loses_5':
        // Player with most cards in hand loses 5 points
        let maxCards = 0;
        let maxPlayer = null;
        for (const p of this.players) {
          if (p.hand.length > maxCards) {
            maxCards = p.hand.length;
            maxPlayer = p;
          }
        }
        if (maxPlayer) {
          maxPlayer.score = (maxPlayer.score || 0) - 5;
          this.log(`${maxPlayer.name} loses 5 points (most cards in hand)`);
        }
        break;
      case 'discard_all_colorless':
        for (const player of this.players) {
          // Find all colorless non-dominant traits
          const colorlessIndices = [];
          for (let i = 0; i < player.traitPile.length; i++) {
            if (player.traitPile[i].color === 'Colorless' && !player.traitPile[i].dominant) {
              colorlessIndices.push(i);
            }
          }
          // Remove in reverse order to maintain indices
          let removedCount = 0;
          for (let i = colorlessIndices.length - 1; i >= 0; i--) {
            const discarded = this.removeTraitFromPile(player, colorlessIndices[i]);
            if (discarded) {
              this.discardPile.push(discarded);
              removedCount++;
            }
          }
          if (removedCount > 0) {
            this.log(`${player.name} lost ${removedCount} Colorless traits`);
          }
        }
        break;
    }
  }

  log(message) {
    this.actionLog.push({ time: Date.now(), message });
    if (this.actionLog.length > 50) this.actionLog.shift();
  }

  getFullState() {
    return {
      gameId: this.gameId,
      state: this.state,
      round: this.round,
      catastropheCount: this.catastropheCount,
      currentAge: this.currentAge,
      turnPhase: this.turnPhase,
      currentPlayerIndex: this.currentPlayerIndex,
      firstPlayerIndex: this.firstPlayerIndex,
      ageEffect: this.ageEffect,
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        ready: p.ready,
        hand: p.hand,
        traitPile: p.traitPile,
        score: Scoring.calculateScore(this, p),
        genePool: p.genePool, // Player's target hand size
        geneCount: Scoring.getPlayerGeneCount(p), // Genes from gene pool cards
        hasPlayedThisRound: this.playersPlayedThisRound.has(p.id),
        needsStabilize: p.needsStabilize || false
      })),
      pendingAction: this.pendingAction,
      deckSize: this.traitDeck.length,
      discardSize: this.discardPile.length,
      agesRemaining: this.ageDeck.length,
      actionLog: this.actionLog.slice(-10)
    };
  }

  getStateForPlayer(playerId) {
    const fullState = this.getFullState();
    const player = this.getPlayer(playerId);

    // Check if player can play any cards
    const canPlayAny = player ? this.hasPlayableCards(player) : false;

    // Calculate stabilization info
    const handSize = player ? player.hand.length : 0;
    const genePoolSize = player ? player.genePool : 5;
    const needsDiscard = handSize > genePoolSize ? handSize - genePoolSize : 0;
    const willDraw = handSize < genePoolSize ? genePoolSize - handSize : 0;

    return {
      ...fullState,
      myHand: player ? player.hand : [],
      myTraitPile: player ? player.traitPile : [],
      myScore: player ? Scoring.calculateScore(this, player) : 0,
      myGenePool: player ? player.genePool : 5, // Target hand size
      myGeneCount: player ? Scoring.getPlayerGeneCount(player) : 0, // Genes from cards
      isMyTurn: this.players[this.currentPlayerIndex]?.id === playerId,
      currentPlayerId: this.players[this.currentPlayerIndex]?.id,
      canPlayAny,
      needsDiscard,
      willDraw,
      players: fullState.players.map(p => ({
        ...p,
        hand: undefined, // Hide other players' hands
        handSize: p.hand.length,
        isCurrentPlayer: this.players[this.currentPlayerIndex]?.id === p.id
      })),
      pendingAction: this.pendingAction?.player === playerId ? {
        type: this.pendingAction.type,
        inputType: this.pendingAction.inputType,
        options: this.pendingAction.options,
        message: this.pendingAction.message,
        optional: this.pendingAction.optional,
        count: this.pendingAction.count
      } : null
    };
  }

  // Serialize for network transfer
  serialize() {
    return JSON.stringify({
      gameId: this.gameId,
      state: this.state,
      players: this.players,
      currentPlayerIndex: this.currentPlayerIndex,
      firstPlayerIndex: this.firstPlayerIndex,
      round: this.round,
      catastropheCount: this.catastropheCount,
      ageDeck: this.ageDeck,
      traitDeck: this.traitDeck,
      discardPile: this.discardPile,
      currentAge: this.currentAge,
      actionLog: this.actionLog,
      pendingAction: this.pendingAction,
      turnPhase: this.turnPhase,
      ageEffect: this.ageEffect,
      playersPlayedThisRound: [...this.playersPlayedThisRound]
    });
  }

  // Deserialize from network
  static deserialize(data) {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    const game = new GameState(parsed.gameId);
    Object.assign(game, parsed);
    game.playersPlayedThisRound = new Set(parsed.playersPlayedThisRound || []);
    game.firstPlayerIndex = parsed.firstPlayerIndex || 0;
    game.ageEffect = parsed.ageEffect || null;
    return game;
  }
}
