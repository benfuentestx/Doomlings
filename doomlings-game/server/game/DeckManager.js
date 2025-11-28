const classicCards = require('../data/classicCards');
const { birthOfLife, ageCards, catastrophes } = require('../data/ageCards');

class DeckManager {
  // Fisher-Yates shuffle
  static shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Create the Age deck according to official rules:
  // - Birth of Life on top
  // - 28 age cards split into 3 piles
  // - 1 catastrophe shuffled into each pile
  // - Piles stacked together
  static createAgeDeck() {
    // Copy and shuffle age cards
    const ages = [...ageCards];
    this.shuffle(ages);

    // Copy and shuffle catastrophes, take 3
    const cats = [...catastrophes];
    this.shuffle(cats);
    const selectedCatastrophes = cats.slice(0, 3);

    // Split ages into 3 roughly equal piles (9-10 cards each)
    const pile1 = ages.slice(0, 9);
    const pile2 = ages.slice(9, 19);
    const pile3 = ages.slice(19, 28);

    // Add one catastrophe to each pile
    pile1.push(selectedCatastrophes[0]);
    pile2.push(selectedCatastrophes[1]);
    pile3.push(selectedCatastrophes[2]);

    // Shuffle each pile
    this.shuffle(pile1);
    this.shuffle(pile2);
    this.shuffle(pile3);

    // Stack piles (pile1 on top, then pile2, then pile3)
    // Birth of Life goes on top of everything
    return [birthOfLife, ...pile1, ...pile2, ...pile3];
  }

  // Create the Trait deck from Classic cards
  // Respects the n_cards field for number of copies
  static createTraitDeck() {
    const deck = [];

    for (const card of classicCards) {
      // Skip cards not meant to be in game
      if (card.in_game !== 'yes') continue;

      // Add the appropriate number of copies
      const copies = card.n_cards || 1;
      for (let i = 0; i < copies; i++) {
        // Create a copy with a unique instance id
        deck.push({
          ...card,
          instanceId: `${card.trait}_${i}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
      }
    }

    return deck;
  }

  // Draw cards from deck
  static drawFromDeck(deck, count) {
    const drawn = [];
    for (let i = 0; i < count && deck.length > 0; i++) {
      drawn.push(deck.shift());
    }
    return drawn;
  }

  // Get a card's display color class
  static getColorClass(card) {
    const color = card.color || 'Colorless';

    // Handle multi-color cards
    if (color.includes('_')) {
      return 'multi';
    }

    return color.toLowerCase();
  }

  // Get card's numeric face value (handling special values)
  static getFaceValue(card, gameState = null, player = null) {
    const face = card.face;

    // Numeric value
    if (typeof face === 'number') {
      return face;
    }

    // Variable values
    if (face === 'variable') {
      // Will be calculated by Scoring based on card effect
      return 0;
    }

    if (face === 'copy_1st_dominant') {
      // Copy the face value of the first dominant card
      if (player && player.traitPile) {
        const firstDominant = player.traitPile.find(c => c.dominant);
        if (firstDominant && firstDominant.instanceId !== card.instanceId) {
          return this.getFaceValue(firstDominant, gameState, player);
        }
      }
      return 0;
    }

    return 0;
  }

  // Check if a card is a specific color
  static isColor(card, targetColor) {
    const cardColor = card.color || 'Colorless';

    if (targetColor === 'Colorless') {
      return cardColor === 'Colorless';
    }

    // Check for exact match or multi-color containing this color
    return cardColor === targetColor || cardColor.includes(targetColor);
  }

  // Get all colors of a card (for multi-color)
  static getColors(card) {
    const colorStr = card.color || 'Colorless';
    return colorStr.split('_');
  }
}

module.exports = DeckManager;
