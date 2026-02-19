<script lang="ts">
	import { base } from '$app/paths';
	import { GAME } from '$lib/constants';
	import { URL_PARAMS } from '$lib/types';

	let copied = $state(false);

	function shareUrl() {
		const url = new URL(window.location.href);
		if (url.searchParams.get(URL_PARAMS.MODE) === 'custom') {
			url.searchParams.delete(URL_PARAMS.SEED);
			url.searchParams.delete(URL_PARAMS.CHECKED);
		} else if (url.searchParams.get(URL_PARAMS.SEED)) {
			url.searchParams.delete(URL_PARAMS.SEED);
			url.searchParams.delete(URL_PARAMS.CHECKED);
		}

		navigator.clipboard.writeText(url.toString());
		copied = true;
		setTimeout(() => (copied = false), GAME.COPY_FEEDBACK_MS);
	}
</script>

<header
	class="flex w-full max-w-md items-center justify-between border-b border-gray-800 bg-gray-950/80 px-4 py-4 backdrop-blur-md"
>
	<button
		onclick={() => {
			// Reset to landing state
			const url = new URL(window.location.href);
			url.search = ''; // Clear all params
			window.location.href = `${base}/`; // Navigate to base path
		}}
		class="flex flex-col text-left hover:opacity-80 transition-opacity"
	>
		<h1
			class="bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-2xl font-black italic tracking-tighter text-transparent"
		>
			GIG BINGO
		</h1>
		<span class="text-xs font-medium text-gray-500">SERVERLESS MULTIPLAYER</span>
	</button>

	<div class="flex gap-2">
		<button
			class="flex items-center gap-1.5 rounded-lg border border-fuchsia-600 bg-fuchsia-900/50 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-fuchsia-900 hover:shadow-[0_0_10px_rgba(192,38,211,0.4)]"
			onclick={shareUrl}
		>
			{#if copied}
				<span>COPIED!</span>
			{:else}
				<!-- Share Icon -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
					<polyline points="16 6 12 2 8 6"></polyline>
					<line x1="12" y1="2" x2="12" y2="15"></line>
				</svg>
				<span>SHARE</span>
			{/if}
		</button>
	</div>
</header>
