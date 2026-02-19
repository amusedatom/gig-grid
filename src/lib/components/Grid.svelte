<script lang="ts">
    import Cell from './Cell.svelte';
    import { game } from '$lib/stores/game.svelte';

    // No props needed, connects directly to store
</script>

<div 
    class="grid aspect-square w-full max-w-md gap-1 p-2 sm:gap-2"
    style="grid-template-columns: repeat({game.size}, minmax(0, 1fr));"
>
    {#each game.grid as song, i}
        <Cell 
            {song} 
            checked={game.checked[i]} 
            winning={game.winningLines.flat().includes(i)}
            onToggle={() => game.toggleCell(i)} 
        />
    {/each}
</div>
