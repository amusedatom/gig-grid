// ========================================
// CARD BUILDER
// Logic for creating and managing custom bingo cards
// ========================================

class CardBuilder {
    constructor() {
        this.selectedSongs = []; // Array of song objects { id?, name, artist, display }
        this.builderName = 'My Card';
        this.loadFromLocalStorage();
    }

    /**
     * Add a song to the builder
     * @param {Object} song - Song object { id?, name, artist, display }
     */
    addSong(song) {
        // Check if song already exists
        const exists = this.selectedSongs.some(s =>
            s.display === song.display || (s.id && s.id === song.id)
        );

        if (exists) {
            console.log('Song already added:', song.display);
            return false;
        }

        this.selectedSongs.push(song);
        this.saveToLocalStorage();
        return true;
    }

    /**
     * Remove a song from the builder
     * @param {number} index - Index of song to remove
     */
    removeSong(index) {
        if (index >= 0 && index < this.selectedSongs.length) {
            this.selectedSongs.splice(index, 1);
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    /**
     * Clear all songs
     */
    clearAll() {
        this.selectedSongs = [];
        this.saveToLocalStorage();
    }

    /**
     * Set builder name
     * @param {string} name - Name for the card builder
     */
    setName(name) {
        this.builderName = name || 'My Card';
        this.saveToLocalStorage();
    }

    /**
     * Get current song count
     * @returns {number} Number of songs
     */
    getSongCount() {
        return this.selectedSongs.length;
    }

    /**
     * Check if enough songs to share cards
     * @returns {boolean} True if 25+ songs
     */
    canShareCards() {
        return this.selectedSongs.length >= 25;
    }

    /**
     * Get all selected songs
     * @returns {Array} Array of song objects
     */
    getSongs() {
        return [...this.selectedSongs];
    }

    /**
     * Import songs from JSON
     * @param {Object} data - JSON data with songs array
     * @returns {boolean} Success status
     */
    importFromJSON(data) {
        try {
            if (!data || !Array.isArray(data.songs)) {
                throw new Error('Invalid JSON format');
            }

            // Clear existing and add imported songs
            this.selectedSongs = [];

            data.songs.forEach(song => {
                // Support both formats: string or object
                if (typeof song === 'string') {
                    // Parse "Artist - Song" format
                    const parts = song.split(' - ');
                    const artist = parts[0] || 'Unknown';
                    const name = parts.slice(1).join(' - ') || song;

                    this.selectedSongs.push({
                        name,
                        artist,
                        display: song
                    });
                } else if (song.name && song.artist) {
                    this.selectedSongs.push({
                        id: song.id,
                        name: song.name,
                        artist: song.artist,
                        display: `${song.artist} - ${song.name}`
                    });
                }
            });

            if (data.name) {
                this.builderName = data.name;
            }

            this.saveToLocalStorage();
            return true;
        } catch (e) {
            console.error('Failed to import JSON:', e);
            return false;
        }
    }

    /**
     * Export songs to JSON
     * @returns {Object} JSON object
     */
    exportToJSON() {
        return {
            name: this.builderName,
            version: '1.0',
            created: new Date().toISOString(),
            songCount: this.selectedSongs.length,
            songs: this.selectedSongs.map(s => ({
                name: s.name,
                artist: s.artist,
                id: s.id
            }))
        };
    }

    /**
     * Generate shareable cards
     * @param {number} count - Number of cards to generate
     * @returns {Array} Array of { gameState, url } objects
     */
    generateCards(count = 5) {
        if (!this.canShareCards()) {
            throw new Error('Need at least 25 songs to generate cards');
        }

        // Determine if using database IDs or custom songs
        const hasAllIds = this.selectedSongs.every(s => s.id);

        let songPool;
        if (hasAllIds) {
            // Use compact ID format
            songPool = this.selectedSongs.map(s => s.id);
        } else {
            // Use Base64 encoded custom songs
            songPool = this.selectedSongs.map(s => ({
                name: s.name,
                artist: s.artist
            }));
        }

        const cards = generateCardPermutations(songPool, count, this.builderName);

        return cards.map(gameState => ({
            gameState,
            url: createShareableUrl(gameState)
        }));
    }

    /**
     * Save to localStorage
     */
    saveToLocalStorage() {
        try {
            const data = {
                name: this.builderName,
                songs: this.selectedSongs,
                lastModified: Date.now()
            };
            localStorage.setItem('card-builder-state', JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
        }
    }

    /**
     * Load from localStorage
     */
    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('card-builder-state');
            if (saved) {
                const data = JSON.parse(saved);
                this.builderName = data.name || 'My Card';
                this.selectedSongs = data.songs || [];
            }
        } catch (e) {
            console.error('Failed to load from localStorage:', e);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CardBuilder };
}
