// ========================================
// GAME STATE MANAGEMENT
// URL-based state encoding/decoding for serverless multiplayer
// ========================================

/**
 * Game state structure:
 * {
 *   gameId: string,
 *   mode: 'classic' | 'spotify',
 *   playlistId?: string,
 *   playlistName?: string,
 *   tracks: Array<{id, name, artist}>,
 *   seed: number,
 *   timestamp: number
 * }
 */

/**
 * Encode game state into URL hash
 * @param {Object} gameState - Game state object
 * @returns {string} URL hash string
 */
function encodeGameState(gameState) {
    const params = new URLSearchParams();

    params.set('game', gameState.gameId);
    params.set('mode', gameState.mode);
    params.set('seed', gameState.seed.toString());

    if (gameState.mode === 'spotify') {
        params.set('playlist', gameState.playlistId);
        if (gameState.playlistName) {
            params.set('name', gameState.playlistName);
        }
    } else if (gameState.mode === 'classic') {
        // Classic mode doesn't need track data in URL
        params.set('type', 'dnb');
    }

    return '#' + params.toString();
}

/**
 * Decode game state from URL hash
 * @param {string} hash - URL hash string (with or without #)
 * @returns {Object|null} Parsed game state or null if invalid
 */
function decodeGameState(hash) {
    if (!hash) return null;

    // Remove leading # if present
    hash = hash.replace(/^#/, '');

    try {
        const params = new URLSearchParams(hash);

        const gameId = params.get('game');
        const mode = params.get('mode');
        const seed = parseInt(params.get('seed'));

        if (!gameId || !mode || isNaN(seed)) {
            return null;
        }

        const state = {
            gameId,
            mode,
            seed,
            timestamp: Date.now()
        };

        if (mode === 'spotify') {
            state.playlistId = params.get('playlist');
            state.playlistName = params.get('name') || 'Spotify Playlist';

            if (!state.playlistId) {
                return null;
            }
        }

        return state;
    } catch (e) {
        console.error('Failed to decode game state:', e);
        return null;
    }
}

/**
 * Generate a unique game ID
 * @returns {string} Game ID
 */
function generateGameId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `${timestamp}-${random}`;
}

/**
 * Create a shareable URL for a game
 * @param {Object} gameState - Game state object
 * @param {string} baseUrl - Base URL (defaults to current location)
 * @returns {string} Full shareable URL
 */
function createShareableUrl(gameState, baseUrl = null) {
    const base = baseUrl || window.location.origin + window.location.pathname;
    const hash = encodeGameState(gameState);
    return base + hash;
}

/**
 * Get the current game state from URL
 * @returns {Object|null} Current game state or null
 */
function getCurrentGameFromUrl() {
    return decodeGameState(window.location.hash);
}

/**
 * Update URL hash without reloading page
 * @param {Object} gameState - Game state to encode
 */
function updateUrlHash(gameState) {
    const hash = encodeGameState(gameState);
    history.replaceState(null, '', hash);
}

/**
 * Get localStorage key for a specific game
 * @param {string} gameId - Game ID
 * @returns {string} localStorage key
 */
function getGameStorageKey(gameId) {
    return `dnb-bingo-game-${gameId}`;
}

/**
 * Save game progress to localStorage
 * @param {string} gameId - Game ID
 * @param {Array<boolean>} state - Checked state array
 */
function saveGameProgress(gameId, state) {
    try {
        const key = getGameStorageKey(gameId);
        localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
        console.error('Failed to save game progress:', e);
    }
}

/**
 * Load game progress from localStorage
 * @param {string} gameId - Game ID
 * @param {number} trackCount - Number of tracks (for validation)
 * @returns {Array<boolean>} Checked state array
 */
function loadGameProgress(gameId, trackCount) {
    try {
        const key = getGameStorageKey(gameId);
        const saved = localStorage.getItem(key);

        if (saved) {
            const state = JSON.parse(saved);
            // Validate array length
            if (Array.isArray(state) && state.length === trackCount) {
                return state;
            }
        }
    } catch (e) {
        console.error('Failed to load game progress:', e);
    }

    // Return fresh state
    return Array(trackCount).fill(false);
}

/**
 * Migrate legacy state to new format
 * Preserves existing DnB game as "classic" mode
 */
function migrateLegacyState() {
    const legacyKey = 'dnb-bingo-state';
    const legacyState = localStorage.getItem(legacyKey);

    if (legacyState && !localStorage.getItem('dnb-bingo-game-classic')) {
        try {
            // Create a classic game entry
            localStorage.setItem('dnb-bingo-game-classic', legacyState);
            console.log('Migrated legacy state to classic mode');
        } catch (e) {
            console.error('Failed to migrate legacy state:', e);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        encodeGameState,
        decodeGameState,
        generateGameId,
        createShareableUrl,
        getCurrentGameFromUrl,
        updateUrlHash,
        saveGameProgress,
        loadGameProgress,
        migrateLegacyState
    };
}
