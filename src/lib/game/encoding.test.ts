import { describe, it, expect } from 'vitest';
import {
	encodeCheckedBitmask,
	decodeCheckedBitmask,
	encodeSongsToBase64,
	decodeSongsFromBase64
} from './encoding';

describe('checked bitmask encoding', () => {
	it('encodes and decodes empty state', () => {
		const state = Array(25).fill(false);
		const encoded = encodeCheckedBitmask(state);
		const decoded = decodeCheckedBitmask(encoded, 25);
		expect(decoded).toEqual(state);
	});

	it('encodes and decodes all-true state', () => {
		const state = Array(25).fill(true);
		const encoded = encodeCheckedBitmask(state);
		const decoded = decodeCheckedBitmask(encoded, 25);
		expect(decoded).toEqual(state);
	});

	it('encodes and decodes mixed state', () => {
		const state = [true, false, true, false, true, ...Array(20).fill(false)];
		const encoded = encodeCheckedBitmask(state);
		const decoded = decodeCheckedBitmask(encoded, 25);
		expect(decoded).toEqual(state);
	});

	it('handles variable grid sizes', () => {
		const sizes = [9, 16, 25, 36, 49, 64];
		for (const size of sizes) {
			const state = Array(size)
				.fill(false)
				.map((_, i) => i % 2 === 0);
			const encoded = encodeCheckedBitmask(state);
			const decoded = decodeCheckedBitmask(encoded, size);
			expect(decoded).toEqual(state);
		}
	});

	it('encodes empty state as "0"', () => {
		const state = Array(25).fill(false);
		const encoded = encodeCheckedBitmask(state);
		expect(encoded).toBe('0');
	});

	it('handles invalid hex gracefully', () => {
		const decoded = decodeCheckedBitmask('invalid', 25);
		expect(decoded).toEqual(Array(25).fill(false));
	});
});

describe('song base64 encoding', () => {
	it('encodes and decodes song list', () => {
		const songs = ['Artist 1 - Song 1', 'Artist 2 - Song 2'];
		const encoded = encodeSongsToBase64(songs);
		const decoded = decodeSongsFromBase64(encoded);
		expect(decoded).toEqual(songs);
	});

	it('handles empty array', () => {
		const encoded = encodeSongsToBase64([]);
		const decoded = decodeSongsFromBase64(encoded);
		expect(decoded).toEqual([]);
	});

	it('handles single song', () => {
		const songs = ['Pendulum - Tarantula'];
		const encoded = encodeSongsToBase64(songs);
		const decoded = decodeSongsFromBase64(encoded);
		expect(decoded).toEqual(songs);
	});

	it('handles special characters', () => {
		const songs = ['RÜFÜS DU SOL - Innerbloom', 'Café Del Mar - Energy 52'];
		const encoded = encodeSongsToBase64(songs);
		const decoded = decodeSongsFromBase64(encoded);
		expect(decoded).toEqual(songs);
	});

	it('returns null for invalid base64', () => {
		expect(decodeSongsFromBase64('!!not-base64!!')).toBeNull();
	});
});
