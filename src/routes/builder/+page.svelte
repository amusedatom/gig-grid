<script lang="ts">
    import { goto } from '$app/navigation';
    import { encodeSongsToBase64 } from '$lib/game/encoding';
    import { generateGameSeed } from '$lib/game/rng';

    let songs = $state<string[]>([]);
    let currentInput = $state('');
    let error = $state<string | null>(null);

    // Flexible Grid Settings
    let gridSize = $state(5);
    let validCount = $state(25);
    
    // Reset valid count when size changes to ensure consistency
    $effect(() => {
        const max = gridSize * gridSize;
        if (validCount > max) validCount = max;
    });

    function addSong() {
        const trimmed = currentInput.trim();
        if (!trimmed) return;
        
        if (songs.includes(trimmed)) {
            error = 'Song already added!';
            return;
        }

        songs.push(trimmed);
        currentInput = '';
        error = null;
    }

    function removeSong(index: number) {
        songs = songs.filter((_, i) => i !== index);
    }

    function generateGame() {
        if (songs.length < validCount) {
            error = `Need at least ${validCount} songs for a ${gridSize}x${gridSize} grid! (Currently: ${songs.length})`;
            return;
        }

        const encoded = encodeSongsToBase64(songs);
        // Redirect to share page - NO SEED generated yet!
        goto(`/share?m=custom&songs=${encoded}&sz=${gridSize}&v=${validCount}`);
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSong();
        }
    }
</script>

<div class="flex min-h-dvh flex-col items-center justify-center bg-gray-950 p-4 text-white">
    <div class="flex w-full max-w-md flex-col gap-6">
        <header class="flex items-center justify-between">
            <h1 class="bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-2xl font-black italic tracking-tighter text-transparent">
                BUILDER
            </h1>
            <a href="/" class="text-xs font-bold text-gray-400 hover:text-white">BACK TO GAME</a>
        </header>

        <div class="flex flex-col gap-4 rounded-xl border border-gray-800 bg-gray-900/50 p-6 shadow-2xl backdrop-blur-sm">
            
            <!-- Grid Settings -->
            <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                    <label for="size-input" class="text-xs font-bold text-gray-400">GRID SIZE: {gridSize}x{gridSize}</label>
                    <input 
                        id="size-input"
                        type="range" 
                        min="3" 
                        max="8" 
                        step="1"
                        bind:value={gridSize}
                        class="accent-fuchsia-500 cursor-pointer"
                    />
                </div>
                <div class="flex flex-col gap-2">
                    <label for="valid-input" class="text-xs font-bold text-gray-400">VALID SQUARES: {validCount}</label>
                    <input 
                        id="valid-input"
                        type="range" 
                        min="1" 
                        max={gridSize * gridSize} 
                        step="1"
                        bind:value={validCount}
                        class="accent-fuchsia-500 cursor-pointer"
                    />
                </div>
            </div>
            
            <div class="h-px bg-gray-800"></div>

            <div class="flex flex-col gap-2">
                <label for="song-input" class="text-sm font-bold text-gray-300">ADD SONGS ({songs.length})</label>
                <div class="flex gap-2">
                    <input 
                        id="song-input"
                        type="text" 
                        bind:value={currentInput}
                        onkeydown={handleKeydown}
                        placeholder="Artist - Song Name"
                        class="flex-1 rounded-lg border border-gray-700 bg-gray-950 px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-fuchsia-500 focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
                    />
                    <button 
                        onclick={addSong}
                        class="rounded-lg bg-gray-800 px-4 py-2 text-sm font-bold hover:bg-gray-700"
                    >
                        ADD
                    </button>
                </div>
                {#if error}
                    <p class="text-xs text-red-400">{error}</p>
                {/if}
            </div>

            <div class="flex max-h-64 flex-col gap-2 overflow-y-auto rounded-lg border border-gray-800 bg-gray-950/50 p-2">
                {#if songs.length === 0}
                    <p class="py-8 text-center text-sm text-gray-600">No songs added yet.</p>
                {:else}
                    {#each songs as song, i}
                        <div class="flex items-center justify-between rounded bg-gray-900 px-3 py-2 text-sm">
                            <span class="truncate">{song}</span>
                            <button 
                                onclick={() => removeSong(i)}
                                class="ml-2 text-gray-500 hover:text-red-400"
                                aria-label="Remove song"
                            >
                                ×
                            </button>
                        </div>
                    {/each}
                {/if}
            </div>

            <button 
                onclick={generateGame}
                disabled={songs.length < validCount}
                class="mt-2 w-full rounded-lg bg-fuchsia-600 py-3 font-bold text-white shadow-lg shadow-fuchsia-900/20 transition-all hover:bg-fuchsia-500 hover:shadow-fuchsia-900/40 disabled:cursor-not-allowed disabled:bg-gray-800 disabled:text-gray-500 disabled:shadow-none"
            >
                GENERATE GAME
            </button>
        </div>
        
        <div class="text-center text-xs text-gray-600">
            <p>Add at least {validCount} songs to generate a balanced {gridSize}x{gridSize} grid.</p>
        </div>
    </div>
</div>
