// Reconnection Manager for Doomlings
// Handles saving/loading game state and automatic reconnection on page refresh

export class ReconnectManager {
  constructor() {
    this.storageKey = 'doomlings_game_session';
  }

  /**
   * Save current game session to localStorage
   * @param {Object} sessionData - { gameId, playerId, playerName, isHost, peerId }
   */
  saveSession(sessionData) {
    try {
      const data = {
        ...sessionData,
        timestamp: Date.now()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      console.log('Game session saved:', data);
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  /**
   * Load saved game session from localStorage
   * @returns {Object|null} Session data or null if not found
   */
  loadSession() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) {
        return null;
      }

      const session = JSON.parse(data);

      // Check if session is too old (24 hours)
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      if (Date.now() - session.timestamp > maxAge) {
        console.log('Session expired, clearing...');
        this.clearSession();
        return null;
      }

      console.log('Game session loaded:', session);
      return session;
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
  }

  /**
   * Clear saved game session
   */
  clearSession() {
    try {
      localStorage.removeItem(this.storageKey);
      console.log('Game session cleared');
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  /**
   * Check if we should attempt auto-reconnect
   * @returns {boolean}
   */
  shouldAutoReconnect() {
    const session = this.loadSession();
    return session !== null;
  }

  /**
   * Update session data (e.g., after state changes)
   * @param {Object} updates - Partial session data to update
   */
  updateSession(updates) {
    const session = this.loadSession();
    if (session) {
      this.saveSession({ ...session, ...updates });
    }
  }
}

// Export singleton instance
export const reconnectManager = new ReconnectManager();
