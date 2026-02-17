// ========================================
// SPOTIFY AUTHENTICATION - PKCE FLOW
// Authorization Code with PKCE for client-side OAuth
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
 * Generate random string for code verifier
 * @param {number} length - Length of string
 * @returns {string} Random string
 */
function generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

/**
 * Generate SHA256 hash
 * @param {string} plain - Plain text to hash
 * @returns {Promise<ArrayBuffer>} Hash
 */
async function sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return crypto.subtle.digest('SHA-256', data);
}

/**
 * Base64 encode
 * @param {ArrayBuffer} input - Input to encode
 * @returns {string} Base64 encoded string
 */
function base64encode(input) {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

/**
 * Generate code challenge from verifier
 * @param {string} verifier - Code verifier
 * @returns {Promise<string>} Code challenge
 */
async function generateCodeChallenge(verifier) {
    const hashed = await sha256(verifier);
    return base64encode(hashed);
}

/**
 * Generate Spotify authorization URL with PKCE
 * @param {string} codeChallenge - Code challenge
 * @returns {string} Authorization URL
 */
function getSpotifyAuthUrl(codeChallenge) {
    const params = new URLSearchParams({
        client_id: SPOTIFY_CONFIG.clientId,
        response_type: 'code',
        redirect_uri: SPOTIFY_CONFIG.redirectUri,
        scope: SPOTIFY_CONFIG.scopes.join(' '),
        code_challenge_method: 'S256',
        code_challenge: codeChallenge
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 * @param {string} code - Authorization code
 * @param {string} verifier - Code verifier
 * @returns {Promise<Object>} Token response
 */
async function exchangeCodeForToken(code, verifier) {
    const params = new URLSearchParams({
        client_id: SPOTIFY_CONFIG.clientId,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: SPOTIFY_CONFIG.redirectUri,
        code_verifier: verifier
    });

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Token exchange failed: ${error.error_description || error.error}`);
    }

    return response.json();
}

/**
 * Initiate Spotify authentication with PKCE
 * Opens popup window for user login
 */
async function authenticateSpotify() {
    try {
        // Generate code verifier and challenge
        const codeVerifier = generateRandomString(64);
        const codeChallenge = await generateCodeChallenge(codeVerifier);

        // Store verifier for later
        sessionStorage.setItem('spotify_code_verifier', codeVerifier);

        // Generate auth URL
        const authUrl = getSpotifyAuthUrl(codeChallenge);

        // Open popup
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
            const checkPopup = setInterval(async () => {
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
                        if (popupUrl.includes(SPOTIFY_CONFIG.redirectUri) && popupUrl.includes('code=')) {
                            console.log('Redirect detected, exchanging code for token...');

                            // Extract code from URL
                            const urlParams = new URLSearchParams(popup.location.search);
                            const code = urlParams.get('code');

                            if (code) {
                                // Exchange code for token
                                const verifier = sessionStorage.getItem('spotify_code_verifier');
                                const tokenData = await exchangeCodeForToken(code, verifier);

                                // Store token
                                const expiryTime = Date.now() + (tokenData.expires_in * 1000);
                                sessionStorage.setItem('spotify_access_token', tokenData.access_token);
                                sessionStorage.setItem('spotify_token_expiry', expiryTime.toString());

                                if (tokenData.refresh_token) {
                                    sessionStorage.setItem('spotify_refresh_token', tokenData.refresh_token);
                                }

                                // Clean up
                                sessionStorage.removeItem('spotify_code_verifier');

                                console.log('Token exchange successful');
                                popup.close();
                                clearInterval(checkPopup);
                                resolve(tokenData.access_token);
                            } else {
                                console.error('No code in redirect URL');
                                popup.close();
                                clearInterval(checkPopup);
                                reject(new Error('No authorization code received'));
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
    } catch (error) {
        console.error('Authentication error:', error);
        throw error;
    }
}

/**
 * Parse authentication callback from URL
 * @param {string} url - URL with code parameter
 */
async function parseAuthCallback(url) {
    if (!url) {
        url = window.location.href;
    }

    const urlParams = new URLSearchParams(new URL(url).search);
    const code = urlParams.get('code');

    if (!code) {
        return;
    }

    try {
        const verifier = sessionStorage.getItem('spotify_code_verifier');
        if (!verifier) {
            console.error('No code verifier found');
            return;
        }

        const tokenData = await exchangeCodeForToken(code, verifier);

        const expiryTime = Date.now() + (tokenData.expires_in * 1000);
        sessionStorage.setItem('spotify_access_token', tokenData.access_token);
        sessionStorage.setItem('spotify_token_expiry', expiryTime.toString());

        if (tokenData.refresh_token) {
            sessionStorage.setItem('spotify_refresh_token', tokenData.refresh_token);
        }

        sessionStorage.removeItem('spotify_code_verifier');

        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);

        console.log('Spotify authentication successful');
    } catch (error) {
        console.error('Failed to exchange code for token:', error);
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
    sessionStorage.removeItem('spotify_refresh_token');
    sessionStorage.removeItem('spotify_code_verifier');
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
if (window.location.search.includes('code=')) {
    parseAuthCallback(window.location.href);
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
