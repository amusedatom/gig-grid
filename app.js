// ========================================
// MUSIC BINGO - MULTIPLAYER EDITION
// Main Application Logic
// ========================================

// 25 Classic and Modern Drum & Bass Anthems (Classic Mode)
const DNB_ANTHEMS = [
    "Pendulum - Tarantula",
    "Chase & Status - End Credits",
    "Sub Focus - Rock It",
    "Netsky - Come Alive",
    "High Contrast - If We Ever",
    "Camo & Krooked - Climax",
    "Wilkinson - Afterglow",
    "Sigma - Nobody to Love",
    "Andy C - Heartbeat Loud",
    "Calibre - Drop It Down",
    "Noisia - Stigma",
    "Mefjus - Suicide Bassline",
    "Dimension - UK",
    "Culture Shock - Bunker",
    "Friction - Long Gone Memory",
    "Loadstar - Stepped Outside",
    "Logistics - The Trip",
    "Danny Byrd - Sweet Harmony",
    "Roni Size - Brown Paper Bag",
    "Goldie - Inner City Life",
    "LTJ Bukem - Horizons",
    "DJ Marky - LK",
    "Hybrid Minds - Touch",
    "Etherwood - Souvenirs",
    "Metrik - Freefall"
];

class MusicBingoApp {
    constructor() {
        // DOM Elements
        this.grid = document.getElementById('bingoGrid');
        this.counter = document.getElementById('counter');
        this.total = document.getElementById('total');
        this.resetBtn = document.getElementById('resetBtn');
        this.shareBtn = document.getElementById('shareBtn');
        this.gameTitle = document.getElementById('gameTitle');
        this.gameInfo = document.getElementById('gameInfo');
        this.gameInfoText = document.getElementById('gameInfoText');
        this.modeSelector = document.getElementById('modeSelector');

        // Modals
        this.playlistModal = document.getElementById('playlistModal');
        this.qrModal = document.getElementById('qrModal');

        // Current game state
        this.currentGame = null;
        this.currentTracks = [];
        this.currentMode = 'classic';
        this.checkState = [];

        // Migrate legacy state
        migrateLegacyState();

        this.init();
    }

    async init() {
        // Check for game in URL
        const urlGame = getCurrentGameFromUrl();

        if (urlGame) {
            await this.joinGame(urlGame);
        } else {
            // Start in classic mode
            this.startClassicMode();
        }

        this.attachEventListeners();
    }

    // ========================================
    // GAME MODES
    // ========================================

    startClassicMode() {
        this.currentMode = 'classic';
        this.currentGame = {
            gameId: 'classic',
            mode: 'classic',
            seed: 42, // Fixed seed for classic mode
            timestamp: Date.now()
        };

        // Use DnB anthems
        this.currentTracks = DNB_ANTHEMS.map((anthem, index) => ({
            id: `dnb-${index}`,
            name: anthem,
            artist: ''
        }));

        this.gameTitle.textContent = 'DnB';
        this.gameInfo.style.display = 'none';
        this.modeSelector.style.display = 'flex';

        this.loadGame();
    }

    async startHostMode() {
        // Show playlist modal
        this.showPlaylistModal();
    }

    async joinGame(gameState) {
        this.currentGame = gameState;
        this.currentMode = gameState.mode;

        if (gameState.mode === 'spotify') {
            try {
                // Fetch playlist tracks
                const gameData = await createGameFromPlaylist(gameState.playlistId, 25);
                this.currentTracks = gameData.tracks;

                this.gameTitle.textContent = 'Spotify';
                this.gameInfo.style.display = 'block';
                this.gameInfoText.textContent = `Playing: ${gameState.playlistName}`;
                this.modeSelector.style.display = 'none';

            } catch (error) {
                console.error('Failed to load Spotify game:', error);
                this.showToast('Failed to load game. Starting classic mode.');
                this.startClassicMode();
                return;
            }
        } else {
            this.startClassicMode();
            return;
        }

        this.loadGame();
    }

    loadGame() {
        // Shuffle tracks using seeded random
        const shuffled = seededShuffle(this.currentTracks, this.currentGame.seed);
        this.currentTracks = shuffled.slice(0, 25);

        // Load saved progress
        this.checkState = loadGameProgress(this.currentGame.gameId, this.currentTracks.length);

        // Update UI
        this.total.textContent = this.currentTracks.length;
        this.renderGrid();
        this.updateCounter();
    }

    // ========================================
    // GRID RENDERING
    // ========================================

    renderGrid() {
        this.grid.innerHTML = '';

        this.currentTracks.forEach((track, index) => {
            const cell = document.createElement('div');
            cell.className = 'bingo-cell';

            // Display track name (and artist if available)
            const displayText = track.artist
                ? `${track.name}\n${track.artist}`
                : track.name;

            cell.textContent = displayText;
            cell.dataset.index = index;

            if (this.checkState[index]) {
                cell.classList.add('checked');
            }

            this.grid.appendChild(cell);
        });
    }

    updateCounter() {
        const checkedCount = this.checkState.filter(Boolean).length;
        this.counter.textContent = checkedCount;
    }

    toggleCell(index) {
        this.checkState[index] = !this.checkState[index];
        saveGameProgress(this.currentGame.gameId, this.checkState);
        this.updateCounter();

        const cell = this.grid.querySelector(`[data-index="${index}"]`);
        if (this.checkState[index]) {
            cell.classList.add('checked');
            this.triggerHaptic();
        } else {
            cell.classList.remove('checked');
        }
    }

    resetBoard() {
        if (confirm('Reset the entire board? This cannot be undone.')) {
            this.checkState = Array(this.currentTracks.length).fill(false);
            saveGameProgress(this.currentGame.gameId, this.checkState);
            this.renderGrid();
            this.updateCounter();
            this.triggerHaptic('medium');
        }
    }

    // ========================================
    // SPOTIFY HOST MODE
    // ========================================

    showPlaylistModal() {
        this.playlistModal.classList.add('active');

        if (isAuthenticated()) {
            this.showPlaylistList();
        } else {
            this.showSpotifyAuth();
        }
    }

    hidePlaylistModal() {
        this.playlistModal.classList.remove('active');
    }

    showSpotifyAuth() {
        document.getElementById('spotifyAuthSection').style.display = 'block';
        document.getElementById('playlistListSection').style.display = 'none';
    }

    async showPlaylistList() {
        document.getElementById('spotifyAuthSection').style.display = 'none';
        document.getElementById('playlistListSection').style.display = 'block';
        document.getElementById('playlistLoading').style.display = 'block';

        try {
            console.log('Fetching playlists...');

            // Get and display user info
            const user = await getCurrentUser();
            console.log('Current Spotify user:', {
                id: user.id,
                display_name: user.display_name,
                email: user.email,
                product: user.product // premium, free, etc.
            });

            // Show user info in UI
            this.showToast(`Logged in as: ${user.display_name || user.id}${user.email ? ` (${user.email})` : ''}`);

            const playlists = await getAllUserPlaylists();
            console.log(`Loaded ${playlists.length} playlists`);

            if (!playlists || playlists.length === 0) {
                throw new Error('No playlists found');
            }

            this.renderPlaylists(playlists);
        } catch (error) {
            console.error('Failed to load playlists:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });

            // Show more specific error message
            let errorMsg = 'Failed to load playlists. ';
            if (error.message.includes('401') || error.message.includes('expired')) {
                errorMsg += 'Please re-authenticate.';
                clearAccessToken(); // Clear the expired token
            } else if (error.message.includes('403')) {
                errorMsg += 'Permission denied. Check your Spotify app settings.';
            } else if (error.message.includes('429')) {
                errorMsg += 'Rate limited. Please wait a moment.';
            } else {
                errorMsg += error.message || 'Please try again.';
            }

            this.showToast(errorMsg);
            this.showSpotifyAuth();
        } finally {
            document.getElementById('playlistLoading').style.display = 'none';
        }
    }

    renderPlaylists(playlists) {
        const container = document.getElementById('playlistList');
        container.innerHTML = '';

        playlists.forEach(playlist => {
            const item = document.createElement('div');
            item.className = 'playlist-item';
            item.dataset.playlistId = playlist.id;
            item.dataset.playlistName = playlist.name;

            const image = document.createElement('img');
            image.className = 'playlist-image';
            // Handle null/empty images array
            const imageUrl = (playlist.images && playlist.images.length > 0)
                ? playlist.images[0].url
                : '';
            image.src = imageUrl;
            image.alt = playlist.name;

            const info = document.createElement('div');
            info.className = 'playlist-info';

            const name = document.createElement('div');
            name.className = 'playlist-name';
            name.textContent = playlist.name;

            const tracks = document.createElement('div');
            tracks.className = 'playlist-tracks';
            // API response has items.total instead of tracks.total
            const trackCount = playlist.items?.total || playlist.tracks?.total || 0;
            tracks.textContent = `${trackCount} tracks`;

            info.appendChild(name);
            info.appendChild(tracks);
            item.appendChild(image);
            item.appendChild(info);
            container.appendChild(item);

            item.addEventListener('click', () => this.selectPlaylist(playlist));
        });

        // Setup search
        const searchInput = document.getElementById('playlistSearch');
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const items = container.querySelectorAll('.playlist-item');

            items.forEach(item => {
                const name = item.querySelector('.playlist-name').textContent.toLowerCase();
                item.style.display = name.includes(query) ? 'flex' : 'none';
            });
        });
    }

    async selectPlaylist(playlist) {
        this.hidePlaylistModal();
        this.showToast('Creating game from playlist...');

        try {
            // Create game from playlist
            const gameData = await createGameFromPlaylist(playlist.id, 25);

            // Generate game state
            const gameState = {
                gameId: generateGameId(),
                mode: 'spotify',
                playlistId: playlist.id,
                playlistName: playlist.name,
                seed: generateGameSeed(),
                timestamp: Date.now()
            };

            // Create shareable URL
            const shareUrl = createShareableUrl(gameState);

            // Update URL
            updateUrlHash(gameState);

            // Load the game
            this.currentGame = gameState;
            this.currentTracks = gameData.tracks;
            this.currentMode = 'spotify';

            this.gameTitle.textContent = 'Spotify';
            this.gameInfo.style.display = 'block';
            this.gameInfoText.textContent = `Playing: ${playlist.name}`;
            this.modeSelector.style.display = 'none';

            this.loadGame();

            // Show QR code
            showQRCodeModal(shareUrl, playlist.name);

        } catch (error) {
            console.error('Failed to create game:', error);
            this.showToast('Failed to create game. Please try again.');
        }
    }

    // ========================================
    // SHARING
    // ========================================

    async shareProgress() {
        const checkedCount = this.checkState.filter(Boolean).length;
        const total = this.currentTracks.length;

        let shareText;
        if (this.currentMode === 'spotify') {
            shareText = `🎵 Music Bingo: ${checkedCount}/${total} tracks found! 🎧`;
        } else {
            shareText = `🔊 DnB Bingo: ${checkedCount}/${total} anthems found! 🎧`;
        }

        const shareUrl = window.location.href;

        // Try Web Share API
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Music Bingo Progress',
                    text: shareText,
                    url: shareUrl
                });
                return;
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.log('Share failed, falling back to clipboard');
                }
            }
        }

        // Fallback to clipboard
        try {
            await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
            this.showToast('Progress copied to clipboard! 📋');
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            this.showToast('Share failed. Please try again.');
        }
    }

    // ========================================
    // UI HELPERS
    // ========================================

    triggerHaptic(style = 'light') {
        if (navigator.vibrate) {
            const patterns = {
                light: 10,
                medium: 20,
                heavy: 30
            };
            navigator.vibrate(patterns[style] || 10);
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--neon-green);
            color: var(--bg-black);
            padding: 1rem 2rem;
            border-radius: 8px;
            font-weight: 700;
            z-index: 1000;
            animation: slideUp 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================

    attachEventListeners() {
        // Grid clicks
        this.grid.addEventListener('click', (e) => {
            const cell = e.target.closest('.bingo-cell');
            if (cell) {
                const index = parseInt(cell.dataset.index);
                this.toggleCell(index);
            }
        });

        // Reset button
        this.resetBtn.addEventListener('click', () => this.resetBoard());

        // Share button
        this.shareBtn.addEventListener('click', () => this.shareProgress());

        // Mode selector
        const modeBtns = document.querySelectorAll('.mode-btn');
        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;

                // Update active state
                modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                if (mode === 'classic') {
                    window.location.hash = '';
                    this.startClassicMode();
                } else if (mode === 'host') {
                    this.startHostMode();
                }
            });
        });

        // Spotify login
        document.getElementById('spotifyLoginBtn').addEventListener('click', async () => {
            try {
                await authenticateSpotify();
                this.showPlaylistList();
            } catch (error) {
                console.error('Spotify auth failed:', error);
                this.showToast('Spotify login failed. Please try again.');
            }
        });

        // Modal close buttons
        document.getElementById('closePlaylistModal').addEventListener('click', () => {
            this.hidePlaylistModal();
        });

        document.getElementById('closeQrModal').addEventListener('click', () => {
            hideQRCodeModal();
        });

        // Copy URL button
        document.getElementById('copyUrlBtn').addEventListener('click', async () => {
            const url = document.getElementById('shareUrl').value;
            const success = await copyUrlToClipboard(url);
            if (success) {
                this.showToast('Link copied! 📋');
            } else {
                this.showToast('Failed to copy link');
            }
        });

        // Close modals on background click
        this.playlistModal.addEventListener('click', (e) => {
            if (e.target === this.playlistModal) {
                this.hidePlaylistModal();
            }
        });

        this.qrModal.addEventListener('click', (e) => {
            if (e.target === this.qrModal) {
                hideQRCodeModal();
            }
        });
    }
}

// Add toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            transform: translateX(-50%) translateY(100px);
            opacity: 0;
        }
        to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    }
    @keyframes slideDown {
        from {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        to {
            transform: translateX(-50%) translateY(100px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize app
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new MusicBingoApp());
} else {
    new MusicBingoApp();
}
