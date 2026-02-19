<script lang="ts">
	import MiniGridIcon from './MiniGridIcon.svelte';
</script>

<div class="welcome-hero">
	<MiniGridIcon />
	<h2 class="welcome-tagline">
		Music Bingo for<br /><span class="accent-gradient">Any Gig, Any Crowd</span>
	</h2>
	<p class="welcome-subtitle">
		Create custom bingo cards for concerts, festivals and parties — then share with your friends and
		see who wins!
	</p>
</div>

<style>
	@reference "tailwindcss";

	.welcome-hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
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
		max-width: 340px;
		line-height: 1.5;
		@apply text-gray-400;
	}
</style>
