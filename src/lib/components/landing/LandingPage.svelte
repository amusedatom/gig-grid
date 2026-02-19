<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import HeroSection from './HeroSection.svelte';
	import StepCard from './StepCard.svelte';
</script>

<div class="welcome-page">
	<HeroSection />

	<div class="welcome-steps">
		<StepCard
			number={1}
			emoji="&#9999;&#65039;"
			title="Create"
			description="Build a card from scratch or import a Spotify playlist"
		/>
		<StepCard
			number={2}
			emoji="&#128279;"
			title="Share"
			description="Send a single link to everyone — it generates a unique card for each friend!"
		/>
		<StepCard
			number={3}
			emoji="&#127881;"
			title="Play"
			description="Check off songs as they're played and race to complete lines"
		/>
	</div>

	<button class="welcome-cta" onclick={() => goto(`${base}/builder`)}>
		&#127908; Host a Game
	</button>
	<p class="welcome-hint">Or open a link shared by a friend to start playing instantly</p>
</div>

<style>
	@reference "tailwindcss";

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

	.welcome-steps {
		display: flex;
		gap: 1rem;
		width: 100%;
		max-width: 460px;
	}

	.welcome-cta {
		padding: 0.9rem 2rem;
		font-size: 1.05rem;
		font-weight: 700;
		background: linear-gradient(135deg, var(--color-amber-500) 0%, var(--color-orange-500) 100%);
		@apply mt-2 cursor-pointer rounded-xl border-none text-gray-900 shadow-lg shadow-amber-500/30 transition-all duration-300;
	}

	.welcome-cta:hover {
		@apply -translate-y-0.5 transform shadow-xl shadow-amber-500/40;
	}

	.welcome-cta:active {
		@apply scale-95 transform;
	}

	.welcome-hint {
		font-size: 0.75rem;
		@apply max-w-[280px] text-gray-500 opacity-70;
	}
</style>
