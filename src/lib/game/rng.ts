/**
 * Mulberry32 - Fast, high-quality seeded PRNG
 * @param seed - Integer seed value
 * @returns Random number generator function (0 to 1)
 */
export function mulberry32(seed: number): () => number {
    return function () {
        let t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Create a seeded random number generator
 * @param seed - Seed value (will be converted to number)
 * @returns RNG function
 */
export function createSeededRandom(seed: number | string): () => number {
    // Convert string seeds to numeric hash
    if (typeof seed === 'string') {
        seed = hashString(seed);
    }
    return mulberry32(seed);
}

/**
 * Simple string hash function
 * @param str - String to hash
 * @returns Hash value
 */
export function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}

/**
 * Fisher-Yates shuffle with seeded randomization
 * @param array - Array to shuffle
 * @param seed - Seed for deterministic shuffle
 * @returns New shuffled array (does not mutate original)
 */
export function seededShuffle<T>(array: T[], seed: number | string): T[] {
    const shuffled = [...array]; // Clone array
    const rng = createSeededRandom(seed);

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

/**
 * Select N random items from array using seeded randomization
 * @param array - Source array
 * @param count - Number of items to select
 * @param seed - Seed for deterministic selection
 * @returns Selected items in random order
 */
export function seededSelect<T>(array: T[], count: number, seed: number | string): T[] {
    const shuffled = seededShuffle(array, seed);
    return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Generate a random game seed
 * @returns Random seed value
 */
export function generateGameSeed(): number {
    return Math.floor(Math.random() * 1000000);
}
