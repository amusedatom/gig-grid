// ========================================
// SPOTIFY WEB API WRAPPER
// Functions for fetching playlists and tracks
// ========================================

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

/**
 * Make an authenticated request to Spotify API
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} API response
 */
async function spotifyRequest(endpoint, options = {}) {
    const token = getAccessToken();

    if (!token) {
        throw new Error('Not authenticated with Spotify');
    }

    const url = `${SPOTIFY_API_BASE}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        }
    });

    if (response.status === 401) {
        // Token expired
        clearAccessToken();
        throw new Error('Spotify token expired. Please re-authenticate.');
    }

    if (response.status === 429) {
        // Rate limited
        const retryAfter = response.headers.get('Retry-After') || 1;
        throw new Error(`Rate limited. Retry after ${retryAfter} seconds.`);
    }

    if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

/**
 * Get current user's profile
 * @returns {Promise<Object>} User profile
 */
async function getCurrentUser() {
    return spotifyRequest('/me');
}

/**
 * Get user's playlists
 * @param {number} limit - Number of playlists to fetch (max 50)
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Object>} Playlists response
 */
async function getUserPlaylists(limit = 50, offset = 0) {
    return spotifyRequest(`/me/playlists?limit=${limit}&offset=${offset}`);
}

/**
 * Get all user's playlists (handles pagination)
 * @returns {Promise<Array>} Array of all playlists
 */
async function getAllUserPlaylists() {
    const playlists = [];
    let offset = 0;
    const limit = 50;

    try {
        while (true) {
            const response = await getUserPlaylists(limit, offset);

            console.log('Playlist API response:', response);

            if (!response) {
                throw new Error('No response from Spotify API');
            }

            if (!response.items) {
                console.error('Response missing items array:', response);
                throw new Error('Invalid response format from Spotify API');
            }

            playlists.push(...response.items);

            if (!response.next) {
                break;
            }

            offset += limit;
        }

        return playlists;
    } catch (error) {
        console.error('Error fetching playlists:', error);
        throw error;
    }
}

/**
 * Get tracks from a playlist
 * @param {string} playlistId - Playlist ID
 * @param {number} limit - Number of tracks to fetch (max 100)
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Object>} Playlist tracks response
 */
async function getPlaylistTracks(playlistId, limit = 100, offset = 0) {
    return spotifyRequest(`/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}&fields=items(track(id,name,artists,popularity)),next`);
}

/**
 * Get all tracks from a playlist (handles pagination)
 * @param {string} playlistId - Playlist ID
 * @returns {Promise<Array>} Array of all tracks
 */
async function getAllPlaylistTracks(playlistId) {
    const tracks = [];
    let offset = 0;
    const limit = 100;

    while (true) {
        const response = await getPlaylistTracks(playlistId, limit, offset);

        // Filter out null tracks (deleted/unavailable)
        const validTracks = response.items
            .filter(item => item.track && item.track.id)
            .map(item => item.track);

        tracks.push(...validTracks);

        if (!response.next) {
            break;
        }

        offset += limit;
    }

    return tracks;
}

/**
 * Get playlist details
 * @param {string} playlistId - Playlist ID
 * @returns {Promise<Object>} Playlist details
 */
async function getPlaylist(playlistId) {
    return spotifyRequest(`/playlists/${playlistId}?fields=id,name,description,images,owner,tracks(total)`);
}

/**
 * Extract top N tracks by popularity
 * @param {Array} tracks - Array of track objects
 * @param {number} count - Number of top tracks to return
 * @returns {Array} Top tracks sorted by popularity
 */
function getTopTracks(tracks, count = 25) {
    // Sort by popularity (descending)
    const sorted = [...tracks].sort((a, b) => {
        const popA = a.popularity || 0;
        const popB = b.popularity || 0;
        return popB - popA;
    });

    return sorted.slice(0, count);
}

/**
 * Format track for bingo game
 * @param {Object} track - Spotify track object
 * @returns {Object} Formatted track
 */
function formatTrack(track) {
    return {
        id: track.id,
        name: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        popularity: track.popularity || 0
    };
}

/**
 * Create bingo game from playlist
 * @param {string} playlistId - Playlist ID
 * @param {number} trackCount - Number of tracks for bingo (default 25)
 * @returns {Promise<Object>} Game data with tracks
 */
async function createGameFromPlaylist(playlistId, trackCount = 25) {
    try {
        // Get playlist details
        const playlist = await getPlaylist(playlistId);

        // Get all tracks
        const allTracks = await getAllPlaylistTracks(playlistId);

        if (allTracks.length < trackCount) {
            throw new Error(`Playlist only has ${allTracks.length} tracks. Need at least ${trackCount}.`);
        }

        // Get top tracks by popularity
        const topTracks = getTopTracks(allTracks, trackCount);

        // Format tracks
        const formattedTracks = topTracks.map(formatTrack);

        return {
            playlistId: playlist.id,
            playlistName: playlist.name,
            playlistImage: playlist.images[0]?.url || null,
            tracks: formattedTracks,
            totalTracks: playlist.tracks.total
        };
    } catch (error) {
        console.error('Failed to create game from playlist:', error);
        throw error;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getCurrentUser,
        getUserPlaylists,
        getAllUserPlaylists,
        getPlaylistTracks,
        getAllPlaylistTracks,
        getPlaylist,
        getTopTracks,
        formatTrack,
        createGameFromPlaylist
    };
}
