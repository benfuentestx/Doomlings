const DeckManager = require('./DeckManager');
const CardEffects = require('./CardEffects');
const Scoring = require('./Scoring');

class GameState {
  constructor(gameId) {
    this.gameId = gameId;
    this.state = 'lobby'; // lobby, playing, finished
    this.players = [];
    this.currentPlayerIndex = 0;
    this.round = 0;
    this.catastropheCount = 0;

    // Decks
    this.ageDeck = [];
    this.traitDeck = [];
    this.discardPile = [];

    // Current age card
    this.currentAge = null;

    // Action log
    this.actionLog = [];

    // Pending action (for effects that require input)
    this.pendingAction = null;

    // Turn phase: 'draw', 'play', 'action', 'waiting'
    this.turnPhase = 'waiting';

    // Track which players have played this round
    this.playersPlayedThisRound = new Set();
  }

  addPlayer(socketId, name, isHost) {
    if (this.players.length >= 6) return null;

    const player = {
      id: socketId,
      name: name,
      isHost: isHost,
      ready: isHost, // Host is always ready
      hand: [],
      traitPile: [],
      score: 0,
      connected: true
    };

    this.players.push(player);
    return player;
  }

  removePlayer(socketId) {
    const index = this.players.findIndex(p => p.id === socketId);
    if (index !== -1) {
      this.players.splice(index, 1);
    }
  }

  getPlayer(socketId) {
    return this.players.find(p => p.id === socketId);
  }

  getPublicPlayerList() {
    return this.players.map(p => ({
      id: p.id,
      name: p.name,
      isHost: p.isHost,
      ready: p.ready
    }));
  }

  startGame() {
    this.state = 'playing';

    // Initialize decks
    this.ageDeck = DeckManager.createAgeDeck();
    this.traitDeck = DeckManager.createTraitDeck();

    // Shuffle trait deck
    DeckManager.shuffle(this.traitDeck);

    // Deal initial hands (7 cards each)
    for (const player of this.players) {
      player.hand = this.drawCards(7);
    }

    // Randomly select first player
    this.currentPlayerIndex = Math.floor(Math.random() * this.players.length);

    // Start first round
    this.startNewRound();

    this.log(`Game started with ${this.players.length} players!`);
  }

  startNewRound() {
    this.round++;
    this.playersPlayedThisRound.clear();

    // Reveal next age card
    if (this.ageDeck.length > 0) {
      this.currentAge = this.ageDeck.shift();

      if (this.currentAge.type === 'catastrophe') {
        this.handleCatastrophe();
      } else if (this.currentAge.type === 'birth') {
        this.log('The world begins! Birth of Life!');
        // Draw phase for first round
        this.turnPhase = 'draw';
        this.handleDrawPhase();
      } else {
        this.log(`${this.currentAge.name} - Draw ${this.currentAge.draw} cards`);
        this.turnPhase = 'draw';
        this.handleDrawPhase();
      }
    }
  }

  handleDrawPhase() {
    // All players draw cards based on current age
    const drawCount = this.currentAge.draw || 2;

    for (const player of this.players) {
      const drawnCards = this.drawCards(drawCount);
      player.hand.push(...drawnCards);
    }

    this.log(`All players drew ${drawCount} card${drawCount !== 1 ? 's' : ''}`);

    // Move to play phase
    this.turnPhase = 'play';
  }

  handleCatastrophe() {
    this.catastropheCount++;
    this.log(`CATASTROPHE ${this.catastropheCount}/3: ${this.currentAge.name}!`);
    this.log(this.currentAge.effect);

    // Apply catastrophe effect
    this.pendingAction = {
      type: 'catastrophe',
      catastrophe: this.currentAge,
      playersToResolve: [...this.players.map(p => p.id)],
      currentResolver: 0
    };

    // Check if game ends
    if (this.catastropheCount >= 3) {
      this.endGame();
      return;
    }

    // Start resolving catastrophe
    this.resolveCatastrophe();
  }

  resolveCatastrophe() {
    if (!this.pendingAction || this.pendingAction.type !== 'catastrophe') {
      this.startNewRound();
      return;
    }

    const action = this.pendingAction.catastrophe.action;

    // Handle catastrophe effects that need player input
    if (action === 'discard_trait' || action === 'discard_lowest' ||
        action === 'discard_colorless' || action === 'discard_color') {
      // Auto-resolve for each player
      for (const player of this.players) {
        CardEffects.applyCatastropheEffect(this, player, this.pendingAction.catastrophe);
      }
    } else if (action === 'discard_to_hand_limit') {
      // Players need to choose which cards to discard
      const needsInput = this.players.some(p => p.hand.length > this.pendingAction.catastrophe.limit);
      if (!needsInput) {
        this.pendingAction = null;
        this.startNewRound();
        return;
      }
      // Set up input requirement
      return;
    } else if (action === 'pass_cards') {
      // Auto-handle passing
      CardEffects.handlePassCards(this, this.pendingAction.catastrophe.count);
    }

    this.pendingAction = null;
    this.startNewRound();
  }

  drawCards(count) {
    const cards = [];
    for (let i = 0; i < count; i++) {
      if (this.traitDeck.length === 0) {
        // Reshuffle discard pile
        if (this.discardPile.length > 0) {
          this.traitDeck = [...this.discardPile];
          this.discardPile = [];
          DeckManager.shuffle(this.traitDeck);
          this.log('Discard pile reshuffled into deck');
        } else {
          break; // No more cards
        }
      }
      cards.push(this.traitDeck.shift());
    }
    return cards;
  }

  playCard(playerId, cardIndex) {
    // Validate it's the right phase
    if (this.state !== 'playing') {
      return { success: false, error: 'Game is not in progress' };
    }

    if (this.turnPhase !== 'play') {
      return { success: false, error: 'Not in play phase' };
    }

    // Check if there's a pending action
    if (this.pendingAction) {
      return { success: false, error: 'Resolve current action first' };
    }

    const player = this.getPlayer(playerId);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    // Check if it's this player's turn
    const currentPlayer = this.players[this.currentPlayerIndex];
    if (currentPlayer.id !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    // Check if player already played this round
    if (this.playersPlayedThisRound.has(playerId)) {
      return { success: false, error: 'Already played this round' };
    }

    // Validate card index
    if (cardIndex < 0 || cardIndex >= player.hand.length) {
      return { success: false, error: 'Invalid card selection' };
    }

    const card = player.hand[cardIndex];

    // Check play_when requirements
    if (card.play_when) {
      const canPlay = CardEffects.checkPlayWhen(this, player, card);
      if (!canPlay.allowed) {
        return { success: false, error: canPlay.reason || 'Cannot play this card now' };
      }
    }

    // Remove card from hand and add to trait pile
    player.hand.splice(cardIndex, 1);
    player.traitPile.push(card);

    this.log(`${player.name} played ${card.trait}`);

    // Mark player as having played this round
    this.playersPlayedThisRound.add(playerId);

    // Handle card effects
    if (card.action) {
      const effectResult = CardEffects.handleAction(this, player, card);
      if (effectResult.needsInput) {
        this.pendingAction = {
          type: 'action',
          card: card,
          player: playerId,
          ...effectResult
        };
        return { success: true, needsInput: true, inputType: effectResult.inputType };
      }
    }

    // Move to next player or next round
    this.advanceTurn();

    return { success: true };
  }

  advanceTurn() {
    // Check if all players have played
    if (this.playersPlayedThisRound.size >= this.players.length) {
      // All players have played, start new round
      this.startNewRound();
      return;
    }

    // Move to next player
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
  }

  handleTargetSelection(playerId, data) {
    if (!this.pendingAction || this.pendingAction.player !== playerId) {
      return { success: false, error: 'No action pending for you' };
    }

    const result = CardEffects.resolveTargetSelection(this, this.pendingAction, data);

    if (result.success && !result.needsMoreInput) {
      this.pendingAction = null;
      this.advanceTurn();
    }

    return result;
  }

  handleCardSelection(playerId, data) {
    if (!this.pendingAction || this.pendingAction.player !== playerId) {
      return { success: false, error: 'No action pending for you' };
    }

    const result = CardEffects.resolveCardSelection(this, this.pendingAction, data);

    if (result.success && !result.needsMoreInput) {
      this.pendingAction = null;
      this.advanceTurn();
    }

    return result;
  }

  skipAction(playerId) {
    if (!this.pendingAction || this.pendingAction.player !== playerId) {
      return { success: false, error: 'No action pending for you' };
    }

    if (!this.pendingAction.optional) {
      return { success: false, error: 'This action is not optional' };
    }

    this.log(`${this.getPlayer(playerId).name} skipped the action`);
    this.pendingAction = null;
    this.advanceTurn();

    return { success: true };
  }

  endGame() {
    this.state = 'finished';
    this.turnPhase = 'finished';

    // Calculate final scores
    for (const player of this.players) {
      player.score = Scoring.calculateScore(this, player);
    }

    // Sort by score
    const rankings = [...this.players].sort((a, b) => b.score - a.score);

    this.log('GAME OVER!');
    this.log(`Winner: ${rankings[0].name} with ${rankings[0].score} points!`);

    return rankings;
  }

  handlePlayerDisconnect(playerId) {
    // If it was this player's turn, advance
    const currentPlayer = this.players[this.currentPlayerIndex];
    if (currentPlayer && currentPlayer.id === playerId) {
      this.advanceTurn();
    }

    // Clear any pending actions for this player
    if (this.pendingAction && this.pendingAction.player === playerId) {
      this.pendingAction = null;
    }
  }

  log(message) {
    const entry = {
      time: Date.now(),
      message: message
    };
    this.actionLog.push(entry);

    // Keep only last 50 entries
    if (this.actionLog.length > 50) {
      this.actionLog.shift();
    }
  }

  getStateForPlayer(playerId) {
    const player = this.getPlayer(playerId);

    return {
      gameId: this.gameId,
      state: this.state,
      round: this.round,
      catastropheCount: this.catastropheCount,
      currentAge: this.currentAge,
      turnPhase: this.turnPhase,
      currentPlayerId: this.players[this.currentPlayerIndex]?.id,
      isMyTurn: this.players[this.currentPlayerIndex]?.id === playerId,

      // Player's private info
      myHand: player ? player.hand : [],
      myTraitPile: player ? player.traitPile : [],
      myScore: player ? Scoring.calculateScore(this, player) : 0,

      // All players' public info
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        handSize: p.hand.length,
        traitPile: p.traitPile,
        score: Scoring.calculateScore(this, p),
        hasPlayedThisRound: this.playersPlayedThisRound.has(p.id),
        isCurrentPlayer: this.players[this.currentPlayerIndex]?.id === p.id
      })),

      // Pending action (if applicable)
      pendingAction: this.pendingAction && this.pendingAction.player === playerId
        ? {
            type: this.pendingAction.type,
            inputType: this.pendingAction.inputType,
            options: this.pendingAction.options,
            message: this.pendingAction.message,
            optional: this.pendingAction.optional
          }
        : null,

      // Deck info
      deckSize: this.traitDeck.length,
      discardSize: this.discardPile.length,
      agesRemaining: this.ageDeck.length,

      // Action log
      actionLog: this.actionLog.slice(-10)
    };
  }
}

module.exports = GameState;
