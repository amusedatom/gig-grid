import { describe, it, expect } from 'vitest';
import {
	mulberry32,
	createSeededRandom,
	seededShuffle,
	seededSelect,
	generateGameSeed,
	hashString
} from './rng';

describe('mulberry32', () => {
	it('produces deterministic sequence from same seed', () => {
		const rng1 = mulberry32(12345);
		const rng2 = mulberry32(12345);

		expect(rng1()).toBe(rng2());
		expect(rng1()).toBe(rng2());
		expect(rng1()).toBe(rng2());
	});

	it('produces values between 0 and 1', () => {
		const rng = mulberry32(42);
		for (let i = 0; i < 1000; i++) {
			const val = rng();
			expect(val).toBeGreaterThanOrEqual(0);
			expect(val).toBeLessThan(1);
		}
	});

	it('produces different sequences for different seeds', () => {
		const rng1 = mulberry32(1);
		const rng2 = mulberry32(2);
		expect(rng1()).not.toBe(rng2());
	});
});

describe('createSeededRandom', () => {
	it('accepts numeric seed', () => {
		const rng = createSeededRandom(42);
		expect(typeof rng()).toBe('number');
	});

	it('accepts string seed', () => {
		const rng = createSeededRandom('my-game');
		expect(typeof rng()).toBe('number');
	});

	it('produces same sequence for same string seed', () => {
		const rng1 = createSeededRandom('test');
		const rng2 = createSeededRandom('test');
		expect(rng1()).toBe(rng2());
	});
});

describe('hashString', () => {
	it('produces consistent hash for same string', () => {
		expect(hashString('test')).toBe(hashString('test'));
	});

	it('produces different hashes for different strings', () => {
		expect(hashString('abc')).not.toBe(hashString('xyz'));
	});

	it('returns a non-negative number', () => {
		expect(hashString('anything')).toBeGreaterThanOrEqual(0);
	});
});

describe('seededShuffle', () => {
	it('produces same shuffle for same seed', () => {
		const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const result1 = seededShuffle(arr, 42);
		const result2 = seededShuffle(arr, 42);
		expect(result1).toEqual(result2);
	});

	it('does not mutate original array', () => {
		const arr = [1, 2, 3, 4, 5];
		const original = [...arr];
		seededShuffle(arr, 42);
		expect(arr).toEqual(original);
	});

	it('contains all original elements', () => {
		const arr = [1, 2, 3, 4, 5];
		const result = seededShuffle(arr, 42);
		expect(result.sort()).toEqual([...arr].sort());
	});

	it('actually shuffles the array', () => {
		const arr = Array.from({ length: 20 }, (_, i) => i);
		const result = seededShuffle(arr, 42);
		// Extremely unlikely to be in order after shuffle
		expect(result).not.toEqual(arr);
	});
});

describe('seededSelect', () => {
	it('selects correct number of items', () => {
		const arr = Array.from({ length: 100 }, (_, i) => i);
		const result = seededSelect(arr, 25, 42);
		expect(result).toHaveLength(25);
	});

	it('returns all items when count exceeds array length', () => {
		const arr = [1, 2, 3];
		const result = seededSelect(arr, 10, 42);
		expect(result).toHaveLength(3);
	});

	it('produces deterministic results', () => {
		const arr = Array.from({ length: 50 }, (_, i) => i);
		const result1 = seededSelect(arr, 10, 99);
		const result2 = seededSelect(arr, 10, 99);
		expect(result1).toEqual(result2);
	});
});

describe('generateGameSeed', () => {
	it('produces number within valid range', () => {
		for (let i = 0; i < 100; i++) {
			const seed = generateGameSeed();
			expect(seed).toBeGreaterThanOrEqual(0);
			expect(seed).toBeLessThan(1000000);
			expect(Number.isInteger(seed)).toBe(true);
		}
	});
});
