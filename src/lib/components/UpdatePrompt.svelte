<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let showPrompt = $state(false);
	let registration: ServiceWorkerRegistration | null = null;

	onMount(async () => {
		if (!browser || !('serviceWorker' in navigator)) return;

		const reg = await navigator.serviceWorker.ready;
		registration = reg;

		// Check for waiting service worker
		if (reg.waiting) {
			showPrompt = true;
		}

		// Listen for new service worker installs
		reg.addEventListener('updatefound', () => {
			const newWorker = reg.installing;
			if (!newWorker) return;

			newWorker.addEventListener('statechange', () => {
				if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
					showPrompt = true;
				}
			});
		});

		// Reload when new SW takes control
		let refreshing = false;
		navigator.serviceWorker.addEventListener('controllerchange', () => {
			if (!refreshing) {
				refreshing = true;
				window.location.reload();
			}
		});
	});

	function update() {
		registration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
	}

	function dismiss() {
		showPrompt = false;
	}
</script>

{#if showPrompt}
	<div
		class="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-4 rounded-lg border border-amber-500/50 bg-gray-900 p-4 shadow-lg shadow-amber-500/20 md:left-auto md:right-4 md:w-auto"
	>
		<div class="flex items-center gap-3">
			<div>
				<p class="font-semibold text-white">Update Available</p>
				<p class="text-sm text-gray-400">A new version is ready</p>
			</div>
		</div>
		<div class="flex gap-2">
			<button onclick={dismiss} class="rounded px-3 py-1.5 text-sm text-gray-400 hover:text-white">
				Later
			</button>
			<button
				onclick={update}
				class="rounded bg-amber-500 px-4 py-1.5 text-sm font-semibold text-black hover:bg-amber-400"
			>
				Update
			</button>
		</div>
	</div>
{/if}
