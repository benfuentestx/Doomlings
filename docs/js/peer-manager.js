// PeerJS Connection Manager for Doomlings
// Handles peer-to-peer connections for multiplayer

import { GameState } from './game-engine.js';

export class PeerManager {
  constructor() {
    this.peer = null;
    this.connections = new Map(); // peerId -> connection
    this.isHost = false;
    this.hostConnection = null; // Connection to host (if not host)
    this.gameState = null;
    this.myPlayerId = null;
    this.myPlayerName = null;
    this.gameId = null;

    // Callbacks
    this.onPlayersUpdate = null;
    this.onGameStateUpdate = null;
    this.onError = null;
    this.onConnected = null;
    this.onDisconnected = null;
  }

  // Generate a short game ID
  generateGameId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }

  // Create a new game as host
  async createGame(playerName) {
    return new Promise((resolve, reject) => {
      this.gameId = this.generateGameId();
      this.isHost = true;
      this.myPlayerName = playerName;

      // Create peer with game ID as peer ID
      this.peer = new Peer(this.gameId, {
        debug: 1
      });

      this.peer.on('open', (id) => {
        console.log('Host peer opened with ID:', id);

        // Create game state
        this.gameState = new GameState(this.gameId);
        this.myPlayerId = `host_${Date.now()}`;

        // Add host as first player
        this.gameState.addPlayer(this.myPlayerId, playerName, true);

        // Listen for incoming connections
        this.peer.on('connection', (conn) => this.handleIncomingConnection(conn));

        resolve({
          success: true,
          gameId: this.gameId,
          playerId: this.myPlayerId,
          playerName: playerName,
          isHost: true
        });
      });

      this.peer.on('error', (err) => {
        console.error('Peer error:', err);
        if (err.type === 'unavailable-id') {
          // Try again with a different ID
          this.gameId = this.generateGameId();
          this.peer.destroy();
          this.createGame(playerName).then(resolve).catch(reject);
        } else {
          reject({ success: false, error: err.message || 'Connection failed' });
        }
      });
    });
  }

  // Join an existing game
  async joinGame(gameId, playerName) {
    return new Promise((resolve, reject) => {
      this.gameId = gameId.toUpperCase();
      this.isHost = false;
      this.myPlayerName = playerName;
      this.myPlayerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

      // Create peer with random ID
      this.peer = new Peer({
        debug: 1
      });

      this.peer.on('open', (id) => {
        console.log('Client peer opened with ID:', id);

        // Connect to host
        const conn = this.peer.connect(this.gameId, {
          metadata: {
            playerName: playerName,
            playerId: this.myPlayerId
          },
          reliable: true
        });

        conn.on('open', () => {
          console.log('Connected to host');
          this.hostConnection = conn;

          // Send join request
          conn.send({
            type: 'join',
            playerName: playerName,
            playerId: this.myPlayerId
          });
        });

        conn.on('data', (data) => this.handleHostMessage(data, resolve, reject));

        conn.on('close', () => {
          console.log('Disconnected from host');
          if (this.onDisconnected) this.onDisconnected();
        });

        conn.on('error', (err) => {
          console.error('Connection error:', err);
          reject({ success: false, error: 'Failed to connect to game' });
        });

        // Timeout for connection
        setTimeout(() => {
          if (!this.hostConnection || !this.hostConnection.open) {
            reject({ success: false, error: 'Game not found or host unavailable' });
          }
        }, 10000);
      });

      this.peer.on('error', (err) => {
        console.error('Peer error:', err);
        reject({ success: false, error: err.message || 'Connection failed' });
      });
    });
  }

  // Handle incoming connection (host only)
  handleIncomingConnection(conn) {
    console.log('Incoming connection from:', conn.peer);

    conn.on('open', () => {
      console.log('Connection opened with:', conn.metadata?.playerName);
    });

    conn.on('data', (data) => {
      this.handleClientMessage(conn, data);
    });

    conn.on('close', () => {
      console.log('Connection closed:', conn.peer);
      this.connections.delete(conn.peer);

      // Remove player from game
      const playerId = conn.metadata?.playerId;
      if (playerId && this.gameState) {
        this.gameState.removePlayer(playerId);
        this.broadcastState();
      }
    });
  }

  // Handle message from client (host only)
  handleClientMessage(conn, data) {
    if (!this.isHost) return;

    console.log('Host received:', data.type);

    switch (data.type) {
      case 'join':
        // Add player to game
        if (this.gameState.state !== 'lobby') {
          conn.send({ type: 'error', error: 'Game already started' });
          return;
        }
        if (this.gameState.players.length >= 6) {
          conn.send({ type: 'error', error: 'Game is full' });
          return;
        }

        conn.metadata = { playerName: data.playerName, playerId: data.playerId };
        this.connections.set(conn.peer, conn);

        this.gameState.addPlayer(data.playerId, data.playerName, false);

        // Send join confirmation
        conn.send({
          type: 'joined',
          playerId: data.playerId,
          playerName: data.playerName,
          gameId: this.gameId
        });

        // Broadcast updated state
        this.broadcastState();
        break;

      case 'toggleReady':
        const player = this.gameState.getPlayer(data.playerId);
        if (player) {
          player.ready = !player.ready;
          this.broadcastState();
        }
        break;

      case 'startGame':
        // Verify sender is host (they shouldn't be sending this, but check anyway)
        break;

      case 'playCard':
        const result = this.gameState.playCard(data.playerId, data.cardIndex);
        conn.send({ type: 'playCardResult', ...result });
        this.broadcastState();
        break;

      case 'selectTarget':
        const targetResult = this.gameState.handleTargetSelection(data.playerId, data.data);
        conn.send({ type: 'actionResult', ...targetResult });
        this.broadcastState();
        break;

      case 'selectCards':
        const cardsResult = this.gameState.handleCardSelection(data.playerId, data.data);
        conn.send({ type: 'actionResult', ...cardsResult });
        this.broadcastState();
        break;

      case 'skipAction':
        const skipResult = this.gameState.skipAction(data.playerId);
        conn.send({ type: 'actionResult', ...skipResult });
        this.broadcastState();
        break;
    }
  }

  // Handle message from host (client only)
  handleHostMessage(data, resolveJoin, rejectJoin) {
    console.log('Client received:', data.type);

    switch (data.type) {
      case 'joined':
        if (resolveJoin) {
          resolveJoin({
            success: true,
            gameId: data.gameId,
            playerId: data.playerId,
            playerName: data.playerName,
            isHost: false
          });
        }
        if (this.onConnected) this.onConnected();
        break;

      case 'error':
        if (rejectJoin) {
          rejectJoin({ success: false, error: data.error });
        }
        if (this.onError) this.onError(data.error);
        break;

      case 'gameState':
        this.gameState = GameState.deserialize(data.state);
        if (this.onGameStateUpdate) {
          this.onGameStateUpdate(this.gameState.getStateForPlayer(this.myPlayerId));
        }
        break;

      case 'playCardResult':
      case 'actionResult':
        // Handle result callbacks if needed
        if (data.error && this.onError) {
          this.onError(data.error);
        }
        break;
    }
  }

  // Broadcast game state to all connected players (host only)
  broadcastState() {
    if (!this.isHost || !this.gameState) return;

    const serialized = this.gameState.serialize();

    // Send to all connected clients
    for (const [peerId, conn] of this.connections) {
      if (conn.open) {
        conn.send({ type: 'gameState', state: serialized });
      }
    }

    // Update local UI
    if (this.onGameStateUpdate) {
      this.onGameStateUpdate(this.gameState.getStateForPlayer(this.myPlayerId));
    }
  }

  // Toggle ready status
  toggleReady() {
    if (this.isHost) {
      // Host doesn't need to ready up
      return { success: false, error: 'Host is always ready' };
    }

    if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send({
        type: 'toggleReady',
        playerId: this.myPlayerId
      });
      return { success: true };
    }

    return { success: false, error: 'Not connected' };
  }

  // Start the game (host only)
  startGame() {
    if (!this.isHost) {
      return { success: false, error: 'Only host can start' };
    }

    if (this.gameState.players.length < 2) {
      return { success: false, error: 'Need at least 2 players' };
    }

    const notReady = this.gameState.players.filter(p => !p.isHost && !p.ready);
    if (notReady.length > 0) {
      return { success: false, error: 'All players must be ready' };
    }

    this.gameState.startGame();
    this.broadcastState();

    return { success: true };
  }

  // Play a card
  playCard(cardIndex) {
    if (this.isHost) {
      const result = this.gameState.playCard(this.myPlayerId, cardIndex);
      this.broadcastState();
      return result;
    } else {
      if (this.hostConnection && this.hostConnection.open) {
        this.hostConnection.send({
          type: 'playCard',
          playerId: this.myPlayerId,
          cardIndex
        });
        return { success: true, pending: true };
      }
      return { success: false, error: 'Not connected' };
    }
  }

  // Select target for action
  selectTarget(data) {
    if (this.isHost) {
      const result = this.gameState.handleTargetSelection(this.myPlayerId, data);
      this.broadcastState();
      return result;
    } else {
      if (this.hostConnection && this.hostConnection.open) {
        this.hostConnection.send({
          type: 'selectTarget',
          playerId: this.myPlayerId,
          data
        });
        return { success: true, pending: true };
      }
      return { success: false, error: 'Not connected' };
    }
  }

  // Select cards for action
  selectCards(data) {
    if (this.isHost) {
      const result = this.gameState.handleCardSelection(this.myPlayerId, data);
      this.broadcastState();
      return result;
    } else {
      if (this.hostConnection && this.hostConnection.open) {
        this.hostConnection.send({
          type: 'selectCards',
          playerId: this.myPlayerId,
          data
        });
        return { success: true, pending: true };
      }
      return { success: false, error: 'Not connected' };
    }
  }

  // Skip optional action
  skipAction() {
    if (this.isHost) {
      const result = this.gameState.skipAction(this.myPlayerId);
      this.broadcastState();
      return result;
    } else {
      if (this.hostConnection && this.hostConnection.open) {
        this.hostConnection.send({
          type: 'skipAction',
          playerId: this.myPlayerId
        });
        return { success: true, pending: true };
      }
      return { success: false, error: 'Not connected' };
    }
  }

  // Get current players list
  getPlayers() {
    if (!this.gameState) return [];
    return this.gameState.players.map(p => ({
      id: p.id,
      name: p.name,
      isHost: p.isHost,
      ready: p.ready
    }));
  }

  // Get current game state for this player
  getMyState() {
    if (!this.gameState) return null;
    return this.gameState.getStateForPlayer(this.myPlayerId);
  }

  // Disconnect and cleanup
  disconnect() {
    if (this.peer) {
      this.peer.destroy();
    }
    this.connections.clear();
    this.hostConnection = null;
    this.gameState = null;
  }
}

// Singleton instance
export const peerManager = new PeerManager();
