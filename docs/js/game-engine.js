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
    let bonus = 0;
    for (const card of player.traitPile) {
      if (!card.gene_pool) continue;
      const effect = card.gene_pool_effect || 0;
      bonus += effect;
    }
    return bonus;
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
        const stolenTrait = targetPlayer.traitPile.splice(data.traitIndex, 1)[0];
        player.traitPile.push(stolenTrait);
        gameState.log(`${player.name} stole ${stolenTrait.trait} from ${targetPlayer.name}`);
        return { success: true };

      case 'copy_trait':
        const copiedTrait = { ...targetPlayer.traitPile[data.traitIndex], instanceId: `copy_${Date.now()}` };
        player.traitPile.push(copiedTrait);
        gameState.log(`${player.name} copied ${copiedTrait.trait}`);
        return { success: true };

      case 'discard_opponent_trait':
        const discardedTrait = targetPlayer.traitPile.splice(data.traitIndex, 1)[0];
        gameState.discardPile.push(discardedTrait);
        gameState.log(`${player.name} discarded ${discardedTrait.trait} from ${targetPlayer.name}`);
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
        const returnedTrait = player.traitPile.splice(data.index, 1)[0];
        player.hand.push(returnedTrait);
        gameState.log(`${player.name} returned ${returnedTrait.trait} to hand`);
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
          const discarded = player.traitPile.splice(idx, 1)[0];
          gameState.discardPile.push(discarded);
          gameState.log(`${player.name} lost ${discarded.trait}`);
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
          const discarded = player.traitPile.splice(lowestIdx, 1)[0];
          gameState.discardPile.push(discarded);
          gameState.log(`${player.name} lost ${discarded.trait} (lowest)`);
        }
        break;

      case 'discard_colorless':
        const colorless = player.traitPile.filter(c => c.color === 'Colorless');
        for (const card of colorless) {
          const idx = player.traitPile.indexOf(card);
          if (idx !== -1) {
            player.traitPile.splice(idx, 1);
            gameState.discardPile.push(card);
          }
        }
        if (colorless.length > 0) gameState.log(`${player.name} lost ${colorless.length} Colorless trait(s)`);
        break;

      case 'discard_color':
        const colorCards = player.traitPile.filter(c => DeckManager.isColor(c, catastrophe.color));
        if (colorCards.length > 0) {
          const idx = player.traitPile.indexOf(colorCards[0]);
          if (idx !== -1) {
            player.traitPile.splice(idx, 1);
            gameState.discardPile.push(colorCards[0]);
            gameState.log(`${player.name} lost ${colorCards[0].trait}`);
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
    this.round = 0;
    this.catastropheCount = 0;
    this.ageDeck = [];
    this.traitDeck = [];
    this.discardPile = [];
    this.currentAge = null;
    this.actionLog = [];
    this.pendingAction = null;
    this.turnPhase = 'waiting';
    this.playersPlayedThisRound = new Set();
  }

  addPlayer(id, name, isHost) {
    if (this.players.length >= 6) return null;
    const player = { id, name, isHost, ready: isHost, hand: [], traitPile: [], score: 0, connected: true };
    this.players.push(player);
    return player;
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

    for (const player of this.players) {
      player.hand = this.drawCards(7);
    }

    this.currentPlayerIndex = Math.floor(Math.random() * this.players.length);
    this.startNewRound();
    this.log(`Game started with ${this.players.length} players!`);
  }

  startNewRound() {
    this.round++;
    this.playersPlayedThisRound.clear();

    if (this.ageDeck.length > 0) {
      this.currentAge = this.ageDeck.shift();

      if (this.currentAge.type === 'catastrophe') {
        this.handleCatastrophe();
      } else {
        this.log(`${this.currentAge.name} - Draw ${this.currentAge.draw} cards`);
        this.handleDrawPhase();
      }
    }
  }

  handleDrawPhase() {
    const drawCount = this.currentAge.draw || 2;
    for (const player of this.players) {
      player.hand.push(...this.drawCards(drawCount));
    }
    this.log(`All players drew ${drawCount} card${drawCount !== 1 ? 's' : ''}`);
    this.turnPhase = 'play';
  }

  handleCatastrophe() {
    this.catastropheCount++;
    this.log(`CATASTROPHE ${this.catastropheCount}/3: ${this.currentAge.name}!`);

    if (this.catastropheCount >= 3) {
      this.endGame();
      return;
    }

    const action = this.currentAge.action;
    if (action === 'pass_cards') {
      CardEffects.handlePassCards(this, this.currentAge.count);
    } else {
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

    const card = player.hand.splice(cardIndex, 1)[0];
    player.traitPile.push(card);
    this.log(`${player.name} played ${card.trait}`);
    this.playersPlayedThisRound.add(playerId);

    if (card.action) {
      const effectResult = CardEffects.handleAction(this, player, card);
      if (effectResult.needsInput) {
        this.pendingAction = { type: 'action', card, player: playerId, ...effectResult };
        return { success: true, needsInput: true, inputType: effectResult.inputType };
      }
    }

    this.advanceTurn();
    return { success: true };
  }

  advanceTurn() {
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
      this.advanceTurn();
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
      this.advanceTurn();
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
    this.advanceTurn();
    return { success: true };
  }

  endGame() {
    this.state = 'finished';
    this.turnPhase = 'finished';

    for (const player of this.players) {
      player.score = Scoring.calculateScore(this, player);
    }

    const winner = [...this.players].sort((a, b) => b.score - a.score)[0];
    this.log(`GAME OVER! Winner: ${winner.name} with ${winner.score} points!`);
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
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        ready: p.ready,
        hand: p.hand,
        traitPile: p.traitPile,
        score: Scoring.calculateScore(this, p),
        hasPlayedThisRound: this.playersPlayedThisRound.has(p.id)
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

    return {
      ...fullState,
      myHand: player ? player.hand : [],
      myTraitPile: player ? player.traitPile : [],
      myScore: player ? Scoring.calculateScore(this, player) : 0,
      isMyTurn: this.players[this.currentPlayerIndex]?.id === playerId,
      currentPlayerId: this.players[this.currentPlayerIndex]?.id,
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
      round: this.round,
      catastropheCount: this.catastropheCount,
      ageDeck: this.ageDeck,
      traitDeck: this.traitDeck,
      discardPile: this.discardPile,
      currentAge: this.currentAge,
      actionLog: this.actionLog,
      pendingAction: this.pendingAction,
      turnPhase: this.turnPhase,
      playersPlayedThisRound: [...this.playersPlayedThisRound]
    });
  }

  // Deserialize from network
  static deserialize(data) {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    const game = new GameState(parsed.gameId);
    Object.assign(game, parsed);
    game.playersPlayedThisRound = new Set(parsed.playersPlayedThisRound || []);
    return game;
  }
}
