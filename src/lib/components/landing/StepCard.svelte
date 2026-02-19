<script lang="ts">
	interface Props {
		number: number;
		emoji: string;
		title: string;
		description: string;
	}

	let { number, emoji, title, description }: Props = $props();
</script>

<div class="step-card">
	<span class="step-number">{number}</span>
	<span class="step-emoji">{emoji}</span>
	<h3>{title}</h3>
	<p>{description}</p>
</div>

<style>
	@reference "tailwindcss";

	.step-card {
		flex: 1;
		position: relative;
		background: rgba(28, 28, 32, 0.8);
		@apply rounded-xl border border-gray-800 p-4 pt-4 backdrop-blur-sm transition-all duration-300;
	}

	.step-card:hover {
		@apply -translate-y-0.5 transform border-amber-500 shadow-lg shadow-amber-500/10;
	}

	.step-number {
		position: absolute;
		top: -8px;
		left: -6px;
		width: 22px;
		height: 22px;
		@apply flex items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-black;
	}

	.step-emoji {
		font-size: 1.5rem;
		display: block;
		margin-bottom: 4px;
	}

	.step-card h3 {
		font-size: 0.85rem;
		font-weight: 700;
		@apply mb-1 text-amber-500;
	}

	.step-card p {
		font-size: 0.7rem;
		@apply m-0 leading-snug text-gray-400;
	}
</style>
