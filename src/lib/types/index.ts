import type { SongDisplay } from '$lib/game/songs';

/** A bingo cell - either a song or a blank space */
export interface BingoCell extends SongDisplay {
	isBlank: boolean;
}

/** Available game modes */
export type GameMode = 'classic' | 'custom';

/** URL parameter keys for state serialization */
export const URL_PARAMS = {
	SEED: 's',
	CHECKED: 'c',
	MODE: 'm',
	SONGS: 'songs',
	SIZE: 'sz',
	VALID_COUNT: 'v'
} as const;
