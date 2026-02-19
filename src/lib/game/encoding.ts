/**
 * Encode a boolean checked-state array as a compact hex bitmask
 * Supports dynamic lengths using BigInt
 * @param checkedState - Array of booleans
 * @returns Hex string
 */
export function encodeCheckedBitmask(checkedState: boolean[]): string {
    let bits = 0n;
    for (let i = 0; i < checkedState.length; i++) {
        if (checkedState[i]) {
            bits |= (1n << BigInt(i));
        }
    }
    return bits.toString(16);
}

/**
 * Decode a hex bitmask back into a boolean checked-state array
 * @param hex - Hex string
 * @param length - Expected length of the array (default 25)
 * @returns Array of booleans
 */
export function decodeCheckedBitmask(hex: string, length: number = 25): boolean[] {
    try {
        const bits = BigInt('0x' + hex);
        const state: boolean[] = [];
        for (let i = 0; i < length; i++) {
            state.push(Boolean(bits & (1n << BigInt(i))));
        }
        return state;
    } catch (e) {
        console.error('Failed to decode bitmask:', e);
        return Array(length).fill(false);
    }
}

/**
 * Encode song list to Base64 (for custom songs not in database)
 * @param songs - Array of song strings (e.g., ["Artist - Song", ...])
 * @returns Base64 encoded string
 */
export function encodeSongsToBase64(songs: string[]): string {
    try {
        const jsonString = JSON.stringify(songs);
        return btoa(encodeURIComponent(jsonString));
    } catch (e) {
        console.error('Failed to encode songs:', e);
        return '';
    }
}

/**
 * Decode Base64 song list
 * @param base64String - Base64 encoded song list
 * @returns Array of song strings or null if invalid
 */
export function decodeSongsFromBase64(base64String: string): string[] | null {
    try {
        const jsonString = decodeURIComponent(atob(base64String));
        const songs = JSON.parse(jsonString);
        return Array.isArray(songs) ? songs : null;
    } catch (e) {
        console.error('Failed to decode songs:', e);
        return null;
    }
}
