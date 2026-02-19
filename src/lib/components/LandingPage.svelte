<script lang="ts">
    import { goto } from '$app/navigation';
    import { game } from '$lib/stores/game.svelte';
</script>

<div class="welcome-page">
    <div class="welcome-hero">
        <div class="welcome-icon">
            <div class="mini-grid">
                <span class="mg-cell"></span><span class="mg-cell hit"></span><span class="mg-cell"></span><span
                    class="mg-cell hit"></span><span class="mg-cell"></span>
                <span class="mg-cell hit"></span><span class="mg-cell"></span><span
                    class="mg-cell hit"></span><span class="mg-cell"></span><span class="mg-cell hit"></span>
                <span class="mg-cell"></span><span class="mg-cell hit"></span><span
                    class="mg-cell star">⭐</span><span class="mg-cell hit"></span><span class="mg-cell"></span>
                <span class="mg-cell hit"></span><span class="mg-cell"></span><span
                    class="mg-cell hit"></span><span class="mg-cell"></span><span class="mg-cell hit"></span>
                <span class="mg-cell"></span><span class="mg-cell hit"></span><span class="mg-cell"></span><span
                    class="mg-cell hit"></span><span class="mg-cell"></span>
            </div>
            <span class="welcome-notes">🎵</span>
        </div>
        <h2 class="welcome-tagline">Music Bingo for<br><span class="accent-gradient">Any Gig, Any Crowd</span>
        </h2>
        <p class="welcome-subtitle">Create custom bingo cards for concerts, festivals and parties — then share
            with your friends and see who wins!</p>
    </div>

    <div class="welcome-steps">
        <div class="step-card">
            <span class="step-number">1</span>
            <span class="step-emoji">✏️</span>
            <h3>Create</h3>
            <p>Build a card from scratch or import a Spotify playlist</p>
        </div>
        <div class="step-card">
            <span class="step-number">2</span>
            <span class="step-emoji">🔗</span>
            <h3>Share</h3>
            <p>Send a single link to everyone — it generates a unique card for each friend!</p>
        </div>
        <div class="step-card">
            <span class="step-number">3</span>
            <span class="step-emoji">🎉</span>
            <h3>Play</h3>
            <p>Check off songs as they're played and race to complete lines</p>
        </div>
    </div>

    <button class="welcome-cta" onclick={() => goto('/builder')}>
        🎤 Host a Game
    </button>
    <p class="welcome-hint">Or open a link shared by a friend to start playing instantly</p>
</div>

<style>
    @reference "tailwindcss";

    /* ========================================
       WELCOME PAGE
       ======================================== */

    .welcome-page {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2rem;
        padding: 2rem 1rem;
        text-align: center;
        overflow-y: auto;
        width: 100%;
        height: 100%;
    }

    .welcome-hero {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    /* Mini bingo grid illustration */
    .welcome-icon {
        position: relative;
        margin-bottom: 0.5rem;
    }

    .mini-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 3px;
        width: 100px;
        height: 100px;
    }

    .mg-cell {
        @apply bg-gray-800 border border-gray-700 rounded-[3px] transition-all duration-300;
    }

    .mg-cell.hit {
        background: linear-gradient(135deg, var(--color-amber-500) 0%, var(--color-orange-500) 100%);
        border-color: var(--color-amber-500);
        animation: cell-pop 2s ease-in-out infinite;
    }

    .mg-cell.star {
        background: linear-gradient(135deg, var(--color-amber-500) 0%, var(--color-orange-500) 100%);
        border-color: var(--color-amber-500);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.5rem;
    }

    /* Stagger the animation for the hit cells */
    .mg-cell.hit:nth-child(2) {
        animation-delay: 0.0s;
    }

    .mg-cell.hit:nth-child(4) {
        animation-delay: 0.3s;
    }

    .mg-cell.hit:nth-child(6) {
        animation-delay: 0.6s;
    }

    .mg-cell.hit:nth-child(8) {
        animation-delay: 0.9s;
    }

    .mg-cell.hit:nth-child(10) {
        animation-delay: 1.2s;
    }

    .mg-cell.hit:nth-child(12) {
        animation-delay: 0.15s;
    }

    .mg-cell.hit:nth-child(14) {
        animation-delay: 0.45s;
    }

    .mg-cell.hit:nth-child(16) {
        animation-delay: 0.75s;
    }

    .mg-cell.hit:nth-child(18) {
        animation-delay: 1.05s;
    }

    .mg-cell.hit:nth-child(20) {
        animation-delay: 0.2s;
    }

    .mg-cell.hit:nth-child(22) {
        animation-delay: 0.5s;
    }

    .mg-cell.hit:nth-child(24) {
        animation-delay: 0.8s;
    }

    @keyframes cell-pop {

        0%,
        100% {
            opacity: 0.6;
            transform: scale(1);
        }

        50% {
            opacity: 1;
            transform: scale(1.08);
        }
    }

    .welcome-notes {
        position: absolute;
        top: -12px;
        right: -16px;
        font-size: 1.5rem;
        animation: float-note 3s ease-in-out infinite;
    }

    @keyframes float-note {

        0%,
        100% {
            transform: translateY(0) rotate(0deg);
        }

        50% {
            transform: translateY(-6px) rotate(10deg);
        }
    }

    .welcome-tagline {
        font-size: clamp(1.3rem, 5vw, 1.8rem);
        font-weight: 800;
        line-height: 1.3;
        @apply text-white;
    }

    .accent-gradient {
        background: linear-gradient(135deg, var(--color-amber-500) 0%, var(--color-orange-500) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .welcome-subtitle {
        font-size: 0.9rem;
        @apply text-gray-400;
        max-width: 340px;
        line-height: 1.5;
    }

    /* How it works step cards */
    .welcome-steps {
        display: flex;
        gap: 1rem;
        width: 100%;
        max-width: 460px;
    }

    .step-card {
        flex: 1;
        position: relative;
        background: rgba(28, 28, 32, 0.8);
        @apply border border-gray-800 rounded-xl p-4 pt-4 backdrop-blur-sm transition-all duration-300;
    }

    .step-card:hover {
        @apply border-amber-500 transform -translate-y-0.5 shadow-lg shadow-amber-500/10;
    }

    .step-number {
        position: absolute;
        top: -8px;
        left: -6px;
        width: 22px;
        height: 22px;
        @apply bg-amber-500 text-black rounded-full flex items-center justify-center text-xs font-bold;
    }

    .step-emoji {
        font-size: 1.5rem;
        display: block;
        margin-bottom: 4px;
    }

    .step-card h3 {
        font-size: 0.85rem;
        font-weight: 700;
        @apply text-amber-500 mb-1;
    }

    .step-card p {
        font-size: 0.7rem;
        @apply text-gray-400 m-0 leading-snug;
    }

    /* CTA button */
    .welcome-cta {
        padding: 0.9rem 2rem;
        font-size: 1.05rem;
        font-weight: 700;
        background: linear-gradient(135deg, var(--color-amber-500) 0%, var(--color-orange-500) 100%);
        @apply text-gray-900 rounded-xl shadow-lg shadow-amber-500/30 transition-all duration-300 mt-2 cursor-pointer border-none;
    }

    .welcome-cta:hover {
        @apply transform -translate-y-0.5 shadow-xl shadow-amber-500/40;
    }

    .welcome-cta:active {
        @apply transform scale-95;
    }

    .welcome-hint {
        font-size: 0.75rem;
        @apply text-gray-500 opacity-70 max-w-[280px];
    }
</style>
