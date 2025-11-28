const DeckManager = require('./DeckManager');

class Scoring {
  // Calculate total score for a player
  static calculateScore(gameState, player) {
    let total = 0;

    // Calculate base scores and bonuses for each trait
    for (const card of player.traitPile) {
      // Get base face value
      let cardScore = this.getBaseFaceValue(card, gameState, player);

      // Add drop effect bonuses
      if (card.drops && card.drop_effect) {
        cardScore += this.calculateDropEffect(card, gameState, player);
      }

      total += cardScore;
    }

    // Add gene pool bonuses
    total += this.calculateGenePoolBonus(gameState, player);

    return total;
  }

  // Get the base face value of a card
  static getBaseFaceValue(card, gameState, player) {
    const face = card.face;

    // Numeric value
    if (typeof face === 'number') {
      return face;
    }

    // Variable face values handled in drop effects
    if (face === 'variable') {
      return 0; // Base is 0, actual value comes from drop effect
    }

    if (face === 'copy_1st_dominant') {
      // Copy face value of first dominant
      const firstDominant = player.traitPile.find(c =>
        c.dominant && c.instanceId !== card.instanceId
      );
      if (firstDominant) {
        return this.getBaseFaceValue(firstDominant, gameState, player);
      }
      return 0;
    }

    return 0;
  }

  // Calculate drop effect bonus
  static calculateDropEffect(card, gameState, player) {
    const effect = card.drop_effect;
    if (!effect) return 0;

    // Parse effect string: "value target condition scope"
    const parts = effect.split(' ');
    if (parts.length < 2) return 0;

    const valueStr = parts[0];
    const target = parts[1];   // self, opponents
    const condition = parts[2] || '';
    const scope = parts[3] || 'own';

    let bonus = 0;

    // Determine multiplier or condition
    switch (condition) {
      // Count-based conditions
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
        // Count pairs in other players' piles
        bonus = this.countValue(valueStr, this.countGreenPairsOthers(gameState, player));
        break;

      case 'n_color_worlds_end':
        // Score based on catastrophes and chosen color
        bonus = this.countValue(valueStr, gameState.catastropheCount);
        break;

      case 'n_kidney':
        // Count all Kidney cards across all players
        bonus = this.countValue(valueStr, this.countAllKidney(gameState));
        break;

      case 'n_swarm':
        // Count all Swarm cards
        bonus = this.countValue(valueStr, this.countAllSwarm(gameState));
        break;

      case 'cards_with_effects':
        bonus = this.countValue(valueStr, this.countCardsWithEffects(player.hand));
        break;

      case 'gene_pool':
        // Value equals total gene pool effect
        bonus = this.calculateGenePoolBonus(gameState, player);
        break;

      case 'lowest_color_count':
        bonus = this.countValue(valueStr, this.getLowestColorCount(player.traitPile));
        break;

      // Conditional bonuses
      case 'if_most_traits':
        if (this.hasMostTraits(gameState, player)) {
          bonus = parseInt(valueStr) || 0;
        }
        break;

      case 'if_green_most_traits':
        if (this.hasColorMostTraits(gameState, player, 'Green')) {
          bonus = parseInt(valueStr) || 0;
        }
        break;

      default:
        // Handle special cases
        if (effect === 'x') {
          // Heat Vision: variable (likely based on some condition)
          bonus = 0;
        }
        break;
    }

    // Apply to opponents if target is 'opponents'
    if (target === 'opponents') {
      // This reduces opponents' scores, which we handle in total calculation
      // For now, we return the negative bonus for the player
      return -bonus;
    }

    return bonus;
  }

  // Helper to calculate value based on 'n' (variable) or fixed number
  static countValue(valueStr, count) {
    if (valueStr === 'n') {
      return count;
    }
    const multiplier = parseInt(valueStr) || 0;
    return multiplier * count;
  }

  // Count cards of a specific color
  static countColor(cards, color) {
    return cards.filter(c => DeckManager.isColor(c, color)).length;
  }

  // Count negative face value cards
  static countNegative(cards, gameState, player) {
    return cards.filter(c => {
      const face = this.getBaseFaceValue(c, gameState, player);
      return face < 0;
    }).length;
  }

  // Count dominant cards
  static countDominant(cards) {
    return cards.filter(c => c.dominant).length;
  }

  // Count unique colors in cards
  static countUniqueColors(cards) {
    const colors = new Set();
    for (const card of cards) {
      const cardColors = DeckManager.getColors(card);
      cardColors.forEach(c => colors.add(c));
    }
    // Remove 'Colorless' as it's not a real color
    colors.delete('Colorless');
    return colors.size;
  }

  // Count cards with specific face value
  static countFaceValue(cards, targetValue, gameState, player) {
    return cards.filter(c => {
      const face = this.getBaseFaceValue(c, gameState, player);
      return face === targetValue;
    }).length;
  }

  // Count color pairs (cards with 2+ of same color)
  static countColorPairs(cards) {
    const colorCounts = { Red: 0, Blue: 0, Green: 0, Purple: 0 };
    for (const card of cards) {
      for (const color of DeckManager.getColors(card)) {
        if (colorCounts[color] !== undefined) {
          colorCounts[color]++;
        }
      }
    }
    let pairs = 0;
    for (const count of Object.values(colorCounts)) {
      pairs += Math.floor(count / 2);
    }
    return pairs;
  }

  // Count green pairs in other players' piles
  static countGreenPairsOthers(gameState, player) {
    let greenCount = 0;
    for (const p of gameState.players) {
      if (p.id !== player.id) {
        greenCount += this.countColor(p.traitPile, 'Green');
      }
    }
    return Math.floor(greenCount / 2);
  }

  // Count all Kidney cards
  static countAllKidney(gameState) {
    let count = 0;
    for (const p of gameState.players) {
      count += p.traitPile.filter(c => c.trait.includes('Kidney')).length;
    }
    return count;
  }

  // Count all Swarm cards
  static countAllSwarm(gameState) {
    let count = 0;
    for (const p of gameState.players) {
      count += p.traitPile.filter(c => c.trait.includes('Swarm')).length;
    }
    return count;
  }

  // Count cards with effects in hand
  static countCardsWithEffects(cards) {
    return cards.filter(c => c.action || c.dominant || c.drops || c.gene_pool).length;
  }

  // Get lowest color count
  static getLowestColorCount(cards) {
    const colorCounts = { Red: 0, Blue: 0, Green: 0, Purple: 0 };
    for (const card of cards) {
      for (const color of DeckManager.getColors(card)) {
        if (colorCounts[color] !== undefined) {
          colorCounts[color]++;
        }
      }
    }
    return Math.min(...Object.values(colorCounts));
  }

  // Check if player has most traits
  static hasMostTraits(gameState, player) {
    const myCount = player.traitPile.length;
    for (const p of gameState.players) {
      if (p.id !== player.id && p.traitPile.length >= myCount) {
        return false;
      }
    }
    return true;
  }

  // Check if player's color has most traits among that color
  static hasColorMostTraits(gameState, player, color) {
    const myCount = this.countColor(player.traitPile, color);
    for (const p of gameState.players) {
      if (p.id !== player.id) {
        const theirCount = this.countColor(p.traitPile, color);
        if (theirCount >= myCount) {
          return false;
        }
      }
    }
    return myCount > 0;
  }

  // Calculate gene pool bonus
  static calculateGenePoolBonus(gameState, player) {
    let bonus = 0;

    for (const card of player.traitPile) {
      if (!card.gene_pool) continue;

      const target = card.gene_pool_target || 'self';
      const effect = card.gene_pool_effect || 0;

      switch (target) {
        case 'self':
          // Add to own score
          bonus += effect;
          break;

        case 'all':
          // Affects all players (usually negative)
          // For now, we just apply to self
          bonus += effect;
          break;

        case 'opponent':
          // Would reduce opponent scores
          // Handled separately
          break;
      }
    }

    return bonus;
  }

  // Get detailed score breakdown for a player
  static getScoreBreakdown(gameState, player) {
    const breakdown = {
      traits: [],
      genePoolBonus: 0,
      total: 0
    };

    for (const card of player.traitPile) {
      const baseValue = this.getBaseFaceValue(card, gameState, player);
      const dropBonus = card.drops && card.drop_effect
        ? this.calculateDropEffect(card, gameState, player)
        : 0;

      breakdown.traits.push({
        name: card.trait,
        color: card.color,
        baseValue,
        dropBonus,
        total: baseValue + dropBonus
      });
    }

    breakdown.genePoolBonus = this.calculateGenePoolBonus(gameState, player);
    breakdown.total = this.calculateScore(gameState, player);

    return breakdown;
  }
}

module.exports = Scoring;
