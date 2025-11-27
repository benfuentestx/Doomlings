const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const GameManager = require('./game/GameManager');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Game manager instance
const gameManager = new GameManager(io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Create a new game
  socket.on('createGame', (playerName, callback) => {
    const result = gameManager.createGame(socket, playerName);
    callback(result);
  });

  // Join an existing game
  socket.on('joinGame', (data, callback) => {
    const { gameId, playerName } = data;
    const result = gameManager.joinGame(socket, gameId, playerName);
    callback(result);
  });

  // Player ready toggle
  socket.on('toggleReady', (callback) => {
    const result = gameManager.toggleReady(socket);
    if (callback) callback(result);
  });

  // Start the game (host only)
  socket.on('startGame', (callback) => {
    const result = gameManager.startGame(socket);
    callback(result);
  });

  // Play a card
  socket.on('playCard', (data, callback) => {
    const result = gameManager.playCard(socket, data);
    callback(result);
  });

  // Handle action that requires target selection
  socket.on('selectTarget', (data, callback) => {
    const result = gameManager.handleTargetSelection(socket, data);
    callback(result);
  });

  // Handle card selection for effects
  socket.on('selectCards', (data, callback) => {
    const result = gameManager.handleCardSelection(socket, data);
    callback(result);
  });

  // Skip optional action
  socket.on('skipAction', (callback) => {
    const result = gameManager.skipAction(socket);
    if (callback) callback(result);
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    gameManager.handleDisconnect(socket);
  });
});

server.listen(PORT, () => {
  console.log(`Doomlings server running on http://localhost:${PORT}`);
});
