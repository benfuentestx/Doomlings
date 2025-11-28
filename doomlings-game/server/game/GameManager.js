const GameState = require('./GameState');

class GameManager {
  constructor(io) {
    this.io = io;
    this.games = new Map(); // gameId -> GameState
    this.playerToGame = new Map(); // socketId -> gameId
  }

  // Generate a random 6-character game ID
  generateGameId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars
    let id;
    do {
      id = '';
      for (let i = 0; i < 6; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.games.has(id));
    return id;
  }

  // Create a new game
  createGame(socket, playerName) {
    if (!playerName || playerName.trim().length === 0) {
      return { success: false, error: 'Please enter a valid name' };
    }

    const gameId = this.generateGameId();
    const game = new GameState(gameId);

    const player = game.addPlayer(socket.id, playerName.trim(), true);
    if (!player) {
      return { success: false, error: 'Failed to create game' };
    }

    this.games.set(gameId, game);
    this.playerToGame.set(socket.id, gameId);
    socket.join(gameId);

    console.log(`Game ${gameId} created by ${playerName}`);

    return {
      success: true,
      gameId,
      playerId: socket.id,
      playerName: player.name,
      isHost: true
    };
  }

  // Join an existing game
  joinGame(socket, gameId, playerName) {
    if (!playerName || playerName.trim().length === 0) {
      return { success: false, error: 'Please enter a valid name' };
    }

    const normalizedId = gameId.toUpperCase().trim();
    const game = this.games.get(normalizedId);

    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    if (game.state !== 'lobby') {
      return { success: false, error: 'Game already in progress' };
    }

    if (game.players.length >= 6) {
      return { success: false, error: 'Game is full (max 6 players)' };
    }

    const player = game.addPlayer(socket.id, playerName.trim(), false);
    if (!player) {
      return { success: false, error: 'Failed to join game' };
    }

    this.playerToGame.set(socket.id, normalizedId);
    socket.join(normalizedId);

    // Notify other players
    this.broadcastLobbyUpdate(normalizedId);

    console.log(`${playerName} joined game ${normalizedId}`);

    return {
      success: true,
      gameId: normalizedId,
      playerId: socket.id,
      playerName: player.name,
      isHost: false,
      players: game.getPublicPlayerList()
    };
  }

  // Toggle player ready status
  toggleReady(socket) {
    const gameId = this.playerToGame.get(socket.id);
    if (!gameId) {
      return { success: false, error: 'Not in a game' };
    }

    const game = this.games.get(gameId);
    if (!game || game.state !== 'lobby') {
      return { success: false, error: 'Cannot change ready status now' };
    }

    const player = game.getPlayer(socket.id);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    player.ready = !player.ready;
    this.broadcastLobbyUpdate(gameId);

    return { success: true, ready: player.ready };
  }

  // Start the game (host only)
  startGame(socket) {
    const gameId = this.playerToGame.get(socket.id);
    if (!gameId) {
      return { success: false, error: 'Not in a game' };
    }

    const game = this.games.get(gameId);
    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    const player = game.getPlayer(socket.id);
    if (!player || !player.isHost) {
      return { success: false, error: 'Only the host can start the game' };
    }

    if (game.players.length < 2) {
      return { success: false, error: 'Need at least 2 players to start' };
    }

    const notReadyPlayers = game.players.filter(p => !p.isHost && !p.ready);
    if (notReadyPlayers.length > 0) {
      return { success: false, error: 'All players must be ready' };
    }

    // Initialize and start the game
    game.startGame();

    // Send initial game state to all players
    this.broadcastGameState(gameId);

    console.log(`Game ${gameId} started with ${game.players.length} players`);

    return { success: true };
  }

  // Play a card
  playCard(socket, data) {
    const gameId = this.playerToGame.get(socket.id);
    if (!gameId) {
      return { success: false, error: 'Not in a game' };
    }

    const game = this.games.get(gameId);
    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    const result = game.playCard(socket.id, data.cardIndex);

    if (result.success) {
      this.broadcastGameState(gameId);
    }

    return result;
  }

  // Handle target selection for card effects
  handleTargetSelection(socket, data) {
    const gameId = this.playerToGame.get(socket.id);
    if (!gameId) {
      return { success: false, error: 'Not in a game' };
    }

    const game = this.games.get(gameId);
    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    const result = game.handleTargetSelection(socket.id, data);

    if (result.success) {
      this.broadcastGameState(gameId);
    }

    return result;
  }

  // Handle card selection for effects
  handleCardSelection(socket, data) {
    const gameId = this.playerToGame.get(socket.id);
    if (!gameId) {
      return { success: false, error: 'Not in a game' };
    }

    const game = this.games.get(gameId);
    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    const result = game.handleCardSelection(socket.id, data);

    if (result.success) {
      this.broadcastGameState(gameId);
    }

    return result;
  }

  // Skip optional action
  skipAction(socket) {
    const gameId = this.playerToGame.get(socket.id);
    if (!gameId) {
      return { success: false, error: 'Not in a game' };
    }

    const game = this.games.get(gameId);
    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    const result = game.skipAction(socket.id);

    if (result.success) {
      this.broadcastGameState(gameId);
    }

    return result;
  }

  // Handle player disconnect
  handleDisconnect(socket) {
    const gameId = this.playerToGame.get(socket.id);
    if (!gameId) return;

    const game = this.games.get(gameId);
    if (!game) {
      this.playerToGame.delete(socket.id);
      return;
    }

    const player = game.getPlayer(socket.id);
    const wasHost = player && player.isHost;

    game.removePlayer(socket.id);
    this.playerToGame.delete(socket.id);

    // If no players left, delete the game
    if (game.players.length === 0) {
      this.games.delete(gameId);
      console.log(`Game ${gameId} deleted (no players)`);
      return;
    }

    // If host left, assign new host
    if (wasHost && game.players.length > 0) {
      game.players[0].isHost = true;
    }

    // Notify remaining players
    if (game.state === 'lobby') {
      this.broadcastLobbyUpdate(gameId);
    } else {
      // Handle mid-game disconnect
      game.handlePlayerDisconnect(socket.id);
      this.broadcastGameState(gameId);
    }
  }

  // Broadcast lobby update to all players in a game
  broadcastLobbyUpdate(gameId) {
    const game = this.games.get(gameId);
    if (!game) return;

    this.io.to(gameId).emit('lobbyUpdate', {
      players: game.getPublicPlayerList(),
      gameId
    });
  }

  // Broadcast game state to all players (with private info per player)
  broadcastGameState(gameId) {
    const game = this.games.get(gameId);
    if (!game) return;

    // Send personalized state to each player
    for (const player of game.players) {
      const socket = this.io.sockets.sockets.get(player.id);
      if (socket) {
        socket.emit('gameState', game.getStateForPlayer(player.id));
      }
    }
  }
}

module.exports = GameManager;
