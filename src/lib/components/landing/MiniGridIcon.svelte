<script lang="ts">
	// Animated 5x5 bingo grid icon for the landing page
</script>

<div class="welcome-icon">
	<div class="mini-grid">
		<span class="mg-cell"></span><span class="mg-cell hit"></span><span class="mg-cell"></span><span
			class="mg-cell hit"
		></span><span class="mg-cell"></span>
		<span class="mg-cell hit"></span><span class="mg-cell"></span><span class="mg-cell hit"
		></span><span class="mg-cell"></span><span class="mg-cell hit"></span>
		<span class="mg-cell"></span><span class="mg-cell hit"></span><span class="mg-cell star"
			>&#11088;</span
		><span class="mg-cell hit"></span><span class="mg-cell"></span>
		<span class="mg-cell hit"></span><span class="mg-cell"></span><span class="mg-cell hit"
		></span><span class="mg-cell"></span><span class="mg-cell hit"></span>
		<span class="mg-cell"></span><span class="mg-cell hit"></span><span class="mg-cell"></span><span
			class="mg-cell hit"
		></span><span class="mg-cell"></span>
	</div>
	<span class="welcome-notes">&#127925;</span>
</div>

<style>
	@reference "tailwindcss";

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
		@apply rounded-[3px] border border-gray-700 bg-gray-800 transition-all duration-300;
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

	.mg-cell.hit:nth-child(2) {
		animation-delay: 0s;
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
</style>
