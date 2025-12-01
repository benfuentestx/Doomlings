// Doomlings Game Engine - Browser Version
// Combines DeckManager, CardEffects, Scoring, and GameState

import { traits, getTraitCopies, birthOfLife, ageCards, catastrophes } from './cards-data.js';

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

    // Per rulebook: 3 piles with 3 ages each, plus 1 catastrophe per pile
    const pile1 = ages.slice(0, 3);
    const pile2 = ages.slice(3, 6);
    const pile3 = ages.slice(6, 9);

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
    for (const trait of traits) {
      const copies = getTraitCopies(trait);
      for (let i = 0; i < copies; i++) {
        deck.push({
          ...trait,
          instanceId: `${trait.name}_${i}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
    const face = card.faceValue;
    if (typeof face === 'number') return face;
    // Variable face value (null) - calculated from bonus points
    if (face === null || face === undefined) return 0;
    return 0;
  }

  // Check if a card has an action effect
  static hasAction(card) {
    return card.actions && card.actions.length > 0;
  }

  // Check if a card is dominant
  static isDominant(card) {
    return card.isDominant === true;
  }
}

// ============== SCORING ==============

export class Scoring {
  static calculateScore(gameState, player) {
    let total = 0;
    for (const card of player.traitPile) {
      // Add base face value
      let cardScore = this.getBaseFaceValue(card, gameState, player);

      // Add bonus points if trait has them
      if (card.bonusPoints) {
        cardScore += this.calculateBonusPoints(card, gameState, player);
      }
      total += cardScore;
    }

    // Add gene pool leader bonus (+3 for most genes)
    total += this.calculateGenePoolLeaderBonus(gameState, player);

    return total;
  }

  static getBaseFaceValue(card, gameState, player) {
    const face = card.faceValue;
    if (typeof face === 'number') return face;
    // Variable/null face value - the bonus points ARE the value
    return 0;
  }

  static calculateBonusPoints(card, gameState, player) {
    const bonus = card.bonusPoints;
    if (!bonus) return 0;

    const { name, params } = bonus;

    switch (name) {
      // Kidney bonus: +1 for each Kidney trait in your trait pile
      case 'bonus_kidney':
        return player.traitPile.filter(c => c.name && c.name.includes('Kidney')).length;

      // Swarm bonus: +1 for each Swarm trait across all players
      case 'bonus_swarm':
        return this.countAllByNamePattern(gameState, 'Swarm');

      // Color bonus: +value for each trait of a specific color
      case 'bonus_for_every_color':
        return this.countColor(player.traitPile, params.color) * (params.value || 1);

      // Gene Pool bonus: points equal to gene pool size
      case 'bonus_gene_pool':
        return player.genePool;

      // Max Gene Pool bonus: points equal to highest gene pool
      case 'bonus_max_gene_pool':
        return Math.max(...gameState.players.map(p => p.genePool));

      // Cards in hand bonus
      case 'bonus_number_cards_hand':
        if (params.card_type === 'effect') {
          return this.countCardsWithEffects(player.hand);
        }
        return player.hand.length;

      // All colors bonus: +value if player has all 4 colors
      case 'bonus_all_colors_trait_pile':
        return this.hasAllColors(player.traitPile) ? (params.value || 0) : 0;

      // Colors count bonus: +value for each unique color
      case 'bonus_number_colors':
        const location = params.location === 'hand' ? player.hand : player.traitPile;
        return this.countUniqueColors(location) * (params.value || 1);

      // Dominant in hand bonus
      case 'bonus_dominant_hand':
        return this.countDominant(player.hand) * (params.value || 1);

      // Expansion bonus across all trait piles
      case 'bonus_expansion_all_trait_piles':
        return this.countAllByExpansion(gameState, params.expansion) * (params.value || 1);

      // Face value bonus: +value for each trait with specific face value
      case 'bonus_face_value':
        return this.countFaceValue(player.traitPile, params.face_value, gameState, player) * (params.value || 1);

      // Green pairs from opponents
      case 'bonus_color_pair_opponents':
        return this.countColorPairsOthers(gameState, player, params.color) * (params.value || 1);

      // Discard pile expansion count
      case 'bonus_discard_expansion':
        return this.countDiscardByExpansion(gameState, params.expansion) * (params.value || 1);

      // Discard pile dominant count
      case 'bonus_discard_dominant':
        return this.countDominant(gameState.discardPile) * (params.value || 1);

      // Every N negative cards in discard
      case 'bonus_every_negative_discard':
        return Math.floor(this.countNegative(gameState.discardPile, gameState, player) / (params.every || 1)) * (params.value || 1);

      // Most traits bonus
      case 'bonus_more_traits':
        return this.hasMostTraits(gameState, player) ? (params.value || 0) : 0;

      // Number of traits (can be negative like Tiny)
      case 'bonus_number_traits':
        return player.traitPile.length * (params.value || 1);

      // Negative face value bonus
      case 'bonus_negative_face_value':
        return this.countNegative(player.traitPile, gameState, player) * (params.value || 1);

      // Lowest color count bonus (need 2+ colors)
      case 'bonus_lowest_color':
        const lowest = this.getLowestColorCount(player.traitPile);
        return lowest > 0 ? lowest * (params.value || 1) : 0;

      // Color pairs bonus
      case 'bonus_color_pair':
        return this.countColorPairs(player.traitPile) * (params.value || 1);

      // Catastrophe count bonus
      case 'bonus_catastrophe_count':
        return gameState.catastropheCount * (params.value || 1);

      // Chosen color bonus (for Sentience - color chosen at World's End)
      case 'bonus_chosen_color': {
        const chosenColor = player.sentienceChosenColor || 'Red'; // Default to Red if not set
        return this.countColor(player.traitPile, chosenColor) * (params.value || 1);
      }

      default:
        return 0;
    }
  }

  static countColor(cards, color) {
    return cards.filter(c => DeckManager.isColor(c, color)).length;
  }

  static countNegative(cards, gameState, player) {
    return cards.filter(c => this.getBaseFaceValue(c, gameState, player) < 0).length;
  }

  static countDominant(cards) {
    return cards.filter(c => DeckManager.isDominant(c)).length;
  }

  static countUniqueColors(cards) {
    const colors = new Set();
    for (const card of cards) {
      DeckManager.getColors(card).forEach(c => colors.add(c));
    }
    colors.delete('Colorless');
    return colors.size;
  }

  static hasAllColors(cards) {
    const colors = new Set();
    for (const card of cards) {
      DeckManager.getColors(card).forEach(c => colors.add(c));
    }
    return colors.has('Red') && colors.has('Blue') && colors.has('Green') && colors.has('Purple');
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

  static countColorPairsOthers(gameState, player, color) {
    let count = 0;
    for (const p of gameState.players) {
      if (p.id !== player.id) count += this.countColor(p.traitPile, color);
    }
    return Math.floor(count / 2);
  }

  static countAllByNamePattern(gameState, pattern) {
    let count = 0;
    for (const p of gameState.players) {
      count += p.traitPile.filter(c => c.name && c.name.includes(pattern)).length;
    }
    return count;
  }

  static countAllByExpansion(gameState, expansion) {
    let count = 0;
    for (const p of gameState.players) {
      count += p.traitPile.filter(c => c.expansion === expansion).length;
    }
    return count;
  }

  static countDiscardByExpansion(gameState, expansion) {
    return gameState.discardPile.filter(c => c.expansion === expansion).length;
  }

  static countCardsWithEffects(cards) {
    return cards.filter(c => DeckManager.hasAction(c) || DeckManager.isDominant(c) || c.bonusPoints || c.effects).length;
  }

  static getLowestColorCount(cards) {
    const colorCounts = { Red: 0, Blue: 0, Green: 0, Purple: 0 };
    for (const card of cards) {
      for (const color of DeckManager.getColors(card)) {
        if (colorCounts[color] !== undefined) colorCounts[color]++;
      }
    }
    // Only count colors that exist
    const existingCounts = Object.values(colorCounts).filter(c => c > 0);
    if (existingCounts.length < 2) return 0; // Need at least 2 colors
    return Math.min(...existingCounts);
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

  static calculateGenePoolLeaderBonus(gameState, player) {
    // Gene pool end-game bonus: player with the most genes gets +3 points
    const myGenePool = player.genePool;

    // Find the max gene pool among all players
    let maxGenePool = 0;
    let playersWithMax = 0;
    for (const p of gameState.players) {
      if (p.genePool > maxGenePool) {
        maxGenePool = p.genePool;
        playersWithMax = 1;
      } else if (p.genePool === maxGenePool) {
        playersWithMax++;
      }
    }

    // Award bonus if this player has the highest gene pool (sole leader only)
    if (myGenePool > 0 && myGenePool === maxGenePool && playersWithMax === 1) {
      return 3;
    }

    return 0;
  }
}

// ============== CARD EFFECTS ==============

export class CardEffects {
  // Process all actions from a card's actions array
  static handleAction(gameState, player, card) {
    if (!card.actions || card.actions.length === 0) {
      return { needsInput: false };
    }

    // Process actions sequentially - if one needs input, queue the rest
    return this.processActions(gameState, player, card, card.actions, 0);
  }

  // Process actions starting from a specific index
  static processActions(gameState, player, card, actions, startIndex) {
    for (let i = startIndex; i < actions.length; i++) {
      const action = actions[i];
      const result = this.executeAction(gameState, player, card, action);

      if (result.needsInput) {
        // Store remaining actions to process after input
        result.remainingActions = actions.slice(i + 1);
        result.currentCard = card;
        return result;
      }
    }
    return { needsInput: false };
  }

  // Execute a single action
  static executeAction(gameState, player, card, action) {
    const { name, params } = action;
    const affected = params?.affected_players || 'self';

    switch (name) {
      // Draw cards
      case 'draw_cards': {
        const count = params.value || 1;
        if (affected === 'self') {
          const drawn = gameState.drawCards(count);
          player.hand.push(...drawn);
          gameState.log(`${player.name} drew ${drawn.length} card(s)`);
        } else if (affected === 'all') {
          for (const p of gameState.players) {
            const drawn = gameState.drawCards(count);
            p.hand.push(...drawn);
          }
          gameState.log(`All players drew ${count} card(s)`);
        } else if (affected === 'opponents') {
          for (const p of gameState.players) {
            if (p.id !== player.id) {
              const drawn = gameState.drawCards(count);
              p.hand.push(...drawn);
            }
          }
          gameState.log(`All opponents drew ${count} card(s)`);
        }
        return { needsInput: false };
      }

      // Discard cards from hand
      case 'discard_card_from_hand': {
        const count = params.num_cards || 1;
        if (params.random_discard) {
          // Random discard
          const targets = affected === 'self' ? [player] :
                         affected === 'all' ? gameState.players :
                         gameState.players.filter(p => p.id !== player.id);
          for (const p of targets) {
            for (let j = 0; j < count && p.hand.length > 0; j++) {
              const idx = Math.floor(Math.random() * p.hand.length);
              gameState.discardPile.push(p.hand.splice(idx, 1)[0]);
            }
          }
          gameState.log(`Random discard: ${count} card(s)`);
          return { needsInput: false };
        }
        // Player chooses what to discard
        return {
          needsInput: true,
          inputType: 'select_own_cards',
          count,
          options: player.hand.map((c, i) => ({ index: i, name: c.name, color: c.color, faceValue: c.faceValue })),
          message: `Choose ${count} card(s) to discard`,
          effectType: 'discard_selected',
          affected
        };
      }

      // Discard cards from trait pile
      case 'discard_card_from_trait_pile': {
        const count = params.num_cards || 1;
        const color = params.color;
        if (affected === 'self') {
          return {
            needsInput: true,
            inputType: 'select_own_trait',
            count,
            color,
            options: player.traitPile.filter(t => !DeckManager.isDominant(t) && (!color || DeckManager.isColor(t, color)))
              .map((t, i) => ({ index: player.traitPile.indexOf(t), name: t.name, color: t.color, faceValue: t.faceValue })),
            message: `Choose ${count} trait(s) to discard`,
            effectType: 'discard_own_trait'
          };
        } else {
          // Target opponent's traits
          const opponents = gameState.players.filter(p =>
            p.id !== player.id && p.traitPile.some(t => !DeckManager.isDominant(t) && (!color || DeckManager.isColor(t, color)))
          );
          if (opponents.length === 0) return { needsInput: false };
          return {
            needsInput: true,
            inputType: 'select_opponent_trait',
            count,
            color,
            options: opponents.map(p => ({
              id: p.id, name: p.name,
              traits: p.traitPile.filter(t => !DeckManager.isDominant(t) && (!color || DeckManager.isColor(t, color)))
                .map((t, i) => ({ index: p.traitPile.indexOf(t), name: t.name, color: t.color, faceValue: t.faceValue }))
            })),
            message: `Choose opponent's trait to discard${color ? ` (${color})` : ''}`,
            effectType: 'discard_opponent_trait'
          };
        }
      }

      // Play another trait
      case 'play_another_trait': {
        const numTraits = params.num_traits || 1;
        player.extraPlays = (player.extraPlays || 0) + numTraits;
        player.ignoreActionsOnExtraPlays = params.ignore_actions || false;
        gameState.log(`${player.name} can play ${numTraits} more trait(s)`);
        return { needsInput: false };
      }

      // View top of deck
      case 'view_top_deck': {
        const count = params.value || 3;
        return {
          needsInput: true,
          inputType: 'view_cards',
          cards: gameState.traitDeck.slice(0, count),
          message: `Top ${count} cards of the deck`,
          optional: true
        };
      }

      // View age deck
      case 'view_age_deck': {
        const count = params.value || 3;
        return {
          needsInput: true,
          inputType: 'view_cards',
          cards: gameState.ageDeck.slice(0, count),
          message: count === 1 ? 'Next Age' : `Top ${count} Age cards`,
          optional: true
        };
      }

      // View opponent hand
      case 'view_opponent_hand': {
        const opponents = gameState.players.filter(p => p.id !== player.id);
        if (opponents.length === 0) return { needsInput: false };
        return {
          needsInput: true,
          inputType: 'select_opponent',
          options: opponents.map(p => ({ id: p.id, name: p.name, handSize: p.hand.length })),
          message: 'Choose opponent to view hand',
          effectType: 'view_hand',
          optional: true
        };
      }

      // Search discard pile
      case 'search_discard': {
        if (gameState.discardPile.length === 0) return { needsInput: false };
        return {
          needsInput: true,
          inputType: 'select_from_discard',
          options: gameState.discardPile.map((c, i) => ({ index: i, name: c.name, color: c.color, faceValue: c.faceValue })),
          message: 'Choose card from discard pile',
          effectType: 'search_discard',
          optional: true
        };
      }

      // Search discard and play with action (Selective Memory)
      case 'search_discard_and_play': {
        if (gameState.discardPile.length === 0) return { needsInput: false };
        return {
          needsInput: true,
          inputType: 'select_from_discard',
          options: gameState.discardPile.map((c, i) => ({ index: i, name: c.name, color: c.color, faceValue: c.faceValue })),
          message: 'Choose card from discard pile to play',
          effectType: 'search_discard_and_play',
          optional: false
        };
      }

      // Search discard and play ignoring action (Self-Replicating)
      case 'search_discard_ignore_action': {
        if (gameState.discardPile.length === 0) return { needsInput: false };
        return {
          needsInput: true,
          inputType: 'select_from_discard',
          options: gameState.discardPile.map((c, i) => ({ index: i, name: c.name, color: c.color, faceValue: c.faceValue })),
          message: 'Choose card from discard pile to play (ignore action)',
          effectType: 'search_discard_ignore_action',
          optional: false
        };
      }

      // Steal trait from opponent
      case 'steal_trait': {
        const colorFilter = action.params.color;
        const faceValueFilter = action.params.face_value;
        const opponents = gameState.players.filter(p =>
          p.id !== player.id &&
          p.traitPile.some(t =>
            !DeckManager.isDominant(t) &&
            (!colorFilter || DeckManager.isColor(t, colorFilter)) &&
            (faceValueFilter === undefined || t.faceValue === faceValueFilter)
          ) &&
          !(p.protected && p.protectedUntil > gameState.round)
        );
        if (opponents.length === 0) return { needsInput: false };
        return {
          needsInput: true,
          inputType: 'select_opponent_trait',
          options: opponents.map(p => ({
            id: p.id, name: p.name,
            traits: p.traitPile
              .filter(t =>
                !DeckManager.isDominant(t) &&
                (!colorFilter || DeckManager.isColor(t, colorFilter)) &&
                (faceValueFilter === undefined || t.faceValue === faceValueFilter)
              )
              .map((t, i) => ({ index: p.traitPile.indexOf(t), name: t.name, color: t.color, faceValue: t.faceValue }))
          })),
          message: colorFilter ? `Choose ${colorFilter} trait to steal` : 'Choose trait to steal',
          effectType: 'steal_trait',
          optional: true
        };
      }

      // Steal trait and stop its action (for Parasitic card)
      // Note: Full implementation requires reactive play mechanics
      // For now, this works like regular steal_trait
      case 'steal_trait_and_stop_action': {
        const opponents = gameState.players.filter(p =>
          p.id !== player.id && p.traitPile.some(t => !DeckManager.isDominant(t)) &&
          !(p.protected && p.protectedUntil > gameState.round)
        );
        if (opponents.length === 0) return { needsInput: false };
        return {
          needsInput: true,
          inputType: 'select_opponent_trait',
          options: opponents.map(p => ({
            id: p.id, name: p.name,
            traits: p.traitPile.filter(t => !DeckManager.isDominant(t))
              .map((t, i) => ({ index: p.traitPile.indexOf(t), name: t.name, color: t.color, faceValue: t.faceValue }))
          })),
          message: 'Choose trait to steal (and stop its action)',
          effectType: 'steal_trait', // Reuse steal_trait handler
          optional: true
        };
      }

      // Steal trait and play its action (for Vampirism card)
      case 'steal_trait_and_play_action': {
        const opponents = gameState.players.filter(p =>
          p.id !== player.id && p.traitPile.some(t => !DeckManager.isDominant(t))
        );
        if (opponents.length === 0) return { needsInput: false };
        return {
          needsInput: true,
          inputType: 'select_opponent_trait',
          options: opponents.map(p => ({
            id: p.id, name: p.name,
            traits: p.traitPile.filter(t => !DeckManager.isDominant(t))
              .map((t, i) => ({ index: p.traitPile.indexOf(t), name: t.name, color: t.color, faceValue: t.faceValue, actions: t.actions }))
          })),
          message: 'Choose trait to steal (will play its action)',
          effectType: 'steal_trait_play_action',
          optional: true
        };
      }

      // Steal random card from opponent's hand
      case 'steal_random_card': {
        const opponents = gameState.players.filter(p => p.id !== player.id && p.hand.length > 0);
        if (opponents.length === 0) return { needsInput: false };
        return {
          needsInput: true,
          inputType: 'select_opponent',
          options: opponents.map(p => ({ id: p.id, name: p.name, handSize: p.hand.length })),
          message: 'Choose opponent to steal from',
          effectType: 'steal_random',
          optional: true
        };
      }

      // Return trait to hand
      case 'return_trait_to_hand': {
        const ownTraits = player.traitPile.filter(t => !DeckManager.isDominant(t) && t.instanceId !== card.instanceId);
        if (ownTraits.length === 0) return { needsInput: false };
        return {
          needsInput: true,
          inputType: 'select_own_trait',
          options: ownTraits.map((t, i) => ({ index: player.traitPile.indexOf(t), name: t.name, color: t.color, faceValue: t.faceValue })),
          message: 'Choose trait to return to hand',
          effectType: 'return_trait',
          optional: true
        };
      }

      // Protect traits
      case 'protect_traits': {
        player.protected = true;
        player.protectedUntil = gameState.round + 1;
        gameState.log(`${player.name}'s traits are protected`);
        return { needsInput: false };
      }

      // Discard hand and draw new cards
      case 'discard_hand_draw_new': {
        const handSize = player.hand.length;
        gameState.discardPile.push(...player.hand);
        player.hand = [];
        const newCards = gameState.drawCards(handSize + 1);
        player.hand.push(...newCards);
        gameState.log(`${player.name} discarded entire hand and drew ${newCards.length} cards`);
        return { needsInput: false };
      }

      // Discard opponent trait (choose)
      case 'discard_opponent_trait': {
        const opponents = gameState.players.filter(p =>
          p.id !== player.id && p.traitPile.some(t => !DeckManager.isDominant(t)) &&
          !(p.protected && p.protectedUntil > gameState.round)
        );
        if (opponents.length === 0) return { needsInput: false };
        return {
          needsInput: true,
          inputType: 'select_opponent_trait',
          options: opponents.map(p => ({
            id: p.id, name: p.name,
            traits: p.traitPile.filter(t => !DeckManager.isDominant(t))
              .map((t, i) => ({ index: p.traitPile.indexOf(t), name: t.name, color: t.color, faceValue: t.faceValue }))
          })),
          message: 'Choose trait to discard',
          effectType: 'discard_opponent_trait',
          optional: true
        };
      }

      // Copy opponent trait
      case 'copy_opponent_trait': {
        const opponents = gameState.players.filter(p =>
          p.id !== player.id && p.traitPile.length > 0
        );
        if (opponents.length === 0) return { needsInput: false };
        return {
          needsInput: true,
          inputType: 'select_opponent_trait',
          options: opponents.map(p => ({
            id: p.id, name: p.name,
            traits: p.traitPile.map((t, i) => ({ index: i, name: t.name, color: t.color, faceValue: t.faceValue }))
          })),
          message: 'Choose trait to copy',
          effectType: 'copy_trait',
          optional: true
        };
      }

      // Play action from opponent's trait (trigger action without copying card)
      case 'play_opponent_trait_action': {
        const opponents = gameState.players.filter(p =>
          p.id !== player.id && p.traitPile.some(t => t.actions && t.actions.length > 0)
        );
        if (opponents.length === 0) return { needsInput: false };
        return {
          needsInput: true,
          inputType: 'select_opponent_trait',
          options: opponents.map(p => ({
            id: p.id, name: p.name,
            traits: p.traitPile
              .filter(t => t.actions && t.actions.length > 0)
              .map((t, i) => ({ index: p.traitPile.indexOf(t), name: t.name, color: t.color, faceValue: t.faceValue }))
          })),
          message: 'Choose trait action to play',
          effectType: 'play_opponent_action',
          optional: true
        };
      }

      // Give cards to opponent
      case 'give_cards': {
        const count = params.num_cards || 1;
        if (player.hand.length === 0) return { needsInput: false };
        const opponents = gameState.players.filter(p => p.id !== player.id);
        if (opponents.length === 0) return { needsInput: false };
        return {
          needsInput: true,
          inputType: 'select_cards_and_opponent',
          count,
          cardOptions: player.hand.map((c, i) => ({ index: i, name: c.name, color: c.color, faceValue: c.faceValue })),
          opponentOptions: opponents.map(p => ({ id: p.id, name: p.name })),
          message: `Choose ${count} card(s) to give`,
          effectType: 'give_cards'
        };
      }

      // Move trait between players
      case 'move_trait': {
        // For now, similar to swap_trait
        return {
          needsInput: true,
          inputType: 'complex_trait_move',
          message: 'Choose traits to move',
          effectType: 'move_trait',
          optional: true
        };
      }

      // Swap trait with opponent
      case 'swap_trait': {
        const sameColor = params.same_color; // true = must match color, false = must be different color
        const ownTraits = player.traitPile.filter(t => !DeckManager.isDominant(t) && t.instanceId !== card.instanceId);
        if (ownTraits.length === 0) return { needsInput: false };
        const opponents = gameState.players.filter(p =>
          p.id !== player.id && p.traitPile.some(t => !DeckManager.isDominant(t))
        );
        if (opponents.length === 0) return { needsInput: false };
        return {
          needsInput: true,
          inputType: 'select_trait_swap',
          ownOptions: ownTraits.map((t, i) => ({ index: player.traitPile.indexOf(t), name: t.name, color: t.color, faceValue: t.faceValue })),
          opponentOptions: opponents.map(p => ({
            id: p.id, name: p.name,
            traits: p.traitPile.filter(t => !DeckManager.isDominant(t))
              .map((t, i) => ({ index: p.traitPile.indexOf(t), name: t.name, color: t.color, faceValue: t.faceValue }))
          })),
          message: sameColor === false ? 'Choose traits to swap (different colors)' : 'Choose traits to swap',
          effectType: 'swap_trait',
          sameColor: sameColor, // Pass parameter to resolution
          optional: true
        };
      }

      // Rearrange own traits
      case 'rearrange_traits': {
        return {
          needsInput: true,
          inputType: 'rearrange_traits',
          traits: player.traitPile.map((t, i) => ({ index: i, name: t.name, color: t.color, faceValue: t.faceValue })),
          message: 'Rearrange your traits',
          effectType: 'rearrange_traits',
          optional: true
        };
      }

      // Discard hand (for effects like Legendary)
      case 'discard_hand': {
        gameState.discardPile.push(...player.hand);
        player.hand = [];
        gameState.log(`${player.name} discarded their hand`);
        return { needsInput: false };
      }

      // Skip stabilization (for effects like Legendary)
      case 'skip_stabilization': {
        player.skipStabilize = true;
        return { needsInput: false };
      }

      // Give trait to opponent (Scutes)
      case 'give_trait_to_opponent': {
        const ownTraits = player.traitPile.filter(t => !DeckManager.isDominant(t) && t.instanceId !== card.instanceId);
        if (ownTraits.length === 0) return { needsInput: false };
        const opponents = gameState.players.filter(p => p.id !== player.id);
        if (opponents.length === 0) return { needsInput: false };
        return {
          needsInput: true,
          inputType: 'select_own_trait_and_opponent',
          ownTraitOptions: ownTraits.map((t, i) => ({ index: player.traitPile.indexOf(t), name: t.name, color: t.color, faceValue: t.faceValue })),
          opponentOptions: opponents.map(p => ({ id: p.id, name: p.name })),
          message: 'Choose a trait to give to an opponent',
          effectType: 'give_trait_to_opponent',
          optional: true
        };
      }

      // Mutual discard trait (Reckless)
      case 'mutual_discard_trait': {
        const ownTraits = player.traitPile.filter(t => !DeckManager.isDominant(t) && t.instanceId !== card.instanceId);
        if (ownTraits.length === 0) return { needsInput: false };
        const opponents = gameState.players.filter(p =>
          p.id !== player.id &&
          p.traitPile.some(t => !DeckManager.isDominant(t)) &&
          !(p.protected && p.protectedUntil > gameState.round)
        );
        if (opponents.length === 0) return { needsInput: false };
        return {
          needsInput: true,
          inputType: 'select_mutual_discard',
          ownTraitOptions: ownTraits.map((t, i) => ({ index: player.traitPile.indexOf(t), name: t.name, color: t.color, faceValue: t.faceValue })),
          opponentOptions: opponents.map(p => ({
            id: p.id, name: p.name,
            traits: p.traitPile.filter(t => !DeckManager.isDominant(t))
              .map((t, i) => ({ index: p.traitPile.indexOf(t), name: t.name, color: t.color, faceValue: t.faceValue }))
          })),
          message: 'Choose your trait and opponent trait to discard',
          effectType: 'mutual_discard_trait',
          optional: true
        };
      }

      // Discard all cards of a chosen color from all players' hands (Persuasive)
      case 'discard_color_from_hand': {
        const colors = ['Red', 'Blue', 'Green', 'Purple', 'Colorless'];
        return {
          needsInput: true,
          inputType: 'select_color',
          options: colors.map(c => ({ color: c })),
          message: 'Choose a color - all players discard cards of that color',
          effectType: 'discard_color_from_hand'
        };
      }

      // Draw cards and play if specific color (Photosynthesis)
      case 'draw_and_play_if_color': {
        const count = params.value || 2;
        const targetColor = params.color || 'Green';
        const drawn = gameState.drawCards(count);
        player.hand.push(...drawn);
        gameState.log(`${player.name} drew ${drawn.length} card(s)`);

        // Check if any drawn cards match the color
        const matchingCards = drawn.filter(c => c.color === targetColor || c.color.includes(targetColor));
        if (matchingCards.length > 0 && !player.hasPlayedTraitThisTurn) {
          // Offer to play one immediately
          return {
            needsInput: true,
            inputType: 'select_own_cards',
            count: 1,
            options: matchingCards.map((c, i) => ({
              index: player.hand.indexOf(c),
              name: c.name,
              color: c.color,
              faceValue: c.faceValue
            })),
            message: `You drew ${targetColor} card(s). Play 1 immediately? (Unless restricted)`,
            effectType: 'play_drawn_card',
            optional: true
          };
        }
        return { needsInput: false };
      }

      // Swap this card with opponent's trait (Poisonous)
      case 'swap_self_with_opponent_trait': {
        const opponents = gameState.players.filter(p =>
          p.id !== player.id && p.traitPile.some(t => !DeckManager.isDominant(t))
        );
        if (opponents.length === 0) return { needsInput: false };
        return {
          needsInput: true,
          inputType: 'select_opponent_trait',
          options: opponents.map(p => ({
            id: p.id, name: p.name,
            traits: p.traitPile.filter(t => !DeckManager.isDominant(t))
              .map((t, i) => ({ index: p.traitPile.indexOf(t), name: t.name, color: t.color, faceValue: t.faceValue }))
          })),
          message: 'Choose an opponent\'s trait to swap with this card',
          effectType: 'swap_self_with_opponent_trait',
          cardToSwap: card
        };
      }

      // Move this card to opponent's trait pile (Venomous)
      case 'move_self_to_opponent': {
        const opponents = gameState.players.filter(p => p.id !== player.id);
        if (opponents.length === 0) return { needsInput: false };
        return {
          needsInput: true,
          inputType: 'select_opponent',
          options: opponents.map(p => ({ id: p.id, name: p.name })),
          message: 'Choose an opponent to give this card to',
          effectType: 'move_self_to_opponent',
          cardToMove: card
        };
      }

      // Opponents reveal cards, player steals one and plays it (Clever)
      case 'opponents_reveal_steal_play': {
        const revealCount = params.reveal_count || 1;
        const opponents = gameState.players.filter(p => p.id !== player.id && p.hand.length > 0);

        if (opponents.length === 0) {
          gameState.log(`${player.name} played Clever but no opponents have cards to reveal`);
          return { needsInput: false };
        }

        // Create multi-player action - opponents must reveal cards
        const participants = {};
        for (const opp of opponents) {
          participants[opp.id] = {
            required: true,
            responded: false,
            response: null,
            playerName: opp.name,
            handSize: opp.hand.length
          };
        }

        gameState.multiPlayerAction = {
          id: `reveal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'reveal_cards',
          sourcePlayerId: player.id,
          sourcePlayerName: player.name,
          sourceCard: { name: card.name, instanceId: card.instanceId },
          participants,
          config: {
            revealCount,
            nextAction: 'steal_revealed_and_play'
          },
          createdAt: Date.now(),
          timeoutMs: 60000 // 60 second timeout
        };

        gameState.log(`${player.name} played Clever - opponents must reveal a card`);

        // Return waiting state for the source player
        return {
          needsInput: true,
          inputType: 'waiting_for_multi_player',
          message: 'Waiting for opponents to reveal cards...',
          multiPlayerActionId: gameState.multiPlayerAction.id,
          participants: opponents.map(o => ({ id: o.id, name: o.name, responded: false }))
        };
      }

      default:
        gameState.log(`Unknown action: ${name}`);
        return { needsInput: false };
    }
  }

  // Resolve target selection from player input
  static resolveTargetSelection(gameState, player, pendingAction, data) {
    const targetPlayer = data.targetId ? gameState.getPlayer(data.targetId) : null;

    switch (pendingAction.effectType) {
      case 'view_hand':
        if (!targetPlayer) return { success: false, error: 'No target selected' };
        return {
          success: true,
          viewHand: targetPlayer.hand.map(c => ({ name: c.name, color: c.color, faceValue: c.faceValue })),
          message: `${targetPlayer.name}'s hand`
        };

      case 'steal_random':
        if (!targetPlayer || targetPlayer.hand.length === 0) return { success: false, error: 'No cards to steal' };
        const randomIndex = Math.floor(Math.random() * targetPlayer.hand.length);
        const stolenCard = targetPlayer.hand.splice(randomIndex, 1)[0];
        player.hand.push(stolenCard);
        gameState.log(`${player.name} stole a card from ${targetPlayer.name}`);
        return { success: true };

      case 'discard_opponent_hand':
        if (!targetPlayer) return { success: false, error: 'No target selected' };
        const count = Math.min(pendingAction.count || 1, targetPlayer.hand.length);
        for (let i = 0; i < count; i++) {
          const idx = Math.floor(Math.random() * targetPlayer.hand.length);
          gameState.discardPile.push(targetPlayer.hand.splice(idx, 1)[0]);
        }
        gameState.log(`${targetPlayer.name} discarded ${count} card(s)`);
        return { success: true };

      case 'steal_trait':
        if (!targetPlayer) return { success: false, error: 'No target selected' };
        const stolenTrait = gameState.removeTraitFromPile(targetPlayer, data.traitIndex);
        if (stolenTrait) {
          player.traitPile.push(stolenTrait);
          // Apply gene pool effect to new owner
          if (stolenTrait.effects) {
            for (const effect of stolenTrait.effects) {
              if (effect.name === 'modify_gene_pool' && effect.params.affected_players === 'self') {
                player.genePool = Math.max(1, Math.min(8, player.genePool + effect.params.value));
                gameState.log(`${player.name}'s Gene Pool is now ${player.genePool}`);
              }
            }
          }
          gameState.log(`${player.name} stole ${stolenTrait.name} from ${targetPlayer.name}`);
        }
        return { success: true };

      case 'steal_trait_play_action':
        if (!targetPlayer) return { success: false, error: 'No target selected' };
        const stolenTraitWithAction = gameState.removeTraitFromPile(targetPlayer, data.traitIndex);
        if (stolenTraitWithAction) {
          player.traitPile.push(stolenTraitWithAction);
          // Apply gene pool effect to new owner
          if (stolenTraitWithAction.effects) {
            for (const effect of stolenTraitWithAction.effects) {
              if (effect.name === 'modify_gene_pool' && effect.params.affected_players === 'self') {
                player.genePool = Math.max(1, Math.min(8, player.genePool + effect.params.value));
                gameState.log(`${player.name}'s Gene Pool is now ${player.genePool}`);
              }
            }
          }
          gameState.log(`${player.name} stole ${stolenTraitWithAction.name} from ${targetPlayer.name}`);
          // Play the stolen trait's actions
          if (stolenTraitWithAction.actions) {
            for (const action of stolenTraitWithAction.actions) {
              const actionResult = this.executeAction(action, player, gameState, stolenTraitWithAction);
              if (actionResult.needsInput) {
                return { success: true, pendingAction: actionResult };
              }
            }
          }
        }
        return { success: true };

      case 'copy_trait':
        if (!targetPlayer) return { success: false, error: 'No target selected' };
        const copiedTrait = { ...targetPlayer.traitPile[data.traitIndex], instanceId: `copy_${Date.now()}` };
        player.traitPile.push(copiedTrait);
        // Apply gene pool effect for the copy
        if (copiedTrait.effects) {
          for (const effect of copiedTrait.effects) {
            if (effect.name === 'modify_gene_pool' && effect.params.affected_players === 'self') {
              player.genePool = Math.max(1, Math.min(8, player.genePool + effect.params.value));
              gameState.log(`${player.name}'s Gene Pool is now ${player.genePool}`);
            }
          }
        }
        gameState.log(`${player.name} copied ${copiedTrait.name}`);
        return { success: true };

      case 'play_opponent_action':
        if (!targetPlayer) return { success: false, error: 'No target selected' };
        const traitWithAction = targetPlayer.traitPile[data.traitIndex];
        if (traitWithAction && traitWithAction.actions) {
          gameState.log(`${player.name} plays ${traitWithAction.name}'s action from ${targetPlayer.name}'s trait pile`);
          // Process each action from the selected trait
          for (const action of traitWithAction.actions) {
            const actionResult = this.executeAction(action, player, gameState, card);
            if (actionResult.needsInput) {
              // Queue the action for player input
              return { success: true, pendingAction: actionResult };
            }
          }
        }
        return { success: true };

      case 'discard_opponent_trait':
        if (!targetPlayer) return { success: false, error: 'No target selected' };
        const discardedTrait = gameState.removeTraitFromPile(targetPlayer, data.traitIndex);
        if (discardedTrait) {
          gameState.discardPile.push(discardedTrait);
          gameState.log(`${player.name} discarded ${discardedTrait.name} from ${targetPlayer.name}`);
        }
        return { success: true };

      case 'give_trait_to_opponent':
        if (!targetPlayer) return { success: false, error: 'No target selected' };
        const givenTrait = gameState.removeTraitFromPile(player, data.ownTraitIndex);
        if (givenTrait) {
          targetPlayer.traitPile.push(givenTrait);
          // Apply gene pool effect to new owner
          if (givenTrait.effects) {
            for (const effect of givenTrait.effects) {
              if (effect.name === 'modify_gene_pool' && effect.params.affected_players === 'self') {
                targetPlayer.genePool = Math.max(1, Math.min(8, targetPlayer.genePool + effect.params.value));
                gameState.log(`${targetPlayer.name}'s Gene Pool is now ${targetPlayer.genePool}`);
              }
            }
          }
          // Remove gene pool effect from original owner
          if (givenTrait.removeEffects) {
            for (const effect of givenTrait.removeEffects) {
              if (effect.name === 'modify_gene_pool' && effect.params.affected_players === 'self') {
                player.genePool = Math.max(1, Math.min(8, player.genePool + effect.params.value));
                gameState.log(`${player.name}'s Gene Pool is now ${player.genePool}`);
              }
            }
          }
          gameState.log(`${player.name} gave ${givenTrait.name} to ${targetPlayer.name}`);
        }
        return { success: true };

      case 'mutual_discard_trait':
        if (!targetPlayer) return { success: false, error: 'No target selected' };
        // Discard player's own trait
        const ownDiscarded = gameState.removeTraitFromPile(player, data.ownTraitIndex);
        // Discard opponent's trait
        const oppDiscarded = gameState.removeTraitFromPile(targetPlayer, data.oppTraitIndex);
        if (ownDiscarded) {
          gameState.discardPile.push(ownDiscarded);
        }
        if (oppDiscarded) {
          gameState.discardPile.push(oppDiscarded);
        }
        gameState.log(`${player.name} and ${targetPlayer.name} each discarded a trait`);
        return { success: true };

      default:
        return { success: true };
    }
  }

  // Resolve card selection from player input
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
        const returnedTrait = gameState.removeTraitFromPile(player, data.index);
        if (returnedTrait) {
          player.hand.push(returnedTrait);
          gameState.log(`${player.name} returned ${returnedTrait.name} to hand`);
        }
        return { success: true };

      case 'discard_own_trait':
        const discardedOwnTrait = gameState.removeTraitFromPile(player, data.index);
        if (discardedOwnTrait) {
          gameState.discardPile.push(discardedOwnTrait);
          gameState.log(`${player.name} discarded ${discardedOwnTrait.name}`);
        }
        return { success: true };

      case 'search_discard':
        const pickedCard = gameState.discardPile.splice(data.index, 1)[0];
        player.hand.push(pickedCard);
        gameState.log(`${player.name} took ${pickedCard.name} from discard`);
        return { success: true };

      case 'search_discard_and_play': {
        const playedCard = gameState.discardPile.splice(data.index, 1)[0];
        gameState.log(`${player.name} plays ${playedCard.name} from discard`);
        // Play the card to trait pile
        player.traitPile.push(playedCard);
        // Apply gene pool effects
        if (playedCard.effects) {
          for (const effect of playedCard.effects) {
            if (effect.name === 'modify_gene_pool' && effect.params.affected_players === 'self') {
              player.genePool = Math.max(1, Math.min(8, player.genePool + effect.params.value));
              gameState.log(`${player.name}'s Gene Pool is now ${player.genePool}`);
            }
          }
        }
        // Process the card's actions
        if (playedCard.actions) {
          for (const action of playedCard.actions) {
            const actionResult = this.executeAction(action, player, gameState, playedCard);
            if (actionResult.needsInput) {
              return { success: true, pendingAction: actionResult };
            }
          }
        }
        return { success: true };
      }

      case 'search_discard_ignore_action': {
        const playedCard = gameState.discardPile.splice(data.index, 1)[0];
        gameState.log(`${player.name} plays ${playedCard.name} from discard (ignoring action)`);
        // Play the card to trait pile
        player.traitPile.push(playedCard);
        // Apply gene pool effects
        if (playedCard.effects) {
          for (const effect of playedCard.effects) {
            if (effect.name === 'modify_gene_pool' && effect.params.affected_players === 'self') {
              player.genePool = Math.max(1, Math.min(8, player.genePool + effect.params.value));
              gameState.log(`${player.name}'s Gene Pool is now ${player.genePool}`);
            }
          }
        }
        // Do NOT process actions - that's the point of "ignore action"
        return { success: true };
      }

      case 'give_cards':
        const target = gameState.getPlayer(data.targetId);
        if (!target) return { success: false, error: 'No target selected' };
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

      case 'swap_trait': {
        const swapTarget = gameState.getPlayer(data.targetId);
        if (!swapTarget) return { success: false, error: 'No target selected' };
        const ownTrait = player.traitPile[data.ownTraitIndex];
        const opponentTrait = swapTarget.traitPile[data.opponentTraitIndex];

        // Validate color constraint if specified
        if (pendingAction.sameColor === false && ownTrait && opponentTrait) {
          // Must be different colors
          if (ownTrait.color === opponentTrait.color) {
            return { success: false, error: 'Traits must be different colors' };
          }
        } else if (pendingAction.sameColor === true && ownTrait && opponentTrait) {
          // Must be same color
          if (ownTrait.color !== opponentTrait.color) {
            return { success: false, error: 'Traits must be the same color' };
          }
        }

        const removedOwnTrait = gameState.removeTraitFromPile(player, data.ownTraitIndex);
        const removedOpponentTrait = gameState.removeTraitFromPile(swapTarget, data.opponentTraitIndex);
        if (removedOwnTrait && removedOpponentTrait) {
          player.traitPile.push(removedOpponentTrait);
          swapTarget.traitPile.push(removedOwnTrait);
          gameState.log(`${player.name} swapped ${removedOwnTrait.name} with ${swapTarget.name}'s ${removedOpponentTrait.name}`);
        }
        return { success: true };
      }

      case 'rearrange_traits':
        if (data.newOrder && Array.isArray(data.newOrder)) {
          const reorderedTraits = data.newOrder.map(idx => player.traitPile[idx]).filter(t => t);
          player.traitPile = reorderedTraits;
          gameState.log(`${player.name} rearranged their traits`);
        }
        return { success: true };

      case 'discard_color_from_hand':
        if (!data.selectedColor) return { success: false, error: 'No color selected' };
        let totalDiscarded = 0;
        for (const p of gameState.players) {
          const beforeCount = p.hand.length;
          p.hand = p.hand.filter(c => {
            const matches = c.color === data.selectedColor || c.color.includes(data.selectedColor);
            if (matches) {
              gameState.discardPile.push(c);
              totalDiscarded++;
            }
            return !matches;
          });
          const discarded = beforeCount - p.hand.length;
          if (discarded > 0) {
            gameState.log(`${p.name} discarded ${discarded} ${data.selectedColor} card(s)`);
          }
        }
        return { success: true };

      case 'play_drawn_card':
        if (data.selectedIndices && data.selectedIndices.length > 0) {
          const cardIndex = data.selectedIndices[0];
          const cardToPlay = player.hand[cardIndex];
          if (cardToPlay) {
            // Check if card can be played
            if (gameState.canPlayCard(player, cardToPlay)) {
              player.hand.splice(cardIndex, 1);
              player.traitPile.push(cardToPlay);
              player.hasPlayedTraitThisTurn = true;
              gameState.lastPlayedTraitColor = cardToPlay.color;
              gameState.log(`${player.name} immediately played ${cardToPlay.name}`);
            } else {
              gameState.log(`${player.name} cannot play ${cardToPlay.name} (restricted)`);
            }
          }
        }
        return { success: true };

      case 'swap_self_with_opponent_trait': {
        if (!targetPlayer) return { success: false, error: 'No target selected' };
        const opponentTrait = gameState.removeTraitFromPile(targetPlayer, data.traitIndex);
        const selfCard = pendingAction.cardToSwap;
        if (opponentTrait && selfCard) {
          // Remove the just-played card from player's trait pile
          const selfIndex = player.traitPile.findIndex(t => t.instanceId === selfCard.instanceId);
          if (selfIndex >= 0) {
            player.traitPile.splice(selfIndex, 1);
          }
          // Swap: give opponent's trait to player, give played card to opponent
          player.traitPile.push(opponentTrait);
          targetPlayer.traitPile.push(selfCard);
          gameState.log(`${player.name} swapped ${selfCard.name} with ${targetPlayer.name}'s ${opponentTrait.name}`);
        }
        return { success: true };
      }

      case 'move_self_to_opponent':
        if (!targetPlayer) return { success: false, error: 'No target selected' };
        const cardToMove = pendingAction.cardToMove;
        if (cardToMove) {
          // Remove the just-played card from player's trait pile
          const cardIndex = player.traitPile.findIndex(t => t.instanceId === cardToMove.instanceId);
          if (cardIndex >= 0) {
            player.traitPile.splice(cardIndex, 1);
            // Move card to opponent's trait pile
            targetPlayer.traitPile.push(cardToMove);
            // Apply effects to new owner
            if (cardToMove.effects) {
              for (const effect of cardToMove.effects) {
                ActionProcessor.applyPassiveEffect(gameState, targetPlayer, effect);
              }
            }
            // Remove effects from original player
            if (cardToMove.removeEffects) {
              for (const effect of cardToMove.removeEffects) {
                ActionProcessor.applyPassiveEffect(gameState, player, effect);
              }
            }
            gameState.log(`${player.name} moved ${cardToMove.name} to ${targetPlayer.name}'s trait pile`);
          }
        }
        return { success: true };

      default:
        return { success: true };
    }
  }

  // Apply catastrophe effects from the new catastropheEffects array
  static applyCatastropheEffects(gameState, catastrophe) {
    if (!catastrophe.catastropheEffects) return;

    for (const effect of catastrophe.catastropheEffects) {
      const { name, params } = effect;

      switch (name) {
        case 'draw_card_for_every_color_type':
          // Each player draws 1 card per unique color in their trait pile
          for (const player of gameState.players) {
            const colorCount = Scoring.countUniqueColors(player.traitPile);
            if (colorCount > 0) {
              const drawn = gameState.drawCards(colorCount);
              player.hand.push(...drawn);
              gameState.log(`${player.name} drew ${drawn.length} card(s) for ${colorCount} color(s)`);
            }
          }
          break;

        case 'discard_card_from_hand_for_every_color':
          // Each player discards 1 card per trait of the specified color
          for (const player of gameState.players) {
            const count = Scoring.countColor(player.traitPile, params.color);
            const toDiscard = Math.min(count, player.hand.length);
            for (let i = 0; i < toDiscard; i++) {
              const idx = Math.floor(Math.random() * player.hand.length);
              gameState.discardPile.push(player.hand.splice(idx, 1)[0]);
            }
            if (toDiscard > 0) {
              gameState.log(`${player.name} discarded ${toDiscard} card(s) for ${params.color} traits`);
            }
          }
          break;

        case 'discard_card_from_hand_for_every_dominant':
          // Each player discards 1 card per dominant trait
          for (const player of gameState.players) {
            const count = Scoring.countDominant(player.traitPile);
            const toDiscard = Math.min(count, player.hand.length);
            for (let i = 0; i < toDiscard; i++) {
              const idx = Math.floor(Math.random() * player.hand.length);
              gameState.discardPile.push(player.hand.splice(idx, 1)[0]);
            }
            if (toDiscard > 0) {
              gameState.log(`${player.name} discarded ${toDiscard} card(s) for Dominant traits`);
            }
          }
          break;

        case 'discard_all_but_n_cards':
          // Discard all but N cards from hand
          for (const player of gameState.players) {
            const keepCount = params.num_cards || 1;
            const toDiscard = Math.max(0, player.hand.length - keepCount);
            for (let i = 0; i < toDiscard; i++) {
              const idx = Math.floor(Math.random() * player.hand.length);
              gameState.discardPile.push(player.hand.splice(idx, 1)[0]);
            }
            if (toDiscard > 0) {
              gameState.log(`${player.name} discarded ${toDiscard} card(s), keeping ${player.hand.length}`);
            }
          }
          break;

        case 'discard_hand_and_stabilize':
          // Discard entire hand, then draw to gene pool
          for (const player of gameState.players) {
            const discarded = player.hand.length;
            gameState.discardPile.push(...player.hand.splice(0));
            if (discarded > 0) {
              gameState.log(`${player.name} discarded entire hand (${discarded} cards)`);
            }
            // Draw to gene pool
            const toDraw = Math.max(0, player.genePool - player.hand.length);
            const drawn = gameState.drawCards(toDraw);
            player.hand.push(...drawn);
            if (drawn.length > 0) {
              gameState.log(`${player.name} drew ${drawn.length} card(s) to stabilize`);
            }
          }
          break;

        case 'stabilize_all_then_discard':
          // Stabilize all players to gene pool, then discard N cards
          for (const player of gameState.players) {
            // First stabilize
            if (player.hand.length < player.genePool) {
              const toDraw = player.genePool - player.hand.length;
              const drawn = gameState.drawCards(toDraw);
              player.hand.push(...drawn);
              gameState.log(`${player.name} drew ${drawn.length} card(s) to stabilize`);
            } else if (player.hand.length > player.genePool) {
              const toDiscard = player.hand.length - player.genePool;
              for (let i = 0; i < toDiscard; i++) {
                const idx = Math.floor(Math.random() * player.hand.length);
                gameState.discardPile.push(player.hand.splice(idx, 1)[0]);
              }
              gameState.log(`${player.name} discarded ${toDiscard} card(s) to stabilize`);
            }
            // Then discard additional cards
            const numToDiscard = params.num_cards || 1;
            const actualDiscard = Math.min(numToDiscard, player.hand.length);
            for (let i = 0; i < actualDiscard; i++) {
              const idx = Math.floor(Math.random() * player.hand.length);
              gameState.discardPile.push(player.hand.splice(idx, 1)[0]);
            }
            if (actualDiscard > 0) {
              gameState.log(`${player.name} then discarded ${actualDiscard} more card(s)`);
            }
          }
          break;

        case 'pass_hand_right':
          // Pass entire hand to the right (opposite of normal passing)
          CardEffects.handlePassCardsRight(gameState, gameState.players[0].hand.length);
          break;

        case 'discard_half_hand':
          // Each player discards half their hand rounded up
          for (const player of gameState.players) {
            const halfSize = Math.ceil(player.hand.length / 2);
            for (let i = 0; i < halfSize; i++) {
              const idx = Math.floor(Math.random() * player.hand.length);
              gameState.discardPile.push(player.hand.splice(idx, 1)[0]);
            }
            if (halfSize > 0) {
              gameState.log(`${player.name} discarded ${halfSize} card(s) (half of hand)`);
            }
          }
          break;

        case 'give_cards_to_adjacent_opponents':
          // Each player gives 1 card to opponents on left and right
          const numCards = params.num_cards || 1;
          const cardsToGive = [];
          for (const player of gameState.players) {
            const givenCards = [];
            for (let i = 0; i < numCards && player.hand.length > 0; i++) {
              const idx = Math.floor(Math.random() * player.hand.length);
              givenCards.push(player.hand.splice(idx, 1)[0]);
            }
            cardsToGive.push(givenCards);
          }
          // Distribute cards to adjacent players
          for (let i = 0; i < gameState.players.length; i++) {
            const leftIdx = (i - 1 + gameState.players.length) % gameState.players.length;
            const rightIdx = (i + 1) % gameState.players.length;
            if (cardsToGive[i].length > 0) {
              // Give to left neighbor
              if (gameState.players[leftIdx]) {
                gameState.players[leftIdx].hand.push(...cardsToGive[i].slice(0, 1));
              }
              // Give to right neighbor if 2+ cards
              if (cardsToGive[i].length > 1 && gameState.players[rightIdx]) {
                gameState.players[rightIdx].hand.push(...cardsToGive[i].slice(1));
              }
              gameState.log(`${gameState.players[i].name} gave cards to adjacent opponents`);
            }
          }
          break;

        case 'discard_trait_from_pile':
          // Each player discards N traits from their trait pile
          for (const player of gameState.players) {
            const numToDiscard = params.num_cards || 1;
            for (let i = 0; i < numToDiscard; i++) {
              const idx = player.traitPile.findIndex(t => !DeckManager.isDominant(t));
              if (idx !== -1) {
                const discarded = gameState.removeTraitFromPile(player, idx);
                if (discarded) {
                  gameState.discardPile.push(discarded);
                  gameState.log(`${player.name} discarded ${discarded.name} from trait pile`);
                }
              }
            }
          }
          break;

        case 'reverse_turn_order':
          // Reverse the turn order for this round
          gameState.players.reverse();
          gameState.currentPlayerIndex = 0;
          gameState.log('Turn order reversed for this round');
          break;

        default:
          gameState.log(`Unknown catastrophe effect: ${name}`);
      }
    }
  }

  // Apply world's end effects from catastrophes
  static applyWorldEndEffect(gameState, catastrophe) {
    if (!catastrophe.worldEndEffect) return;

    const { name, params } = catastrophe.worldEndEffect;

    switch (name) {
      case 'modify_world_end_points_fewest_traits':
        // Player with fewest traits gets bonus points
        let minTraits = Infinity;
        let minPlayers = [];
        for (const player of gameState.players) {
          if (player.traitPile.length < minTraits) {
            minTraits = player.traitPile.length;
            minPlayers = [player];
          } else if (player.traitPile.length === minTraits) {
            minPlayers.push(player);
          }
        }
        for (const player of minPlayers) {
          player.worldEndBonus = (player.worldEndBonus || 0) + (params.value || 0);
          gameState.log(`${player.name} gets +${params.value} for fewest traits`);
        }
        break;

      case 'modify_world_end_points_for_every_color':
        // Points modifier per color trait
        for (const player of gameState.players) {
          const count = Scoring.countColor(player.traitPile, params.color);
          const modifier = count * (params.value || 0);
          player.worldEndBonus = (player.worldEndBonus || 0) + modifier;
          if (modifier !== 0) {
            gameState.log(`${player.name} gets ${modifier > 0 ? '+' : ''}${modifier} for ${count} ${params.color} traits`);
          }
        }
        break;

      case 'modify_world_end_points_face_value':
        // Points modifier per trait with face value comparison
        for (const player of gameState.players) {
          let count = 0;
          for (const trait of player.traitPile) {
            const faceValue = Scoring.getBaseFaceValue(trait, gameState, player);
            if (params.compare_type === 'greater_than' && faceValue > params.face_value) {
              count++;
            } else if (params.compare_type === 'less_than' && faceValue < params.face_value) {
              count++;
            }
          }
          const modifier = count * (params.value || 0);
          player.worldEndBonus = (player.worldEndBonus || 0) + modifier;
          if (modifier !== 0) {
            gameState.log(`${player.name} gets ${modifier > 0 ? '+' : ''}${modifier} for traits with face ${params.compare_type} ${params.face_value}`);
          }
        }
        break;

      case 'discard_card_from_trait_pile':
        // All players discard traits of a specific color
        for (const player of gameState.players) {
          const numCards = params.num_cards || 1;
          for (let i = 0; i < numCards; i++) {
            const idx = player.traitPile.findIndex(t =>
              (!params.color || DeckManager.isColor(t, params.color)) && !DeckManager.isDominant(t)
            );
            if (idx !== -1) {
              const discarded = gameState.removeTraitFromPile(player, idx);
              if (discarded) {
                gameState.discardPile.push(discarded);
                gameState.log(`${player.name} lost ${discarded.name} (World's End)`);
              }
            }
          }
        }
        break;

      case 'modify_world_end_points_missing_colors':
        // Points penalty for each color missing from trait pile
        for (const player of gameState.players) {
          const colors = ['Red', 'Blue', 'Green', 'Purple'];
          let missingCount = 0;
          for (const color of colors) {
            const hasColor = player.traitPile.some(t => DeckManager.isColor(t, color));
            if (!hasColor) missingCount++;
          }
          const modifier = missingCount * (params.value || 0);
          player.worldEndBonus = (player.worldEndBonus || 0) + modifier;
          if (modifier !== 0) {
            gameState.log(`${player.name} gets ${modifier > 0 ? '+' : ''}${modifier} for ${missingCount} missing colors`);
          }
        }
        break;

      case 'discard_trait_from_pile_face_value':
        // Discard traits with face value comparison
        for (const player of gameState.players) {
          const numCards = params.num_cards || 1;
          for (let i = 0; i < numCards; i++) {
            const idx = player.traitPile.findIndex(t => {
              if (DeckManager.isDominant(t)) return false;
              const faceValue = Scoring.getBaseFaceValue(t, gameState, player);
              if (params.compare_type === 'greater_than_or_equal') {
                return faceValue >= params.face_value;
              } else if (params.compare_type === 'greater_than') {
                return faceValue > params.face_value;
              } else if (params.compare_type === 'less_than') {
                return faceValue < params.face_value;
              }
              return false;
            });
            if (idx !== -1) {
              const discarded = gameState.removeTraitFromPile(player, idx);
              if (discarded) {
                gameState.discardPile.push(discarded);
                gameState.log(`${player.name} lost ${discarded.name} (World's End)`);
              }
            }
          }
        }
        break;

      case 'colorless_worth_2_ignore_effects':
        // Each colorless trait is worth 2 points, ignore colorless effects (excluding dominants)
        for (const player of gameState.players) {
          let colorlessCount = 0;
          for (const trait of player.traitPile) {
            if (DeckManager.isColor(trait, 'Colorless') && !DeckManager.isDominant(trait)) {
              colorlessCount++;
            }
          }
          const modifier = colorlessCount * 2;
          player.worldEndBonus = (player.worldEndBonus || 0) + modifier;
          if (modifier > 0) {
            gameState.log(`${player.name} gets +${modifier} for ${colorlessCount} colorless traits (worth 2 each, effects ignored)`);
          }
        }
        break;

      case 'draw_card_add_face_value_max_5':
        // Draw a card, add its face value to score (max +5), then discard it
        for (const player of gameState.players) {
          const drawn = gameState.drawCards(1);
          if (drawn.length > 0) {
            const card = drawn[0];
            const faceValue = Scoring.getBaseFaceValue(card, gameState, player);
            const bonus = Math.min(5, Math.max(0, faceValue));
            player.worldEndBonus = (player.worldEndBonus || 0) + bonus;
            gameState.discardPile.push(card);
            gameState.log(`${player.name} drew ${card.name} (face ${faceValue}), gets +${bonus} points`);
          }
        }
        break;

      case 'modify_world_end_points_most_traits':
        // Player(s) with most traits gets modifier
        let maxTraits = 0;
        let maxPlayers = [];
        for (const player of gameState.players) {
          if (player.traitPile.length > maxTraits) {
            maxTraits = player.traitPile.length;
            maxPlayers = [player];
          } else if (player.traitPile.length === maxTraits) {
            maxPlayers.push(player);
          }
        }
        for (const player of maxPlayers) {
          player.worldEndBonus = (player.worldEndBonus || 0) + (params.value || 0);
          gameState.log(`${player.name} gets ${params.value > 0 ? '+' : ''}${params.value} for most traits`);
        }
        break;

      default:
        gameState.log(`Unknown world end effect: ${name}`);
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

  static handlePassCardsRight(gameState, count) {
    const cardsToPass = gameState.players.map(p => p.hand.splice(0, Math.min(count, p.hand.length)));
    for (let i = 0; i < gameState.players.length; i++) {
      const prevIdx = (i - 1 + gameState.players.length) % gameState.players.length;
      gameState.players[prevIdx].hand.push(...cardsToPass[i]);
    }
    gameState.log(`All players passed their hand to the right`);
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
    this.multiPlayerAction = null; // For actions requiring input from multiple players
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
      genePool: 0, // Birth of Life age will set this to 5
      connected: true,
      needsStabilize: false
    };
    this.players.push(player);
    return player;
  }

  // Count dominant traits in player's trait pile
  countDominants(player) {
    return player.traitPile.filter(c => DeckManager.isDominant(c)).length;
  }

  // Check if a trait can be removed from player's pile
  canRemoveTrait(player, card) {
    // Dominant traits cannot be removed
    if (DeckManager.isDominant(card)) return false;
    // Check for persistent "cannot be removed" effect
    if (card.persistentEffect?.name === 'cannot_be_removed') return false;
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

    // Players will receive their initial cards from Birth of Life age effect

    // Random first player
    this.firstPlayerIndex = Math.floor(Math.random() * this.players.length);
    this.currentPlayerIndex = this.firstPlayerIndex;
    this.startNewRound();
    this.log(`Game started with ${this.players.length} players!`);
  }

  startNewRound() {
    this.round++;
    this.playersPlayedThisRound.clear();

    // Reset round-specific state
    this.turnRestrictions = [];
    this.ignoreActions = false;
    this.overrideStabilizeTarget = null;
    this.cardsPerTurn = 1;
    this.lastPlayedTraitColor = null;
    this.drawAfterStabilize = 0;

    // Reset Age effect flags
    this.optionalStabilization = false;
    this.optionalDiscardBeforeStabilize = 0;
    this.colorlessAllowsExtraPlay = false;
    this.effectlessAllowsExtraPlay = false;
    this.previewNextAge = false;
    this.protectTraitsThisRound = false;

    // Reset player-specific round state
    for (const player of this.players) {
      player.extraPlays = 0;
      player.ignoreActionsOnExtraPlays = false;
      player.skipStabilize = false;
      player.colorlessExtraPlayUsed = false;
      player.effectlessExtraPlayUsed = false;
    }

    // Start from first player
    this.currentPlayerIndex = this.firstPlayerIndex;

    if (this.ageDeck.length > 0) {
      this.currentAge = this.ageDeck.shift();

      if (this.currentAge.type === 'catastrophe') {
        // Wait for player acknowledgment before processing catastrophe
        this.turnPhase = 'catastrophe';
        this.log(`CATASTROPHE: ${this.currentAge.name}!`);
      } else {
        this.log(`Age: ${this.currentAge.name}`);
        this.handleAgeEffect();
      }
    }
  }

  handleAgeEffect() {
    const age = this.currentAge;

    // Store turn effects as restrictions for this round
    this.turnRestrictions = age.turnEffects || [];
    if (age.description) {
      this.log(`Round effect: ${age.description}`);
    }

    // Process turn effects to set flags
    if (age.turnEffects && age.turnEffects.length > 0) {
      this.processTurnEffects(age.turnEffects);
    }

    // Apply instant effects
    if (age.instantEffects && age.instantEffects.length > 0) {
      this.applyInstantEffects(age.instantEffects);
    }

    this.turnPhase = 'play';
  }

  // Process turn effects to set round flags
  processTurnEffects(effects) {
    for (const effect of effects) {
      const { name, params } = effect;

      switch (name) {
        case 'optional_stabilization':
          // PROSPERITY: Player may choose not to stabilize
          this.optionalStabilization = true;
          this.log('Optional: You may choose not to stabilize this round');
          break;

        case 'optional_discard_before_stabilize':
          // ENLIGHTENMENT: Player may discard up to N cards before stabilizing
          this.optionalDiscardBeforeStabilize = params.max_cards || 2;
          this.log(`Optional: You may discard up to ${this.optionalDiscardBeforeStabilize} cards before stabilizing`);
          break;

        case 'colorless_allows_extra_play':
          // GALACTIC DRIFT: Playing colorless allows playing another colorless
          this.colorlessAllowsExtraPlay = true;
          this.log('Playing a colorless trait allows playing another colorless trait');
          break;

        case 'effectless_allows_extra_play':
          // HIGH TIDES: Playing effectless allows playing another effectless
          this.effectlessAllowsExtraPlay = true;
          this.log('Playing an effectless trait allows playing another effectless trait');
          break;

        case 'preview_next_age':
          // AWAKENING: Preview the next age before taking your turn
          this.previewNextAge = true;
          this.log('You may preview the next age before taking your turn');
          break;

        case 'protect_traits':
          // REFORESTATION: Traits cannot be swapped, stolen, or discarded
          this.protectTraitsThisRound = true;
          this.log('All traits are protected from swapping, stealing, and discarding this round');
          break;

        // Other turn effects are handled as restrictions in canPlayCard()
      }
    }
  }

  // Apply instant effects from ages
  applyInstantEffects(effects) {
    for (const effect of effects) {
      const { name, params } = effect;

      switch (name) {
        case 'modify_gene_pool':
          // Modify gene pool for affected players
          const targets = params.affected_players === 'all' ? this.players :
                         params.affected_players === 'self' ? [this.players[this.currentPlayerIndex]] :
                         this.players;
          for (const player of targets) {
            player.genePool = Math.max(1, Math.min(8, player.genePool + params.value));
          }
          this.log(`Gene Pools modified by ${params.value > 0 ? '+' : ''}${params.value}`);
          break;

        case 'draw_cards':
          const drawTargets = params.affected_players === 'all' ? this.players :
                             params.affected_players === 'self' ? [this.players[this.currentPlayerIndex]] :
                             this.players;
          for (const player of drawTargets) {
            const drawn = this.drawCards(params.value || 1);
            player.hand.push(...drawn);
          }
          this.log(`All players drew ${params.value || 1} card(s)`);
          break;

        case 'discard_card_from_hand':
          const discardTargets = params.affected_players === 'all' ? this.players : this.players;
          for (const player of discardTargets) {
            const count = Math.min(params.num_cards || 1, player.hand.length);
            for (let i = 0; i < count; i++) {
              if (params.random_discard) {
                const idx = Math.floor(Math.random() * player.hand.length);
                this.discardPile.push(player.hand.splice(idx, 1)[0]);
              }
            }
          }
          this.log(`All players discarded ${params.num_cards || 1} card(s)`);
          break;

        case 'deal_from_discard_pile':
          // Shuffle discard pile and deal cards to players
          if (this.discardPile.length > 0) {
            this.discardPile = DeckManager.shuffle(this.discardPile);
            const dealTargets = params.affected_players === 'all' ? this.players : this.players;
            const numCards = params.num_cards || 1;
            for (const player of dealTargets) {
              for (let i = 0; i < numCards && this.discardPile.length > 0; i++) {
                player.hand.push(this.discardPile.shift());
              }
            }
            this.log(`Dealt ${numCards} card(s) from discard pile to each player`);
          }
          break;

        case 'stabilize_all_players':
          // Draw/discard to match gene pool for all players
          for (const player of this.players) {
            const target = player.genePool;
            const current = player.hand.length;
            if (current < target) {
              // Draw up to gene pool
              const drawn = this.drawCards(target - current);
              player.hand.push(...drawn);
            } else if (current > target) {
              // Discard down to gene pool (random for simplicity)
              const toDiscard = current - target;
              for (let i = 0; i < toDiscard; i++) {
                const idx = Math.floor(Math.random() * player.hand.length);
                this.discardPile.push(player.hand.splice(idx, 1)[0]);
              }
            }
          }
          this.log('All players stabilized to their gene pool size');
          break;

        case 'modify_number_cards_turn':
          // Track number of cards players can play this turn
          this.cardsPerTurn = params.value || 1;
          break;

        case 'set_end_turn_number_cards':
          // Override gene pool for this round's stabilization
          this.overrideStabilizeTarget = params.num_cards;
          this.log(`At end of turn, draw/discard to ${params.num_cards} cards`);
          break;

        case 'turn_ignore_actions':
          // Actions are ignored this round
          this.ignoreActions = true;
          this.log('Action effects are ignored this round');
          break;

        case 'play_heroic':
          // All Heroic cards in hand are played automatically
          for (const player of this.players) {
            const heroicCards = player.hand.filter(c => c.name === 'Heroic');
            for (const card of heroicCards) {
              const idx = player.hand.indexOf(card);
              if (idx !== -1 && this.countDominants(player) < 2) {
                player.hand.splice(idx, 1);
                player.traitPile.push(card);
                this.log(`${player.name} auto-played Heroic`);
              }
            }
          }
          break;

        case 'draw_card_after_stabilize':
          // Set flag to draw a card after stabilization
          this.drawAfterStabilize = params.value || 1;
          this.log(`Players will draw ${this.drawAfterStabilize} card(s) after stabilizing`);
          break;

        case 'steal_random_card_if_vampirism':
          // Age of Dracula: If player has Vampirism, steal random card from opponent
          for (const player of this.players) {
            const hasVampirism = player.traitPile.some(c => c.name === 'Vampirism');
            if (hasVampirism) {
              const opponents = this.players.filter(p => p.id !== player.id && p.hand.length > 0);
              if (opponents.length > 0) {
                const opponent = opponents[Math.floor(Math.random() * opponents.length)];
                const cardIdx = Math.floor(Math.random() * opponent.hand.length);
                const stolenCard = opponent.hand.splice(cardIdx, 1)[0];
                player.hand.push(stolenCard);
                this.log(`${player.name} (with Vampirism) stole a card from ${opponent.name}`);
              }
            }
          }
          break;

        case 'draw_keep_1_discard_2':
          // Age of Reason: Draw 3, keep 1, discard 2
          const reasonTargets = params.affected_players === 'all' ? this.players : this.players;
          for (const player of reasonTargets) {
            const drawn = this.drawCards(3);
            player.hand.push(...drawn);
            // This will require player input to choose which to keep
            this.log(`${player.name} drew 3 cards (must discard 2)`);
          }
          // Note: This needs UI handling to let players choose which 2 to discard
          break;

        default:
          this.log(`Unknown instant effect: ${name}`);
      }
    }
  }

  // Called when player acknowledges the catastrophe announcement
  acknowledgeCatastrophe() {
    if (this.turnPhase !== 'catastrophe') {
      return { success: false, error: 'No catastrophe to acknowledge' };
    }
    this.handleCatastrophe();
    return { success: true };
  }

  handleCatastrophe() {
    this.catastropheCount++;
    this.log(`CATASTROPHE ${this.catastropheCount}/3: ${this.currentAge.name}!`);

    // First player rotates left on catastrophe
    this.firstPlayerIndex = (this.firstPlayerIndex + 1) % this.players.length;
    this.currentPlayerIndex = this.firstPlayerIndex;

    // Apply Gene Pool effect (permanent)
    if (this.currentAge.genePoolEffect) {
      const effect = this.currentAge.genePoolEffect;
      for (const player of this.players) {
        player.genePool = Math.max(1, Math.min(8, player.genePool + effect));
      }
      this.log(`All Gene Pools ${effect > 0 ? '+' : ''}${effect}`);
    }

    // Check for game end (3rd catastrophe)
    if (this.catastropheCount >= 3) {
      this.endGame();
      return;
    }

    // Apply catastrophe effects using new format
    CardEffects.applyCatastropheEffects(this, this.currentAge);

    // Set to play phase so players can take their turns during this catastrophe round
    this.turnPhase = 'play';
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
    // Check turn restrictions from current age
    if (this.turnRestrictions && this.turnRestrictions.length > 0) {
      for (const restriction of this.turnRestrictions) {
        if (restriction.name === 'add_turn_restriction') {
          const { restricted_attribute, restricted_value, restricted_type } = restriction.params;

          if (restricted_attribute === 'color') {
            // Color restriction
            if (restricted_type === 'equal' && DeckManager.isColor(card, restricted_value)) {
              return { canPlay: false, reason: `Cannot play ${restricted_value} traits this round` };
            }
          } else if (restricted_attribute === 'face_value') {
            // Face value restriction
            const faceValue = DeckManager.getFaceValue(card, this, player);
            if (restricted_type === 'greater_than' && faceValue > restricted_value) {
              return { canPlay: false, reason: `Cannot play traits with face value greater than ${restricted_value}` };
            }
            if (restricted_type === 'less_than' && faceValue < restricted_value) {
              return { canPlay: false, reason: `Cannot play traits with face value less than ${restricted_value}` };
            }
          }
        } else if (restriction.name === 'cannot_play_same_color') {
          // Natural Harmony: cannot play same color as last trait played
          if (this.lastPlayedTraitColor && DeckManager.isColor(card, this.lastPlayedTraitColor)) {
            return { canPlay: false, reason: `Cannot play same color as last trait (${this.lastPlayedTraitColor})` };
          }
        }
      }
    }

    // Check dominant limit (max 2)
    if (DeckManager.isDominant(card) && this.countDominants(player) >= 2) {
      return { canPlay: false, reason: 'Already have 2 dominant traits' };
    }

    // Check Age effect extra play restrictions (GALACTIC DRIFT / HIGH TIDES)
    if (player.mustPlayColorless && !DeckManager.isColor(card, 'Colorless')) {
      return { canPlay: false, reason: 'Must play a colorless trait (Galactic Drift)' };
    }
    if (player.mustPlayEffectless && !this.isEffectlessTrait(card)) {
      return { canPlay: false, reason: 'Must play an effectless trait (High Tides)' };
    }

    // Check play conditions from card's playConditions array
    const conditionCheck = this.checkPlayConditions(player, card);
    if (!conditionCheck.canPlay) {
      return conditionCheck;
    }

    return { canPlay: true };
  }

  // Check card-specific play conditions using playConditions array
  checkPlayConditions(player, card) {
    if (!card.playConditions || card.playConditions.length === 0) {
      return { canPlay: true };
    }

    for (const condition of card.playConditions) {
      const { name, params } = condition;

      switch (name) {
        case 'at_least_n_traits':
          // Check if player has at least N traits of a color
          const count = params.color
            ? player.traitPile.filter(c => DeckManager.isColor(c, params.color)).length
            : player.traitPile.length;
          if (count < params.num_traits) {
            const colorText = params.color ? `${params.color} ` : '';
            return {
              canPlay: false,
              reason: card.requirementDescription || `Requires ${params.num_traits} ${colorText}traits in your trait pile`
            };
          }
          break;

        default:
          // Unknown condition type
          break;
      }
    }

    return { canPlay: true };
  }

  // Check if a trait card is "effectless" (no actions, effects, or bonusPoints)
  isEffectlessTrait(card) {
    const hasActions = card.actions && card.actions.length > 0;
    const hasEffects = card.effects && card.effects.length > 0;
    const hasBonusPoints = card.bonusPoints && Object.keys(card.bonusPoints).length > 0;
    const hasWorldsEnd = card.worldsEnd || card.worldsEndEffect;
    const hasPersistent = card.persistent || card.persistentEffect;

    return !hasActions && !hasEffects && !hasBonusPoints && !hasWorldsEnd && !hasPersistent;
  }

  // Check and grant bonus plays from Age effects (GALACTIC DRIFT / HIGH TIDES)
  checkAgeEffectBonusPlays(player, card) {
    // GALACTIC DRIFT: Playing colorless allows one additional colorless play
    if (this.colorlessAllowsExtraPlay && !player.colorlessExtraPlayUsed) {
      if (DeckManager.isColor(card, 'Colorless')) {
        // Check if player has another colorless card they can play
        const hasColorless = player.hand.some(c =>
          DeckManager.isColor(c, 'Colorless') && this.canPlayCard(player, c).canPlay
        );
        if (hasColorless) {
          player.extraPlays = (player.extraPlays || 0) + 1;
          player.colorlessExtraPlayUsed = true;
          player.mustPlayColorless = true; // Track that extra play must be colorless
          this.log(`${player.name} may play another colorless trait (Galactic Drift)`);
        }
      }
    }

    // HIGH TIDES: Playing effectless allows one additional effectless play
    if (this.effectlessAllowsExtraPlay && !player.effectlessExtraPlayUsed) {
      if (this.isEffectlessTrait(card)) {
        // Check if player has another effectless card they can play
        const hasEffectless = player.hand.some(c =>
          this.isEffectlessTrait(c) && this.canPlayCard(player, c).canPlay
        );
        if (hasEffectless) {
          player.extraPlays = (player.extraPlays || 0) + 1;
          player.effectlessExtraPlayUsed = true;
          player.mustPlayEffectless = true; // Track that extra play must be effectless
          this.log(`${player.name} may play another effectless trait (High Tides)`);
        }
      }
    }
  }

  // Remove a trait from a player's pile and apply remove effects (reverse gene pool changes)
  removeTraitFromPile(player, cardIndex) {
    if (cardIndex < 0 || cardIndex >= player.traitPile.length) return null;

    const card = player.traitPile.splice(cardIndex, 1)[0];

    // Apply remove effects from the removeEffects array
    if (card.removeEffects && card.removeEffects.length > 0) {
      for (const effect of card.removeEffects) {
        if (effect.name === 'modify_gene_pool') {
          const { affected_players, value } = effect.params;

          if (affected_players === 'self') {
            player.genePool = Math.max(1, Math.min(8, player.genePool + value));
            this.log(`${player.name}'s Gene Pool changed to ${player.genePool} (${card.name} removed)`);
          } else if (affected_players === 'all') {
            for (const p of this.players) {
              p.genePool = Math.max(1, Math.min(8, p.genePool + value));
            }
            this.log(`All Gene Pools adjusted (${card.name} removed)`);
          } else if (affected_players === 'opponents') {
            for (const p of this.players) {
              if (p.id !== player.id) {
                p.genePool = Math.max(1, Math.min(8, p.genePool + value));
              }
            }
            this.log(`Opponents' Gene Pools adjusted (${card.name} removed)`);
          }
        }
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

    // Check if player has extra plays from traits like Propagation
    const hasExtraPlays = player.extraPlays && player.extraPlays > 0;
    if (!hasExtraPlays && this.playersPlayedThisRound.has(playerId)) {
      return { success: false, error: 'Already played' };
    }

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
    this.log(`${player.name} played ${card.name}`);

    // Track last played trait color for Natural Harmony age restriction
    this.lastPlayedTraitColor = card.color;

    // Track plays
    if (hasExtraPlays) {
      player.extraPlays--;
      // Reset Age effect extra play restrictions after using the extra play
      if (player.mustPlayColorless) {
        player.mustPlayColorless = false;
      }
      if (player.mustPlayEffectless) {
        player.mustPlayEffectless = false;
      }
    } else {
      this.playersPlayedThisRound.add(playerId);
    }

    // Apply effects from trait's effects array (e.g., modify_gene_pool)
    if (card.effects && card.effects.length > 0) {
      for (const effect of card.effects) {
        if (effect.name === 'modify_gene_pool') {
          const { affected_players, value } = effect.params;
          if (affected_players === 'self') {
            player.genePool = Math.max(1, Math.min(8, player.genePool + value));
            this.log(`${player.name}'s Gene Pool is now ${player.genePool}`);
          } else if (affected_players === 'all') {
            for (const p of this.players) {
              p.genePool = Math.max(1, Math.min(8, p.genePool + value));
            }
            this.log(`All Gene Pools modified by ${value > 0 ? '+' : ''}${value}`);
          } else if (affected_players === 'opponents') {
            for (const p of this.players) {
              if (p.id !== player.id) {
                p.genePool = Math.max(1, Math.min(8, p.genePool + value));
              }
            }
            this.log(`Opponents' Gene Pools modified by ${value > 0 ? '+' : ''}${value}`);
          }
        } else if (effect.name === 'discard_hand') {
          this.discardPile.push(...player.hand);
          player.hand = [];
          this.log(`${player.name} discarded their hand`);
        } else if (effect.name === 'skip_stabilization') {
          player.skipStabilize = true;
        }
      }
    }

    // Handle action effects (unless ignored by age effect)
    if (DeckManager.hasAction(card) && !this.ignoreActions && !player.ignoreActionsOnExtraPlays) {
      const effectResult = CardEffects.handleAction(this, player, card);
      if (effectResult.needsInput) {
        this.pendingAction = { type: 'action', card, player: playerId, ...effectResult };
        player.needsStabilize = true;
        return { success: true, needsInput: true, inputType: effectResult.inputType };
      }
    }

    // Check for Age effect bonus plays (GALACTIC DRIFT / HIGH TIDES)
    this.checkAgeEffectBonusPlays(player, card);

    // Check for more extra plays
    if (player.extraPlays && player.extraPlays > 0) {
      // Stay in play phase for extra plays
      return { success: true, extraPlays: player.extraPlays };
    }

    // Reset extra play tracking
    player.extraPlays = 0;
    player.ignoreActionsOnExtraPlays = false;

    // Mark player needs to stabilize and move to stabilize phase
    player.needsStabilize = !player.skipStabilize;
    player.skipStabilize = false;
    this.turnPhase = 'stabilize';
    return { success: true, needsStabilize: player.needsStabilize };
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

    // Check for draw after stabilize effect (Coastal Formations)
    if (this.drawAfterStabilize && this.drawAfterStabilize > 0) {
      const drawn = this.drawCards(this.drawAfterStabilize);
      player.hand.push(...drawn);
      this.log(`${player.name} drew ${this.drawAfterStabilize} card(s) after stabilizing`);
    }

    player.needsStabilize = false;
    this.advanceTurn();
    return { success: true };
  }

  // Skip stabilization entirely (PROSPERITY age effect)
  skipStabilization(playerId) {
    const player = this.getPlayer(playerId);
    if (!player) return { success: false, error: 'Player not found' };

    const currentPlayer = this.players[this.currentPlayerIndex];
    if (currentPlayer.id !== playerId) return { success: false, error: 'Not your turn' };
    if (this.turnPhase !== 'stabilize') return { success: false, error: 'Not stabilize phase' };

    // Only allowed if optionalStabilization is active (PROSPERITY)
    if (!this.optionalStabilization) {
      return { success: false, error: 'Cannot skip stabilization this round' };
    }

    this.log(`${player.name} chose not to stabilize (Prosperity)`);
    player.needsStabilize = false;
    this.advanceTurn();
    return { success: true };
  }

  // Pre-stabilize discard (ENLIGHTENMENT age effect)
  preStabilizeDiscard(playerId, discardIndices = []) {
    const player = this.getPlayer(playerId);
    if (!player) return { success: false, error: 'Player not found' };

    const currentPlayer = this.players[this.currentPlayerIndex];
    if (currentPlayer.id !== playerId) return { success: false, error: 'Not your turn' };
    if (this.turnPhase !== 'stabilize') return { success: false, error: 'Not stabilize phase' };

    // Only allowed if optionalDiscardBeforeStabilize is active (ENLIGHTENMENT)
    if (!this.optionalDiscardBeforeStabilize) {
      return { success: false, error: 'Cannot discard before stabilizing this round' };
    }

    // Validate discard count
    if (discardIndices.length > this.optionalDiscardBeforeStabilize) {
      return { success: false, error: `Can only discard up to ${this.optionalDiscardBeforeStabilize} cards` };
    }

    if (discardIndices.length === 0) {
      // Player chose not to discard anything
      return { success: true, message: 'No cards discarded' };
    }

    // Discard selected cards
    discardIndices.sort((a, b) => b - a);
    for (const idx of discardIndices) {
      if (idx >= 0 && idx < player.hand.length) {
        this.discardPile.push(player.hand.splice(idx, 1)[0]);
      }
    }
    this.log(`${player.name} discarded ${discardIndices.length} card(s) before stabilizing (Enlightenment)`);

    // Mark that pre-stabilize discard has been used
    player.preStabilizeDiscardUsed = true;
    return { success: true };
  }

  // Get next age preview (AWAKENING age effect)
  getNextAgePreview(playerId) {
    const player = this.getPlayer(playerId);
    if (!player) return { success: false, error: 'Player not found' };

    // Only show preview if previewNextAge is active (AWAKENING)
    if (!this.previewNextAge) {
      return { success: false, error: 'Age preview not available' };
    }

    // Peek at the top card of the age deck
    if (this.ageDeck.length === 0) {
      return { success: true, preview: null, message: 'No more ages in deck' };
    }

    const nextAge = this.ageDeck[0];
    return {
      success: true,
      preview: {
        name: nextAge.name,
        type: nextAge.type,
        description: nextAge.description || null
      }
    };
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

  // ============== MULTI-PLAYER ACTION HANDLING ==============

  // Submit a response for a multi-player action (e.g., opponent reveals a card)
  submitMultiPlayerResponse(playerId, response) {
    const mpa = this.multiPlayerAction;
    if (!mpa) {
      return { success: false, error: 'No multi-player action in progress' };
    }

    const participant = mpa.participants[playerId];
    if (!participant) {
      return { success: false, error: 'You are not a participant in this action' };
    }

    if (participant.responded) {
      return { success: false, error: 'You have already responded' };
    }

    const player = this.getPlayer(playerId);

    // Handle different multi-player action types
    switch (mpa.type) {
      case 'reveal_cards': {
        const cardIndex = response.cardIndex;
        if (cardIndex < 0 || cardIndex >= player.hand.length) {
          return { success: false, error: 'Invalid card index' };
        }

        const card = player.hand[cardIndex];

        // Store the response - copy card data for display to others
        participant.responded = true;
        participant.response = {
          cardIndex,
          card: {
            name: card.name,
            color: card.color,
            faceValue: card.faceValue,
            instanceId: card.instanceId,
            isDominant: card.isDominant,
            actionDescription: card.actionDescription,
            bonusDescription: card.bonusDescription
          }
        };

        this.log(`${player.name} revealed a card`);
        break;
      }

      default:
        return { success: false, error: `Unknown multi-player action type: ${mpa.type}` };
    }

    // Check if all participants have responded
    const allResponded = Object.values(mpa.participants).every(p => p.responded);

    if (allResponded) {
      return this.resolveMultiPlayerAction();
    }

    return { success: true, waiting: true };
  }

  // Resolve a completed multi-player action
  resolveMultiPlayerAction() {
    const mpa = this.multiPlayerAction;
    if (!mpa) {
      return { success: false, error: 'No multi-player action to resolve' };
    }

    const sourcePlayer = this.getPlayer(mpa.sourcePlayerId);
    if (!sourcePlayer) {
      this.multiPlayerAction = null;
      return { success: false, error: 'Source player not found' };
    }

    switch (mpa.config.nextAction) {
      case 'steal_revealed_and_play': {
        // Collect all revealed cards
        const revealedCards = [];
        for (const [participantId, participant] of Object.entries(mpa.participants)) {
          if (participant.response) {
            revealedCards.push({
              playerId: participantId,
              playerName: participant.playerName,
              cardIndex: participant.response.cardIndex,
              card: participant.response.card
            });
          }
        }

        if (revealedCards.length === 0) {
          this.log('No cards were revealed');
          this.multiPlayerAction = null;
          this.turnPhase = 'stabilize';
          return { success: true };
        }

        // Set up pending action for source player to select a revealed card
        this.pendingAction = {
          player: mpa.sourcePlayerId,
          type: 'select_revealed_card',
          inputType: 'select_revealed_card',
          message: 'Choose a revealed card to steal and play immediately',
          revealedCards,
          effectType: 'steal_revealed_and_play',
          optional: false
        };

        // Clear multiPlayerAction so getStateForPlayer uses pendingAction
        this.multiPlayerAction = null;

        this.log(`${sourcePlayer.name} must choose a revealed card to steal`);
        return { success: true, proceedToSteal: true };
      }

      default:
        this.multiPlayerAction = null;
        return { success: false, error: `Unknown next action: ${mpa.config.nextAction}` };
    }
  }

  // Handle selection of a revealed card to steal and play
  handleRevealedCardSelection(playerId, data) {
    if (!this.pendingAction ||
        this.pendingAction.player !== playerId ||
        this.pendingAction.effectType !== 'steal_revealed_and_play') {
      return { success: false, error: 'No pending steal action' };
    }

    const { fromPlayerId, cardIndex } = data;
    const sourcePlayer = this.getPlayer(playerId);
    const targetPlayer = this.getPlayer(fromPlayerId);

    if (!targetPlayer) {
      return { success: false, error: 'Target player not found' };
    }

    // Validate the card is still at the expected index
    if (cardIndex < 0 || cardIndex >= targetPlayer.hand.length) {
      return { success: false, error: 'Card no longer available' };
    }

    // Steal the card from target's hand
    const stolenCard = targetPlayer.hand.splice(cardIndex, 1)[0];

    this.log(`${sourcePlayer.name} stole ${stolenCard.name} from ${targetPlayer.name}`);

    // Add the stolen card to source player's trait pile
    sourcePlayer.traitPile.push(stolenCard);

    // Apply gene pool effects from the card (if any)
    if (stolenCard.effects) {
      for (const effect of stolenCard.effects) {
        if (effect.name === 'modify_gene_pool') {
          const targets = effect.params.affected_players === 'all' ? this.players :
                         effect.params.affected_players === 'self' ? [sourcePlayer] :
                         [sourcePlayer];
          for (const p of targets) {
            p.genePool = Math.max(1, Math.min(8, p.genePool + effect.params.value));
          }
          this.log(`${sourcePlayer.name}'s Gene Pool is now ${sourcePlayer.genePool}`);
        }
      }
    }

    // Clear the multi-player action
    this.multiPlayerAction = null;
    this.pendingAction = null;

    // If the stolen card has actions, trigger them
    if (stolenCard.actions && stolenCard.actions.length > 0 && !this.ignoreActions) {
      this.log(`${sourcePlayer.name} plays ${stolenCard.name}'s action`);
      const actionResult = CardEffects.handleAction(this, sourcePlayer, stolenCard);

      if (actionResult.needsInput) {
        this.pendingAction = {
          player: sourcePlayer.id,
          ...actionResult
        };
        return { success: true, actionPending: true };
      }
    }

    // Move to stabilize phase
    this.turnPhase = 'stabilize';
    return { success: true };
  }

  // Force timeout for multi-player action (auto-reveal random cards)
  forceMultiPlayerActionTimeout() {
    const mpa = this.multiPlayerAction;
    if (!mpa) return { success: false };

    // For any participant who hasn't responded, auto-select a random card
    for (const [participantId, participant] of Object.entries(mpa.participants)) {
      if (!participant.responded) {
        const player = this.getPlayer(participantId);
        if (player && player.hand.length > 0) {
          const randomIndex = Math.floor(Math.random() * player.hand.length);
          this.submitMultiPlayerResponse(participantId, { cardIndex: randomIndex });
        } else {
          // Player has no cards, mark as responded with null
          participant.responded = true;
          participant.response = null;
        }
      }
    }

    return { success: true };
  }

  endGame() {
    this.state = 'finished';
    this.turnPhase = 'finished';

    // Apply final catastrophe's gene pool effect
    if (this.currentAge.genePoolEffect) {
      const effect = this.currentAge.genePoolEffect;
      for (const player of this.players) {
        player.genePool = Math.max(1, Math.min(8, player.genePool + effect));
      }
    }

    // Apply World's End effects from traits (in turn order starting from first player)
    this.log("Resolving World's End effects...");
    for (let i = 0; i < this.players.length; i++) {
      const playerIdx = (this.firstPlayerIndex + i) % this.players.length;
      const player = this.players[playerIdx];

      for (const card of player.traitPile) {
        if (card.worldsEnd && card.worldsEndEffect) {
          this.applyTraitWorldsEndEffect(player, card);
        }
      }
    }

    // Apply final catastrophe's World's End effect
    if (this.currentAge.worldEndEffect) {
      this.log(`Final Catastrophe: ${this.currentAge.description || 'Special effect'}`);
      CardEffects.applyWorldEndEffect(this, this.currentAge);
    }

    // Calculate final scores (including worldEndBonus from catastrophe effects)
    for (const player of this.players) {
      player.score = Scoring.calculateScore(this, player) + (player.worldEndBonus || 0);
    }

    const winner = [...this.players].sort((a, b) => b.score - a.score)[0];
    this.log(`GAME OVER! Winner: ${winner.name} with ${winner.score} points!`);
  }

  // Apply World's End effects from traits
  applyTraitWorldsEndEffect(player, card) {
    if (!card.worldsEndEffect) return;

    const { name, params } = card.worldsEndEffect;

    switch (name) {
      case 'worlds_end_draw':
        const drawCount = params.value || 2;
        player.hand.push(...this.drawCards(drawCount));
        this.log(`${player.name}: ${card.name} - Drew ${drawCount} cards`);
        break;

      case 'draw_at_end':
        const count = params.value || 3;
        player.hand.push(...this.drawCards(count));
        this.log(`${player.name}: ${card.name} - Drew ${count} cards`);
        break;

      case 'may_change_color':
        // This would need UI interaction, for now just log
        this.log(`${player.name}: ${card.name} - May become any color`);
        break;

      case 'play_from_hand':
        // Play all remaining traits from hand
        const traitsToPlay = player.hand.filter(c => !DeckManager.isDominant(c) || this.countDominants(player) < 2);
        for (const trait of traitsToPlay) {
          const idx = player.hand.indexOf(trait);
          if (idx !== -1) {
            player.hand.splice(idx, 1);
            player.traitPile.push(trait);
            this.log(`${player.name}: ${card.name} - Played ${trait.name}`);
          }
        }
        break;

      case 'choose_color':
        // This would need UI interaction, for now just log
        this.log(`${player.name}: ${card.name} - Choose color at World's End`);
        break;

      case 'choose_color_for_bonus':
        // Store chosen color on player for Sentience bonus calculation
        // This would need UI interaction - for now, auto-choose the most common color
        const colorCounts = {
          Red: Scoring.countColor(player.traitPile, 'Red'),
          Blue: Scoring.countColor(player.traitPile, 'Blue'),
          Green: Scoring.countColor(player.traitPile, 'Green'),
          Purple: Scoring.countColor(player.traitPile, 'Purple')
        };
        const bestColor = Object.keys(colorCounts).reduce((a, b) => colorCounts[a] > colorCounts[b] ? a : b);
        player.sentienceChosenColor = bestColor;
        this.log(`${player.name}: ${card.name} - Auto-chose ${bestColor} (${colorCounts[bestColor]} traits)`);
        break;

      case 'steal_trait_at_end':
        // This would need UI interaction, for now just log
        this.log(`${player.name}: ${card.name} - May steal a non-dominant trait`);
        break;

      case 'play_from_hand_at_end':
        // Special case: If this specific card is in hand at World's End, you may play it
        const cardName = params.card_name || card.name;
        const cardInHand = player.hand.find(c => c.name === cardName);
        if (cardInHand) {
          const idx = player.hand.indexOf(cardInHand);
          player.hand.splice(idx, 1);
          player.traitPile.push(cardInHand);
          this.log(`${player.name}: Played ${cardName} from hand at World's End`);
        }
        break;

      case 'choose_catastrophe_world_end':
        // This would need UI interaction to let player choose from the 3 catastrophes
        this.log(`${player.name}: ${card.name} - Choose a World's End effect from the 3 catastrophes`);
        // TODO: Implement UI to let player select which catastrophe World's End effect to apply
        break;

      default:
        this.log(`Unknown World's End effect: ${name}`);
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
      turnRestrictions: this.turnRestrictions || [],
      // Age effect flags
      ageEffects: {
        optionalStabilization: this.optionalStabilization || false,
        optionalDiscardBeforeStabilize: this.optionalDiscardBeforeStabilize || 0,
        colorlessAllowsExtraPlay: this.colorlessAllowsExtraPlay || false,
        effectlessAllowsExtraPlay: this.effectlessAllowsExtraPlay || false,
        previewNextAge: this.previewNextAge || false,
        protectTraitsThisRound: this.protectTraitsThisRound || false
      },
      players: this.players.map((p, idx) => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        ready: p.ready,
        hand: p.hand,
        traitPile: p.traitPile,
        score: Scoring.calculateScore(this, p),
        genePool: p.genePool, // Player's target hand size
        hasPlayedThisRound: this.playersPlayedThisRound.has(p.id),
        needsStabilize: p.needsStabilize || false,
        extraPlays: p.extraPlays || 0,
        turnOrder: (idx - this.firstPlayerIndex + this.players.length) % this.players.length,
        mustPlayColorless: p.mustPlayColorless || false,
        mustPlayEffectless: p.mustPlayEffectless || false,
        preStabilizeDiscardUsed: p.preStabilizeDiscardUsed || false
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

    // Get next age preview if AWAKENING effect is active and it's player's turn
    let nextAgePreview = null;
    const isMyTurn = this.players[this.currentPlayerIndex]?.id === playerId;
    if (this.previewNextAge && isMyTurn && this.ageDeck.length > 0) {
      const nextAge = this.ageDeck[0];
      nextAgePreview = {
        name: nextAge.name,
        type: nextAge.type,
        description: nextAge.description || null
      };
    }

    // Build pending action for this specific player
    let pendingActionForPlayer = null;

    // First check if there's a multi-player action that involves this player
    if (this.multiPlayerAction) {
      const mpa = this.multiPlayerAction;
      const isSource = mpa.sourcePlayerId === playerId;
      const participant = mpa.participants[playerId];

      if (isSource) {
        // Source player sees waiting status with participant progress
        const participantStatus = Object.entries(mpa.participants).map(([id, p]) => ({
          playerId: id,
          playerName: p.playerName,
          responded: p.responded
        }));

        // Build revealed cards array for display
        const revealedCards = [];
        for (const [pid, p] of Object.entries(mpa.participants)) {
          if (p.responded && p.response && p.response.card) {
            revealedCards.push({
              playerId: pid,
              playerName: p.playerName,
              cardIndex: p.response.cardIndex,
              card: p.response.card
            });
          }
        }

        pendingActionForPlayer = {
          inputType: 'waiting_for_reveals',
          message: `Waiting for opponents to reveal cards...`,
          multiPlayerActionId: mpa.id,
          sourceCard: mpa.sourceCard,
          participants: participantStatus,
          revealedCards,
          allResponded: participantStatus.every(p => p.responded)
        };
      } else if (participant && !participant.responded) {
        // This player is a participant who needs to reveal a card
        pendingActionForPlayer = {
          inputType: 'reveal_card',
          message: `${mpa.sourcePlayerName} played ${mpa.sourceCard.name}. Select a card to reveal.`,
          multiPlayerActionId: mpa.id,
          sourcePlayerName: mpa.sourcePlayerName,
          sourceCard: mpa.sourceCard,
          cards: player.hand.map((c, i) => ({
            index: i,
            name: c.name,
            color: c.color,
            faceValue: c.faceValue
          }))
        };
      }
      // If participant already responded, they just wait (no pending action for them)
    }

    // If no multi-player action applies, check regular pending action
    if (!pendingActionForPlayer && this.pendingAction?.player === playerId) {
      pendingActionForPlayer = {
        type: this.pendingAction.type,
        inputType: this.pendingAction.inputType,
        options: this.pendingAction.options,
        cards: this.pendingAction.cards,
        message: this.pendingAction.message,
        optional: this.pendingAction.optional,
        count: this.pendingAction.count,
        // Include revealed cards for steal selection
        revealedCards: this.pendingAction.revealedCards || null,
        effectType: this.pendingAction.effectType
      };
    }

    return {
      ...fullState,
      myHand: player ? player.hand : [],
      myTraitPile: player ? player.traitPile : [],
      myScore: player ? Scoring.calculateScore(this, player) : 0,
      myGenePool: player ? player.genePool : 5, // Target hand size
      myExtraPlays: player ? (player.extraPlays || 0) : 0,
      isMyTurn,
      currentPlayerId: this.players[this.currentPlayerIndex]?.id,
      canPlayAny,
      needsDiscard,
      willDraw,
      nextAgePreview,
      // Player-specific age effect state
      myMustPlayColorless: player?.mustPlayColorless || false,
      myMustPlayEffectless: player?.mustPlayEffectless || false,
      myPreStabilizeDiscardUsed: player?.preStabilizeDiscardUsed || false,
      players: fullState.players.map(p => ({
        ...p,
        hand: undefined, // Hide other players' hands
        handSize: p.hand ? p.hand.length : 0,
        isCurrentPlayer: this.players[this.currentPlayerIndex]?.id === p.id
      })),
      pendingAction: pendingActionForPlayer,
      // Include multi-player action info for UI (e.g., showing who is waiting)
      multiPlayerAction: this.multiPlayerAction ? {
        id: this.multiPlayerAction.id,
        type: this.multiPlayerAction.type,
        sourcePlayerName: this.multiPlayerAction.sourcePlayerName,
        sourceCard: this.multiPlayerAction.sourceCard
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
      turnRestrictions: this.turnRestrictions,
      ignoreActions: this.ignoreActions,
      overrideStabilizeTarget: this.overrideStabilizeTarget,
      cardsPerTurn: this.cardsPerTurn,
      playersPlayedThisRound: [...this.playersPlayedThisRound],
      // Age effect flags
      optionalStabilization: this.optionalStabilization,
      optionalDiscardBeforeStabilize: this.optionalDiscardBeforeStabilize,
      colorlessAllowsExtraPlay: this.colorlessAllowsExtraPlay,
      effectlessAllowsExtraPlay: this.effectlessAllowsExtraPlay,
      previewNextAge: this.previewNextAge,
      protectTraitsThisRound: this.protectTraitsThisRound,
      drawAfterStabilize: this.drawAfterStabilize,
      lastPlayedTraitColor: this.lastPlayedTraitColor,
      multiPlayerAction: this.multiPlayerAction
    });
  }

  // Deserialize from network
  static deserialize(data) {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    const game = new GameState(parsed.gameId);
    Object.assign(game, parsed);
    game.playersPlayedThisRound = new Set(parsed.playersPlayedThisRound || []);
    game.firstPlayerIndex = parsed.firstPlayerIndex || 0;
    game.turnRestrictions = parsed.turnRestrictions || [];
    game.ignoreActions = parsed.ignoreActions || false;
    game.overrideStabilizeTarget = parsed.overrideStabilizeTarget || null;
    game.cardsPerTurn = parsed.cardsPerTurn || 1;
    // Age effect flags
    game.optionalStabilization = parsed.optionalStabilization || false;
    game.optionalDiscardBeforeStabilize = parsed.optionalDiscardBeforeStabilize || 0;
    game.colorlessAllowsExtraPlay = parsed.colorlessAllowsExtraPlay || false;
    game.effectlessAllowsExtraPlay = parsed.effectlessAllowsExtraPlay || false;
    game.previewNextAge = parsed.previewNextAge || false;
    game.protectTraitsThisRound = parsed.protectTraitsThisRound || false;
    game.drawAfterStabilize = parsed.drawAfterStabilize || 0;
    game.lastPlayedTraitColor = parsed.lastPlayedTraitColor || null;
    game.multiPlayerAction = parsed.multiPlayerAction || null;
    return game;
  }
}
