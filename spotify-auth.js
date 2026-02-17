// ========================================
// SPOTIFY AUTHENTICATION
// Implicit Grant Flow for client-side OAuth
// ========================================

const SPOTIFY_CONFIG = {
    // Replace with your Spotify Client ID
    clientId: 'YOUR_SPOTIFY_CLIENT_ID',
    redirectUri: window.location.origin + window.location.pathname,
    scopes: [
        'playlist-read-private',
        'playlist-read-collaborative'
    ]
};

/**
 * Generate Spotify authorization URL
 * @returns {string} Authorization URL
 */
function getSpotifyAuthUrl() {
    const params = new URLSearchParams({
        client_id: SPOTIFY_CONFIG.clientId,
        response_type: 'token',
        redirect_uri: SPOTIFY_CONFIG.redirectUri,
        scope: SPOTIFY_CONFIG.scopes.join(' '),
        show_dialog: 'false'
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

/**
 * Initiate Spotify authentication
 * Opens popup window for user login
 */
function authenticateSpotify() {
    const authUrl = getSpotifyAuthUrl();
    const width = 500;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const popup = window.open(
        authUrl,
        'Spotify Login',
        `width=${width},height=${height},left=${left},top=${top}`
    );

    // Listen for the redirect callback
    return new Promise((resolve, reject) => {
        const checkPopup = setInterval(() => {
            try {
                if (popup.closed) {
                    clearInterval(checkPopup);
                    const token = getAccessToken();
                    if (token) {
                        console.log('Authentication successful - token retrieved');
                        resolve(token);
                    } else {
                        console.error('Popup closed without token');
                        reject(new Error('Authentication cancelled'));
                    }
                    return;
                }

                // Check if popup has redirected back
                try {
                    const popupUrl = popup.location.href;

                    // Check if we're back at our redirect URI
                    if (popupUrl.includes(SPOTIFY_CONFIG.redirectUri)) {
                        console.log('Redirect detected, parsing token...');
                        const hash = popup.location.hash;

                        if (hash && hash.includes('access_token')) {
                            parseAuthCallback(hash);
                            const token = getAccessToken();

                            if (token) {
                                console.log('Token parsed successfully');
                                popup.close();
                                clearInterval(checkPopup);
                                resolve(token);
                            } else {
                                console.error('Failed to parse token from hash');
                                popup.close();
                                clearInterval(checkPopup);
                                reject(new Error('Failed to parse authentication token'));
                            }
                        } else {
                            console.error('No access_token in redirect hash');
                            popup.close();
                            clearInterval(checkPopup);
                            reject(new Error('No access token received'));
                        }
                    }
                } catch (e) {
                    // Cross-origin error - popup hasn't redirected yet, this is expected
                }
            } catch (e) {
                console.error('Error in auth check:', e);
            }
        }, 500);

        // Timeout after 5 minutes
        setTimeout(() => {
            clearInterval(checkPopup);
            if (!popup.closed) {
                popup.close();
            }
            reject(new Error('Authentication timeout'));
        }, 300000);
    });
}

/**
 * Parse authentication callback from URL hash
 * @param {string} hash - URL hash from Spotify redirect
 */
function parseAuthCallback(hash) {
    if (!hash) {
        hash = window.location.hash;
    }

    if (!hash || !hash.includes('access_token')) {
        return;
    }

    // Remove leading #
    hash = hash.replace(/^#/, '');

    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const expiresIn = params.get('expires_in');

    if (accessToken) {
        const expiryTime = Date.now() + (parseInt(expiresIn) * 1000);

        sessionStorage.setItem('spotify_access_token', accessToken);
        sessionStorage.setItem('spotify_token_expiry', expiryTime.toString());

        // Clean up URL hash
        window.location.hash = '';

        console.log('Spotify authentication successful');
    }
}

/**
 * Get current access token from session storage
 * @returns {string|null} Access token or null if not authenticated/expired
 */
function getAccessToken() {
    const token = sessionStorage.getItem('spotify_access_token');
    const expiry = sessionStorage.getItem('spotify_token_expiry');

    if (!token || !expiry) {
        return null;
    }

    // Check if token is expired
    if (Date.now() >= parseInt(expiry)) {
        clearAccessToken();
        return null;
    }

    return token;
}

/**
 * Clear stored access token
 */
function clearAccessToken() {
    sessionStorage.removeItem('spotify_access_token');
    sessionStorage.removeItem('spotify_token_expiry');
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated with valid token
 */
function isAuthenticated() {
    return getAccessToken() !== null;
}

/**
 * Get time until token expires
 * @returns {number} Milliseconds until expiry, or 0 if not authenticated
 */
function getTokenTimeRemaining() {
    const expiry = sessionStorage.getItem('spotify_token_expiry');
    if (!expiry) return 0;

    const remaining = parseInt(expiry) - Date.now();
    return Math.max(0, remaining);
}

// Check for auth callback on page load
if (window.location.hash.includes('access_token')) {
    parseAuthCallback(window.location.hash);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        authenticateSpotify,
        getAccessToken,
        clearAccessToken,
        isAuthenticated,
        getTokenTimeRemaining
    };
}
