// ========================================
// SEEDED RANDOM NUMBER GENERATOR
// Using Mulberry32 algorithm for deterministic randomization
// ========================================

/**
 * Mulberry32 - Fast, high-quality seeded PRNG
 * @param {number} seed - Integer seed value
 * @returns {function} Random number generator function (0 to 1)
 */
function mulberry32(seed) {
    return function () {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

/**
 * Create a seeded random number generator
 * @param {number|string} seed - Seed value (will be converted to number)
 * @returns {function} RNG function
 */
function createSeededRandom(seed) {
    // Convert string seeds to numeric hash
    if (typeof seed === 'string') {
        seed = hashString(seed);
    }
    return mulberry32(seed);
}

/**
 * Simple string hash function
 * @param {string} str - String to hash
 * @returns {number} Hash value
 */
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}

/**
 * Fisher-Yates shuffle with seeded randomization
 * @param {Array} array - Array to shuffle
 * @param {number|string} seed - Seed for deterministic shuffle
 * @returns {Array} New shuffled array (does not mutate original)
 */
function seededShuffle(array, seed) {
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
 * @param {Array} array - Source array
 * @param {number} count - Number of items to select
 * @param {number|string} seed - Seed for deterministic selection
 * @returns {Array} Selected items in random order
 */
function seededSelect(array, count, seed) {
    const shuffled = seededShuffle(array, seed);
    return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Generate a random game seed
 * @returns {number} Random seed value
 */
function generateGameSeed() {
    return Math.floor(Math.random() * 1000000);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createSeededRandom,
        seededShuffle,
        seededSelect,
        generateGameSeed,
        hashString
    };
}
