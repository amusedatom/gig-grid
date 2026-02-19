<script lang="ts">
	import Cell from './Cell.svelte';
	import { game } from '$lib/stores/game.svelte';
</script>

<div
	class="grid aspect-square w-full max-w-md gap-1 p-2 sm:gap-2"
	style="grid-template-columns: repeat({game.size}, minmax(0, 1fr));"
>
	{#each game.grid as cell, i}
		<Cell
			{cell}
			checked={game.checked[i]}
			winning={game.winningLines.flat().includes(i)}
			onToggle={() => game.toggleCell(i)}
		/>
	{/each}
</div>
