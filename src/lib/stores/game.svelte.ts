import { goto } from '$app/navigation';
import { page } from '$app/state';
import { browser } from '$app/environment';
import {
    encodeCheckedBitmask,
    decodeCheckedBitmask,
    encodeSongsToBase64,
    decodeSongsFromBase64
} from '$lib/game/encoding';
import { generateGameSeed, seededSelect } from '$lib/game/rng';
import { getAllSongs, getSongsByIds, type SongDisplay } from '$lib/game/songs';

export type GameMode = 'classic' | 'custom' | 'spotify';

export class GameStore {
    // State
    seed = $state(0);
    checkedMask = $state('0');
    mode = $state<GameMode>('classic');
    customSongs = $state<string[]>([]); // For custom mode

    // Derived state
    generated = $derived(this.seed !== 0);

    // Flexible Grid State
    size = $state(5); // Default 5x5
    validCount = $state(25); // Default all valid

    // Derived state
    checked = $derived(decodeCheckedBitmask(this.checkedMask, this.size * this.size));

    grid = $derived.by(() => {
        let pool: SongDisplay[] = [];
        const totalCells = this.size * this.size;

        if (this.mode === 'classic') {
            pool = getAllSongs();
        } else if (this.mode === 'custom' && this.customSongs.length > 0) {
            pool = this.customSongs.map((name, i) => {
                const parts = name.split(' - ');
                return {
                    id: `custom-${i}`,
                    name: parts.length > 1 ? parts.slice(1).join(' - ') : name,
                    artist: parts.length > 1 ? parts[0] : '', // No artist if no separator
                    display: name
                };
            });
        }

        // Select valid songs
        // If we don't have enough songs in pool for validCount, we just use what we have
        const countToSelect = Math.min(this.validCount, pool.length, totalCells);
        let selected = seededSelect(pool, countToSelect, this.seed);

        // Add BLANK cells if needed
        const blanksNeeded = totalCells - selected.length;
        if (blanksNeeded > 0) {
            const blanks = Array(blanksNeeded).fill({
                id: 'BLANK',
                name: '',
                artist: '',
                display: ''
            });
            selected = [...selected, ...blanks];
        }

        // Shuffle everything together so blanks are random
        // We use a derived seed combining main seed + size so changing size reshuffles
        return seededSelect(selected, totalCells, this.seed + this.size);
    });

    winningLines = $derived.by(() => {
        const lines: number[][] = [];
        const c = this.checked;
        const sz = this.size;

        // Rows
        for (let r = 0; r < sz; r++) {
            const rowIds: number[] = [];
            let allChecked = true;
            for (let col = 0; col < sz; col++) {
                const idx = r * sz + col;
                rowIds.push(idx);
                // Blank cells (id 'BLANK') should effectively be "free spaces" or NOT winnable?
                // Usually in bingo, empty spaces might be free. 
                // BUT here, "validCount" implies only valid cells have songs.
                // Let's assume BLANK cells are NOT checkable, so they break the line?
                // User said "Anything not valid is blank". 
                // In typical bingo, a blank interactive-less cell breaks the win unless it's a "Free Space".
                // Let's assume you must check valid songs.
                if (!c[idx]) allChecked = false;
            }
            if (allChecked) lines.push(rowIds);
        }

        // Cols
        for (let col = 0; col < sz; col++) {
            const colIds: number[] = [];
            let allChecked = true;
            for (let r = 0; r < sz; r++) {
                const idx = r * sz + col;
                colIds.push(idx);
                if (!c[idx]) allChecked = false;
            }
            if (allChecked) lines.push(colIds);
        }

        // Diagonals
        // Top-Left to Bottom-Right
        const d1: number[] = [];
        let d1Checked = true;
        for (let i = 0; i < sz; i++) {
            const idx = i * sz + i;
            d1.push(idx);
            if (!c[idx]) d1Checked = false;
        }
        if (d1Checked) lines.push(d1);

        // Top-Right to Bottom-Left
        const d2: number[] = [];
        let d2Checked = true;
        for (let i = 0; i < sz; i++) {
            const idx = i * sz + (sz - 1 - i);
            d2.push(idx);
            if (!c[idx]) d2Checked = false;
        }
        if (d2Checked) lines.push(d2);

        return lines;
    });

    hasBingo = $derived(this.winningLines.length > 0);

    constructor() {
        if (browser) {
            this.syncFromUrl();
        }
    }

    /**
     * Initialize state from URL parameters
     */
    /**
     * Initialize state from URL parameters
     */
    syncFromUrl() {
        const params = page.url.searchParams;

        // Size & Valid Count
        const szParam = params.get('sz');
        const vParam = params.get('v');

        const newSize = szParam ? parseInt(szParam, 10) : 5;
        if (this.size !== newSize) this.size = newSize;

        const newValidCount = vParam ? parseInt(vParam, 10) : this.size * this.size;
        if (this.validCount !== newValidCount) this.validCount = newValidCount;

        // Mode - PARSE FIRST so that if we generate a seed, we know the mode!
        const modeParam = params.get('m');
        if (modeParam === 'custom') {
            if (this.mode !== 'custom') this.mode = 'custom';

            const songsParam = params.get('songs');
            if (songsParam) {
                const decoded = decodeSongsFromBase64(songsParam);
                if (decoded && JSON.stringify(this.customSongs) !== JSON.stringify(decoded)) {
                    this.customSongs = decoded;
                }
            }
        } else {
            if (this.mode !== 'classic') this.mode = 'classic';
        }

        // Seed
        const seedParam = params.get('s');
        if (seedParam) {
            const newSeed = parseInt(seedParam, 10);
            if (this.seed !== newSeed) this.seed = newSeed;
        } else if (params.get('m') === 'custom') {
            // If we have custom game data but no seed, generate one to start the game
            // Only if we don't already have one!
            if (this.seed === 0) {
                this.seed = generateGameSeed();
                this.updateUrl();
            }
        }
        // Do NOT auto-generate seed if missing and no game data. Wait for user action.

        // Checked state
        const checkedParam = params.get('c');
        if (checkedParam) {
            if (this.checkedMask !== checkedParam) this.checkedMask = checkedParam;
        } else {
            if (this.checkedMask !== '0') this.checkedMask = '0'; // Reset if no state provided (fresh game)
        }

    }

    /**
     * Update URL with current state
     * Uses replaceState to avoid history spam
     */
    updateUrl() {
        if (!browser) return;

        const url = new URL(window.location.href);
        const params = url.searchParams;

        params.set('s', this.seed.toString());
        params.set('c', this.checkedMask);

        // Only set size/valid if different from default 5x5 full
        if (this.size !== 5) params.set('sz', this.size.toString());
        else params.delete('sz');

        if (this.validCount !== this.size * this.size) params.set('v', this.validCount.toString());
        else params.delete('v');

        if (this.mode === 'custom') {
            params.set('m', 'custom');
            if (this.customSongs.length > 0) {
                params.set('songs', encodeSongsToBase64(this.customSongs));
            }
        } else {
            params.delete('m');
            params.delete('songs');
        }

        goto(url.toString(), { replaceState: true, keepFocus: true, noScroll: true });
    }

    /**
     * Toggle a cell's checked state
     * @param index - Grid index
     */
    toggleCell(index: number) {
        if (index < 0 || index >= this.size * this.size) return;

        // Check if cell is BLANK - find song at index
        if (this.grid[index].id === 'BLANK') return;

        const currentChecked = [...this.checked];
        currentChecked[index] = !currentChecked[index];
        this.checkedMask = encodeCheckedBitmask(currentChecked);

        this.updateUrl();
    }

    /**
     * Start a new game with a new seed (accessed via Host Game)
     */
    createGame() {
        this.seed = generateGameSeed();
        this.checkedMask = '0';
        this.updateUrl();
    }

    /**
     * Start a new game with a new seed
     * (Renamed/Aliased for clarity or legacy support, but createGame is preferred for explicit creation)
     */
    newGame() {
        this.createGame();
    }
}

// Create a singleton instance
export const game = new GameStore();
