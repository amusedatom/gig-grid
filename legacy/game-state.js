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
    params.set('mode', gameState.mode);

    if (gameState.join) {
        params.set('join', 'true');
    } else {
        params.set('game', gameState.gameId);
        params.set('seed', gameState.seed.toString());
    }

    if (gameState.mode === 'spotify') {
        params.set('playlist', gameState.playlistId);
        if (gameState.playlistName) {
            params.set('name', gameState.playlistName);
        }
    } else if (gameState.mode === 'classic') {
        // Classic mode doesn't need track data in URL
        params.set('type', 'dnb');
    } else if (gameState.mode === 'card') {
        // Card builder mode - support both database IDs and custom songs
        if (gameState.songIds && gameState.songIds.length > 0) {
            // Using song database IDs (compact)
            params.set('songs', gameState.songIds.join(','));
        } else if (gameState.customSongs && gameState.customSongs.length > 0) {
            // Using custom song names (Base64 encoded)
            params.set('custom', encodeSongsToBase64(gameState.customSongs));
        }
        if (gameState.cardName) {
            params.set('name', gameState.cardName);
        }
    }

    // Frozen view: encode checked state as compact hex bitmask
    if (gameState.frozen && gameState.checkedSnapshot) {
        params.set('view', 'frozen');
        params.set('checked', encodeCheckedBitmask(gameState.checkedSnapshot));
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

        const join = params.get('join') === 'true';
        const gameId = params.get('game');
        const mode = params.get('mode');
        const seedStr = params.get('seed');
        const seed = seedStr ? parseInt(seedStr) : NaN;

        // Validation: Must have mode. If not joining, must have gameId and seed.
        if (!mode || (!join && (!gameId || isNaN(seed)))) {
            return null;
        }

        const state = {
            gameId,
            mode,
            seed,
            join,
            timestamp: Date.now()
        };

        if (mode === 'spotify') {
            state.playlistId = params.get('playlist');
            state.playlistName = params.get('name') || 'Spotify Playlist';

            if (!state.playlistId) {
                return null;
            }
        } else if (mode === 'card') {
            // Card builder mode - support both database IDs and custom songs
            const songsParam = params.get('songs');
            const customParam = params.get('custom');

            if (songsParam) {
                // Using song database IDs
                state.songIds = songsParam.split(',').filter(id => id.trim() !== '');
                if (state.songIds.length === 0) {
                    return null;
                }
            } else if (customParam) {
                // Using custom Base64-encoded songs
                state.customSongs = decodeSongsFromBase64(customParam);
                if (!state.customSongs || state.customSongs.length === 0) {
                    return null;
                }
            } else {
                // No songs provided
                return null;
            }

            state.cardName = params.get('name') || 'Custom Card';
        }

        // Frozen view: decode checked snapshot
        if (params.get('view') === 'frozen') {
            state.frozen = true;
            const checkedParam = params.get('checked');
            if (checkedParam) {
                state.checkedSnapshot = decodeCheckedBitmask(checkedParam);
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

/**
 * Generate a random seed
 * @returns {number} Random seed
 */
function generateGameSeed() {
    return Math.floor(Math.random() * 1000000);
}

/**
 * Encode song list to Base64 (for custom songs not in database)
 * @param {Array<string>} songs - Array of song strings (e.g., ["Artist - Song", ...])
 * @returns {string} Base64 encoded string
 */
function encodeSongsToBase64(songs) {
    try {
        const jsonString = JSON.stringify(songs);
        return btoa(encodeURIComponent(jsonString));
    } catch (e) {
        console.error('Failed to encode songs:', e);
        return '';
    }
}

/**
 * Decode Base64 song list
 * @param {string} base64String - Base64 encoded song list
 * @returns {Array<string>|null} Array of song strings or null if invalid
 */
function decodeSongsFromBase64(base64String) {
    try {
        const jsonString = decodeURIComponent(atob(base64String));
        const songs = JSON.parse(jsonString);
        return Array.isArray(songs) ? songs : null;
    } catch (e) {
        console.error('Failed to decode songs:', e);
        return null;
    }
}

/**
 * Generate multiple unique card permutations from a song pool
 * @param {Array} songPool - Array of song IDs or song objects (min 25 items)
 * @param {number} cardCount - Number of unique cards to generate
 * @param {string} cardName - Name for the cards
 * @returns {Array} Array of game state objects with unique seeds
 */
function generateCardPermutations(songPool, cardCount = 5, cardName = 'Custom Card') {
    if (!songPool || songPool.length < 25) {
        throw new Error('Song pool must have at least 25 songs');
    }

    const cards = [];

    for (let i = 0; i < cardCount; i++) {
        const gameId = generateGameId();
        const seed = generateGameSeed();

        const gameState = {
            gameId,
            mode: 'card',
            seed,
            timestamp: Date.now(),
            cardName: `${cardName} - #${i + 1}`
        };

        // Check if songPool contains IDs (strings) or objects
        if (typeof songPool[0] === 'string') {
            // Song IDs from database
            gameState.songIds = songPool;
        } else {
            // Custom song objects - encode to Base64
            const songStrings = songPool.map(s =>
                typeof s === 'object' ? `${s.artist} - ${s.name}` : s
            );
            gameState.customSongs = songStrings;
        }

        cards.push(gameState);
    }

    return cards;
}

/**
 * Encode a boolean checked-state array as a compact hex bitmask
 * 25 cells → 25 bits → 7 hex chars
 * @param {Array<boolean>} checkedState - Array of 25 booleans
 * @returns {string} Hex string
 */
function encodeCheckedBitmask(checkedState) {
    let bits = 0;
    for (let i = 0; i < checkedState.length && i < 25; i++) {
        if (checkedState[i]) {
            bits |= (1 << i);
        }
    }
    return bits.toString(16).padStart(7, '0');
}

/**
 * Decode a hex bitmask back into a boolean checked-state array
 * @param {string} hex - Hex string (7 chars)
 * @returns {Array<boolean>} Array of 25 booleans
 */
function decodeCheckedBitmask(hex) {
    const bits = parseInt(hex, 16);
    const state = [];
    for (let i = 0; i < 25; i++) {
        state.push(Boolean(bits & (1 << i)));
    }
    return state;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        encodeGameState,
        decodeGameState,
        generateGameId,
        generateGameSeed,
        createShareableUrl,
        getCurrentGameFromUrl,
        updateUrlHash,
        saveGameProgress,
        loadGameProgress,
        migrateLegacyState,
        encodeSongsToBase64,
        decodeSongsFromBase64,
        generateCardPermutations,
        encodeCheckedBitmask,
        decodeCheckedBitmask
    };
}
