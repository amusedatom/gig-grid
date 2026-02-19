<script lang="ts">
	import type { BingoCell } from '$lib/types';

	interface Props {
		cell: BingoCell;
		checked: boolean;
		winning?: boolean;
		onToggle: () => void;
	}

	let { cell, checked, winning = false, onToggle }: Props = $props();
</script>

<button
	class="relative flex h-full w-full flex-col items-center justify-center overflow-hidden border p-1 text-center transition-all duration-200"
	class:bg-gray-900={!checked && !cell.isBlank}
	class:border-gray-700={!checked && !cell.isBlank}
	class:text-gray-300={!checked && !cell.isBlank}
	class:bg-fuchsia-900={checked && !cell.isBlank}
	class:border-fuchsia-400={checked && !winning && !cell.isBlank}
	class:text-white={checked && !cell.isBlank}
	class:shadow-[0_0_15px_rgba(192,38,211,0.5)]={checked && !winning && !cell.isBlank}
	class:bg-yellow-400={winning}
	class:text-black={winning}
	class:border-yellow-200={winning}
	class:shadow-[0_0_20px_rgba(250,204,21,0.6)]={winning}
	class:scale-105={winning}
	class:z-20={winning}
	class:opacity-20={cell.isBlank}
	class:bg-black={cell.isBlank}
	class:border-transparent={cell.isBlank}
	class:pointer-events-none={cell.isBlank}
	onclick={onToggle}
	disabled={cell.isBlank}
>
	{#if checked && !winning}
		<div class="pointer-events-none absolute inset-0 bg-fuchsia-500/20 mix-blend-overlay"></div>
	{/if}

	<div class="relative z-10 flex flex-col items-center gap-1">
		{#if !cell.isBlank}
			<span class="text-[10px] font-bold uppercase tracking-wider opacity-70">
				{cell.artist}
			</span>
			<span class="text-xs font-semibold leading-tight sm:text-sm">
				{cell.name}
			</span>
		{/if}
	</div>
</button>
