// ========================================
// GIG BINGO
// Main Application Logic
// ========================================


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
        this.welcomePage = document.getElementById('welcomePage');
        this.gameFooter = document.getElementById('gameFooter');
        this.headerCounter = document.getElementById('headerCounter');

        // Modals
        this.playlistModal = document.getElementById('playlistModal');
        this.qrModal = document.getElementById('qrModal');
        this.builderModal = document.getElementById('builderModal');
        this.shareCardsModal = document.getElementById('shareCardsModal');

        // Current game state
        this.currentGame = null;
        this.currentTracks = [];
        this.currentMode = null;
        this.isFrozenView = false;
        this.checkState = [];

        // Card builder
        this.cardBuilder = new CardBuilder();

        // Migrate legacy state
        migrateLegacyState();

        this.init();
    }

    async init() {
        // Check for game in URL
        const urlGame = getCurrentGameFromUrl();

        if (urlGame) {
            if (urlGame.frozen) {
                // Frozen view — read-only snapshot, don't overwrite anything
                await this.enterFrozenView(urlGame);
            } else {
                await this.joinGame(urlGame);
            }
        } else {
            // Show welcome page when no game URL present
            this.showWelcomePage();
        }

        this.attachEventListeners();
    }

    // ========================================
    // GAME MODES
    // ========================================

    showWelcomePage() {
        this.welcomePage.style.display = 'flex';
        this.grid.style.display = 'none';
        this.gameFooter.style.display = 'none';
        this.gameInfo.style.display = 'none';
        this.headerCounter.style.display = 'none';
        this.gameTitle.textContent = 'Gig';
    }

    hideWelcomePage() {
        this.welcomePage.style.display = 'none';
        this.grid.style.display = 'grid';
        this.gameFooter.style.display = 'flex';
        this.headerCounter.style.display = 'flex';
    }

    async startHostMode() {
        // Show host game modal with options
        this.showHostGameOptions();
    }

    showHostGameOptions() {
        this.playlistModal.classList.add('active');
        document.getElementById('hostGameOptions').style.display = 'block';
        document.getElementById('spotifyAuthSection').style.display = 'none';
        document.getElementById('playlistListSection').style.display = 'none';
    }

    showCreateFromScratch() {
        // Hide host options, show builder
        this.hidePlaylistModal();
        this.showBuilderModal();
    }

    showImportPlaylist() {
        // Hide host options, show Spotify auth or playlist list
        document.getElementById('hostGameOptions').style.display = 'none';

        if (isAuthenticated()) {
            this.showPlaylistList();
        } else {
            this.showSpotifyAuth();
        }
    }

    async joinGame(gameState) {
        this.currentGame = gameState;
        this.currentMode = gameState.mode;

        if (gameState.mode === 'spotify') {
            try {
                // Fetch playlist tracks
                const gameData = await createGameFromPlaylist(gameState.playlistId, 25);
                this.currentTracks = gameData.tracks;

                this.gameTitle.textContent = 'Gig';
                this.gameInfo.style.display = 'block';
                this.gameInfoText.textContent = `Playing: ${gameState.playlistName}`;
                this.hideWelcomePage();

            } catch (error) {
                console.error('Failed to load Spotify game:', error);
                this.showToast('Failed to load game.');
                this.showWelcomePage();
                return;
            }
        } else if (gameState.mode === 'card') {
            // Card builder mode
            try {
                let songs;
                if (gameState.songIds) {
                    // Using song database IDs
                    songs = getSongsByIds(gameState.songIds);
                } else if (gameState.customSongs) {
                    // Using custom Base64-encoded songs
                    songs = gameState.customSongs.map((songStr, index) => {
                        const parts = songStr.split(' - ');
                        return {
                            id: `custom-${index}`,
                            name: parts.slice(1).join(' - ') || songStr,
                            artist: parts[0] || ''
                        };
                    });
                } else {
                    throw new Error('No songs in card state');
                }

                this.currentTracks = songs;
                this.gameTitle.textContent = 'Gig';
                this.gameInfo.style.display = 'block';
                this.gameInfoText.textContent = `Playing: ${gameState.cardName}`;
                this.hideWelcomePage();

            } catch (error) {
                console.error('Failed to load card game:', error);
                this.showToast('Failed to load card.');
                this.showWelcomePage();
                return;
            }
        } else {
            this.showWelcomePage();
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
        this.updateScoreBadge();
    }

    updateScoreBadge() {
        const { score, lines } = this.calculateScore();
        const badge = document.getElementById('scoreBadge');
        badge.textContent = `⭐ ${score}`;
        badge.classList.toggle('has-lines', lines > 0);
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
    // CARD BUILDER MODE
    // ========================================

    startBuilderMode() {
        this.showBuilderModal();
    }

    showBuilderModal() {
        this.builderModal.classList.add('active');

        // Load game title from builder
        const titleInput = document.getElementById('builderGameTitle');
        if (titleInput) {
            titleInput.value = this.cardBuilder.builderName || '';
        }

        this.renderBuilderUI();
    }

    hideBuilderModal() {
        this.builderModal.classList.remove('active');
    }

    renderBuilderUI() {
        // Update song count display
        const songCount = this.cardBuilder.getSongCount();
        document.getElementById('builderSongCount').textContent = songCount;

        // Update game title from input
        const titleInput = document.getElementById('builderGameTitle');
        if (titleInput && titleInput.value) {
            this.cardBuilder.setName(titleInput.value);
        }

        // Enable/disable share button
        const shareBtn = document.getElementById('builderShareBtn');
        if (this.cardBuilder.canShareCards()) {
            shareBtn.disabled = false;
            shareBtn.textContent = `Share Cards (${songCount} songs)`;
        } else {
            shareBtn.disabled = true;
            shareBtn.textContent = `Add ${25 - songCount} more songs`;
        }

        // Render selected songs list
        this.renderSelectedSongs();
    }

    renderSelectedSongs() {
        const container = document.getElementById('selectedSongsList');
        const songs = this.cardBuilder.getSongs();

        if (songs.length === 0) {
            container.innerHTML = '<p class="empty-state">No songs added yet. Search and add songs below.</p>';
            return;
        }

        container.innerHTML = songs.map((song, index) => `
            <div class="selected-song-item">
                <span class="song-display">${song.display}</span>
                <button class="btn-remove" data-index="${index}">×</button>
            </div>
        `).join('');

        // Attach remove listeners
        container.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                this.cardBuilder.removeSong(index);
                this.renderBuilderUI();
            });
        });
    }

    performSongSearch(query) {
        const results = searchSongs(query);
        const container = document.getElementById('songSearchResults');

        if (results.length === 0) {
            container.innerHTML = '<p class="empty-state">No songs found</p>';
            return;
        }

        container.innerHTML = results.slice(0, 50).map(song => `
            <div class="song-search-item" data-song='${JSON.stringify(song)}'>
                <span class="song-display">${song.display}</span>
                <button class="btn-add">+</button>
            </div>
        `).join('');

        // Attach add listeners
        container.querySelectorAll('.song-search-item').forEach(item => {
            item.querySelector('.btn-add').addEventListener('click', () => {
                const song = JSON.parse(item.dataset.song);
                const added = this.cardBuilder.addSong(song);
                if (added) {
                    this.renderBuilderUI();
                    this.showToast(`Added: ${song.display}`);
                } else {
                    this.showToast('Song already added');
                }
            });
        });
    }

    addCustomSong() {
        const input = document.getElementById('songSearchInput');
        const query = input.value.trim();

        if (!query) {
            this.showToast('Enter a song name first');
            return;
        }

        // Parse query: "Artist - Song" or just "Song"
        let artist = '';
        let name = query;

        if (query.includes(' - ')) {
            const parts = query.split(' - ');
            artist = parts[0].trim();
            name = parts.slice(1).join(' - ').trim();
        }

        const song = {
            id: `custom-${Date.now()}`,
            name: name,
            artist: artist,
            display: query
        };

        const added = this.cardBuilder.addSong(song);
        if (added) {
            this.renderBuilderUI();
            this.showToast(`Added Custom: ${query}`);
            input.value = ''; // Clear input
            this.performSongSearch(''); // Refresh results
        } else {
            this.showToast('Song already added');
        }
    }

    showShareCardsModal() {
        if (!this.cardBuilder.canShareCards()) {
            this.showToast('Need at least 25 songs to share cards');
            return;
        }

        // Sync name from input
        const titleInput = document.getElementById('builderGameTitle');
        if (titleInput && titleInput.value) {
            this.cardBuilder.setName(titleInput.value);
        }

        // Initialize card counter
        this.cardCounter = 1;

        this.shareCardsModal.classList.add('active');
        this.generateNewCard();
    }

    hideShareCardsModal() {
        this.shareCardsModal.classList.remove('active');
        this.cardCounter = 0;
    }

    generateNewCard() {
        try {
            // Generate a single new card
            const cards = this.cardBuilder.generateCards(1);
            const card = cards[0];

            // Update UI
            document.getElementById('currentCardName').textContent = `${this.cardBuilder.builderName} - #${this.cardCounter}`;
            document.getElementById('currentCardUrl').value = card.url;
        } catch (error) {
            console.error('Failed to generate card:', error);
            this.showToast('Failed to generate card');
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
        document.getElementById('hostGameOptions').style.display = 'none';
        document.getElementById('spotifyAuthSection').style.display = 'block';
        document.getElementById('playlistListSection').style.display = 'none';
    }

    async showPlaylistList() {
        document.getElementById('hostGameOptions').style.display = 'none';
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

            this.gameTitle.textContent = 'Gig';
            this.gameInfo.style.display = 'block';
            this.gameInfoText.textContent = `Playing: ${playlist.name}`;
            this.hideWelcomePage();

            this.loadGame();

            // Show QR code
            showQRCodeModal(shareUrl, playlist.name);

        } catch (error) {
            console.error('Failed to create game:', error);
            this.showToast('Failed to create game. Please try again.');
        }
    }

    // ========================================
    // SCORING
    // ========================================

    calculateScore() {
        const size = 5;
        const checked = this.checkState;
        const songs = checked.filter(Boolean).length;
        let lines = 0;

        // Check rows
        for (let r = 0; r < size; r++) {
            if (checked.slice(r * size, r * size + size).every(Boolean)) lines++;
        }

        // Check columns
        for (let c = 0; c < size; c++) {
            let full = true;
            for (let r = 0; r < size; r++) {
                if (!checked[r * size + c]) { full = false; break; }
            }
            if (full) lines++;
        }

        // Check main diagonal (top-left → bottom-right)
        if ([0, 6, 12, 18, 24].every(i => checked[i])) lines++;

        // Check anti-diagonal (top-right → bottom-left)
        if ([4, 8, 12, 16, 20].every(i => checked[i])) lines++;

        const score = songs + (lines * 3);
        return { score, songs, lines };
    }

    // ========================================
    // SHARING
    // ========================================

    async shareProgress() {
        const { score, songs, lines } = this.calculateScore();
        const total = this.currentTracks.length;

        let shareText = `🎶 Gig Bingo — Score: ${score}\n`;
        shareText += `📀 ${songs}/${total} tracks`;
        if (lines > 0) {
            shareText += ` | 🔥 ${lines} line${lines > 1 ? 's' : ''} completed!`;
        }

        // Build a frozen snapshot URL instead of sharing the live game URL
        const frozenState = Object.assign({}, this.currentGame, {
            frozen: true,
            checkedSnapshot: [...this.checkState]
        });
        const shareUrl = createShareableUrl(frozenState);

        // Try Web Share API
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Gig Bingo Score',
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
            this.showToast('Score copied to clipboard! 📋');
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            this.showToast('Share failed. Please try again.');
        }
    }

    // ========================================
    // FROZEN VIEW (read-only shared board)
    // ========================================

    async enterFrozenView(gameState) {
        this.isFrozenView = true;
        document.body.classList.add('frozen-view');

        // Load the game tracks (same as joinGame but without saving progress)
        this.currentGame = gameState;
        this.currentMode = gameState.mode;

        if (gameState.mode === 'spotify') {
            try {
                const gameData = await createGameFromPlaylist(gameState.playlistId, 25);
                this.currentTracks = gameData.tracks;
            } catch (error) {
                console.error('Failed to load frozen Spotify game:', error);
                this.showToast('Failed to load shared board.');
                this.exitFrozenView();
                return;
            }
        } else if (gameState.mode === 'card') {
            try {
                let songs;
                if (gameState.songIds) {
                    songs = getSongsByIds(gameState.songIds);
                } else if (gameState.customSongs) {
                    songs = gameState.customSongs.map((songStr, index) => {
                        const parts = songStr.split(' - ');
                        return {
                            id: `custom-${index}`,
                            name: parts.slice(1).join(' - ') || songStr,
                            artist: parts[0] || ''
                        };
                    });
                } else {
                    throw new Error('No songs in frozen state');
                }
                this.currentTracks = songs;
            } catch (error) {
                console.error('Failed to load frozen card game:', error);
                this.showToast('Failed to load shared board.');
                this.exitFrozenView();
                return;
            }
        }

        // Shuffle tracks using the same seed
        const shuffled = seededShuffle(this.currentTracks, gameState.seed);
        this.currentTracks = shuffled.slice(0, 25);

        // Use the snapshot check state (not localStorage)
        this.checkState = gameState.checkedSnapshot || Array(25).fill(false);

        // Update UI
        this.gameTitle.textContent = 'Gig';
        this.gameInfo.style.display = 'block';
        const gameName = gameState.playlistName || gameState.cardName || 'Classic';
        this.gameInfoText.textContent = `Viewing: ${gameName}`;
        this.hideWelcomePage();

        // Show frozen banner, hide footer
        document.getElementById('frozenBanner').style.display = 'flex';
        document.querySelector('.footer').style.display = 'none';

        this.total.textContent = this.currentTracks.length;
        this.renderGrid();
        this.updateCounter();
    }

    exitFrozenView() {
        this.isFrozenView = false;
        document.body.classList.remove('frozen-view');

        // Hide frozen banner
        document.getElementById('frozenBanner').style.display = 'none';

        // Clear the hash and go back to the welcome page
        history.replaceState(null, '', window.location.pathname);
        this.showWelcomePage();
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
            background: var(--accent);
            color: var(--text-inverse);
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-family: inherit;
            font-weight: 600;
            font-size: 0.9rem;
            z-index: 2000;
            animation: slideUp 0.3s ease;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
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
        // Grid clicks (disabled in frozen view)
        this.grid.addEventListener('click', (e) => {
            if (this.isFrozenView) return;
            const cell = e.target.closest('.bingo-cell');
            if (cell) {
                const index = parseInt(cell.dataset.index);
                this.toggleCell(index);
            }
        });

        // Exit frozen view button
        const exitFrozenBtn = document.getElementById('exitFrozenBtn');
        if (exitFrozenBtn) {
            exitFrozenBtn.addEventListener('click', () => this.exitFrozenView());
        }

        // Reset button
        this.resetBtn.addEventListener('click', () => this.resetBoard());

        // Share button
        this.shareBtn.addEventListener('click', () => this.shareProgress());

        // Welcome page Host Game button
        const welcomeHostBtn = document.getElementById('welcomeHostBtn');
        if (welcomeHostBtn) {
            welcomeHostBtn.addEventListener('click', () => {
                this.startHostMode();
            });
        }

        // Host game option buttons
        if (document.getElementById('createFromScratchBtn')) {
            document.getElementById('createFromScratchBtn').addEventListener('click', () => {
                this.showCreateFromScratch();
            });
        }

        if (document.getElementById('importPlaylistBtn')) {
            document.getElementById('importPlaylistBtn').addEventListener('click', () => {
                this.showImportPlaylist();
            });
        }

        // Back buttons
        if (document.getElementById('backToHostOptions')) {
            document.getElementById('backToHostOptions').addEventListener('click', () => {
                this.showHostGameOptions();
            });
        }

        if (document.getElementById('backToHostOptionsFromList')) {
            document.getElementById('backToHostOptionsFromList').addEventListener('click', () => {
                this.showHostGameOptions();
            });
        }

        // Current card copy/share buttons - regenerate after each share
        if (document.getElementById('copyCurrentCardBtn')) {
            document.getElementById('copyCurrentCardBtn').addEventListener('click', async () => {
                const url = document.getElementById('currentCardUrl').value;
                const success = await copyUrlToClipboard(url);
                if (success) {
                    this.showToast('Link copied! 📋');
                    // Increment counter and generate new card
                    this.cardCounter++;
                    this.generateNewCard();
                }
            });
        }

        if (document.getElementById('whatsappCurrentCardBtn')) {
            document.getElementById('whatsappCurrentCardBtn').addEventListener('click', () => {
                const url = document.getElementById('currentCardUrl').value;
                const text = encodeURIComponent(`Join my Gig Bingo game! ${url}`);
                window.open(`https://wa.me/?text=${text}`, '_blank');
                // Increment counter and generate new card
                this.cardCounter++;
                this.generateNewCard();
            });
        }

        // Builder modal events
        if (document.getElementById('closeBuilderModal')) {
            document.getElementById('closeBuilderModal').addEventListener('click', () => {
                this.hideBuilderModal();
            });
        }

        if (document.getElementById('builderShareBtn')) {
            document.getElementById('builderShareBtn').addEventListener('click', () => {
                this.showShareCardsModal();
            });
        }

        if (document.getElementById('songSearchInput')) {
            const searchInput = document.getElementById('songSearchInput');
            let searchTimeout;

            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.performSongSearch(e.target.value);
                }, 300);
            });

            // Handle "Enter" key to add custom
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.addCustomSong();
                }
            });

            // Initial search to show all songs
            this.performSongSearch('');
        }

        // Add custom song button
        if (document.getElementById('addCustomSongBtn')) {
            document.getElementById('addCustomSongBtn').addEventListener('click', () => {
                this.addCustomSong();
            });
        }

        // Title input listener
        if (document.getElementById('builderGameTitle')) {
            document.getElementById('builderGameTitle').addEventListener('input', (e) => {
                this.cardBuilder.setName(e.target.value);
            });
        }

        // Share cards modal events
        if (document.getElementById('closeShareCardsModal')) {
            document.getElementById('closeShareCardsModal').addEventListener('click', () => {
                this.hideShareCardsModal();
            });
        }

        // Close builder modals on background click
        if (this.builderModal) {
            this.builderModal.addEventListener('click', (e) => {
                if (e.target === this.builderModal) {
                    this.hideBuilderModal();
                }
            });
        }

        if (this.shareCardsModal) {
            this.shareCardsModal.addEventListener('click', (e) => {
                if (e.target === this.shareCardsModal) {
                    this.hideShareCardsModal();
                }
            });
        }

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
