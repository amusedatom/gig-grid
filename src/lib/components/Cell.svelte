<script lang="ts">
    import type { SongDisplay } from '$lib/game/songs';
    
    interface Props {
        song: SongDisplay;
        checked: boolean;
        winning?: boolean;
        onToggle: () => void;
    }

    let { song, checked, winning = false, onToggle }: Props = $props();
    
    // Check if cell is a BLANK (validity placeholder)
    let isBlank = $derived(song.id === 'BLANK');
</script>

<button
    class="relative flex h-full w-full flex-col items-center justify-center overflow-hidden border p-1 text-center transition-all duration-200"
    class:bg-gray-900={!checked && !isBlank}
    class:border-gray-700={!checked && !isBlank}
    class:text-gray-300={!checked && !isBlank}
    class:bg-fuchsia-900={checked && !isBlank}
    class:border-fuchsia-400={checked && !winning && !isBlank}
    class:text-white={checked && !isBlank}
    class:shadow-[0_0_15px_rgba(192,38,211,0.5)]={checked && !winning && !isBlank}
    class:bg-yellow-400={winning}
    class:text-black={winning}
    class:border-yellow-200={winning}
    class:shadow-[0_0_20px_rgba(250,204,21,0.6)]={winning}
    class:scale-105={winning}
    class:z-20={winning}
    
    class:opacity-20={isBlank}
    class:bg-black={isBlank}
    class:border-transparent={isBlank}
    class:pointer-events-none={isBlank}

    onclick={onToggle}
    disabled={isBlank}
>
    <!-- Checked overlay effect -->
    {#if checked && !winning}
        <div class="pointer-events-none absolute inset-0 bg-fuchsia-500/20 mix-blend-overlay"></div>
    {/if}

    <div class="relative z-10 flex flex-col items-center gap-1">
        {#if !isBlank}
            <span class="text-[10px] font-bold uppercase tracking-wider opacity-70">
                {song.artist}
            </span>
            <span class="text-xs font-semibold leading-tight sm:text-sm">
                {song.name}
            </span>
        {/if}
    </div>
</button>
