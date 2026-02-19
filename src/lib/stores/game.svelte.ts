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
import { getAllSongs, type SongDisplay } from '$lib/game/songs';
import { GAME } from '$lib/constants';
import { URL_PARAMS, type GameMode, type BingoCell } from '$lib/types';

export class GameStore {
	seed = $state(0);
	checkedMask = $state('0');
	mode = $state<GameMode>('classic');
	customSongs = $state<string[]>([]);
	size = $state<number>(GAME.DEFAULT_GRID_SIZE);
	validCount = $state<number>(GAME.DEFAULT_GRID_SIZE * GAME.DEFAULT_GRID_SIZE);

	generated = $derived(this.seed !== 0);
	checked = $derived(decodeCheckedBitmask(this.checkedMask, this.size * this.size));

	grid = $derived.by((): BingoCell[] => {
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
					artist: parts.length > 1 ? parts[0] : '',
					display: name
				};
			});
		}

		const countToSelect = Math.min(this.validCount, pool.length, totalCells);
		let selected: BingoCell[] = seededSelect(pool, countToSelect, this.seed).map((s) => ({
			...s,
			isBlank: false
		}));

		const blanksNeeded = totalCells - selected.length;
		if (blanksNeeded > 0) {
			const blanks: BingoCell[] = Array.from({ length: blanksNeeded }, () => ({
				id: GAME.BLANK_CELL_ID,
				name: '',
				artist: '',
				display: '',
				isBlank: true
			}));
			selected = [...selected, ...blanks];
		}

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
				if (!c[idx]) allChecked = false;
			}
			if (allChecked) lines.push(rowIds);
		}

		// Columns
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

		// Diagonal: top-left to bottom-right
		const d1: number[] = [];
		let d1Checked = true;
		for (let i = 0; i < sz; i++) {
			const idx = i * sz + i;
			d1.push(idx);
			if (!c[idx]) d1Checked = false;
		}
		if (d1Checked) lines.push(d1);

		// Diagonal: top-right to bottom-left
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

	/** Initialize state from URL parameters */
	syncFromUrl() {
		const params = page.url.searchParams;

		const szParam = params.get(URL_PARAMS.SIZE);
		const vParam = params.get(URL_PARAMS.VALID_COUNT);

		const newSize = szParam ? parseInt(szParam, 10) : GAME.DEFAULT_GRID_SIZE;
		if (this.size !== newSize) this.size = newSize;

		const newValidCount = vParam ? parseInt(vParam, 10) : this.size * this.size;
		if (this.validCount !== newValidCount) this.validCount = newValidCount;

		const modeParam = params.get(URL_PARAMS.MODE);
		if (modeParam === 'custom') {
			if (this.mode !== 'custom') this.mode = 'custom';

			const songsParam = params.get(URL_PARAMS.SONGS);
			if (songsParam) {
				const decoded = decodeSongsFromBase64(songsParam);
				if (decoded && JSON.stringify(this.customSongs) !== JSON.stringify(decoded)) {
					this.customSongs = decoded;
				}
			}
		} else {
			if (this.mode !== 'classic') this.mode = 'classic';
		}

		const seedParam = params.get(URL_PARAMS.SEED);
		if (seedParam) {
			const newSeed = parseInt(seedParam, 10);
			if (this.seed !== newSeed) this.seed = newSeed;
		} else if (params.get(URL_PARAMS.MODE) === 'custom') {
			if (this.seed === 0) {
				this.seed = generateGameSeed();
				this.updateUrl();
			}
		}

		const checkedParam = params.get(URL_PARAMS.CHECKED);
		if (checkedParam) {
			if (this.checkedMask !== checkedParam) this.checkedMask = checkedParam;
		} else {
			if (this.checkedMask !== '0') this.checkedMask = '0';
		}
	}

	/** Update URL with current state (uses replaceState to avoid history spam) */
	updateUrl() {
		if (!browser) return;

		const url = new URL(window.location.href);
		const params = url.searchParams;

		params.set(URL_PARAMS.SEED, this.seed.toString());
		params.set(URL_PARAMS.CHECKED, this.checkedMask);

		if (this.size !== GAME.DEFAULT_GRID_SIZE) params.set(URL_PARAMS.SIZE, this.size.toString());
		else params.delete(URL_PARAMS.SIZE);

		if (this.validCount !== this.size * this.size)
			params.set(URL_PARAMS.VALID_COUNT, this.validCount.toString());
		else params.delete(URL_PARAMS.VALID_COUNT);

		if (this.mode === 'custom') {
			params.set(URL_PARAMS.MODE, 'custom');
			if (this.customSongs.length > 0) {
				params.set(URL_PARAMS.SONGS, encodeSongsToBase64(this.customSongs));
			}
		} else {
			params.delete(URL_PARAMS.MODE);
			params.delete(URL_PARAMS.SONGS);
		}

		goto(url.toString(), { replaceState: true, keepFocus: true, noScroll: true });
	}

	/** Toggle a cell's checked state */
	toggleCell(index: number) {
		if (index < 0 || index >= this.size * this.size) return;
		if (this.grid[index].isBlank) return;

		const currentChecked = [...this.checked];
		currentChecked[index] = !currentChecked[index];
		this.checkedMask = encodeCheckedBitmask(currentChecked);

		this.updateUrl();
	}

	/** Start a new game with a fresh seed */
	createGame() {
		this.seed = generateGameSeed();
		this.checkedMask = '0';
		this.updateUrl();
	}
}

export const game = new GameStore();
