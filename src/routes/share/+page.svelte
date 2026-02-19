<script lang="ts">
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { onMount } from 'svelte';
    import Header from '$lib/components/Header.svelte';

    let link = $state('');
    let copied = $state(false);

    // Get params from URL
    const params = page.url.searchParams;
    const songs = params.get('songs');
    const size = params.get('sz');
    const valid = params.get('v');
    const mode = params.get('m');

    onMount(() => {
        // Construct the "Magic Link" - basically the current URL but pointing to root
        // and WITHOUT any seed.
        const url = new URL(window.location.href);
        url.pathname = `${base}/`;
        
        // Ensure we keep the definitive params
        // (They should already be in the current URL, but let's be explicit and clean)
        const newParams = new URLSearchParams();
        if (mode) newParams.set('m', mode);
        if (songs) newParams.set('songs', songs);
        if (size) newParams.set('sz', size);
        if (valid) newParams.set('v', valid);
        
        // IMPORTANT: NO SEED ('s') param here! 
        // That's what makes it a "Magic Link" -> new seed on generation.

        url.search = newParams.toString();
        link = url.toString();
    });

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(link);
            copied = true;
            setTimeout(() => copied = false, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }

    function playNow() {
        // Navigate to the magic link logic (root)
        // This will trigger the app to generate a random seed since 's' is missing
        goto(link);
    }
</script>

<div class="flex min-h-dvh flex-col items-center justify-center bg-gray-950 p-4 text-white">
    <div class="flex w-full max-w-md flex-col gap-6">
        <Header />

        <div class="flex flex-col gap-6 rounded-xl border border-gray-800 bg-gray-900/50 p-8 shadow-2xl backdrop-blur-sm text-center">
            
            <div class="flex flex-col gap-2">
                <h2 class="text-2xl font-black italic tracking-tighter text-white">GAME READY!</h2>
                <p class="text-gray-400">Here is your magic link. Share it with your friends - everyone gets a unique board!</p>
            </div>

            <div class="flex flex-col gap-2">
                <!-- Read Only Input -->
                <div class="relative">
                    <input 
                        type="text" 
                        readonly 
                        value={link}
                        class="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-gray-300 focus:outline-none"
                    />
                </div>

                <button 
                    onclick={copyLink}
                    class="group relative flex w-full items-center justify-center gap-2 rounded-lg bg-gray-800 py-3 font-bold text-white transition-all hover:bg-gray-700 active:scale-95"
                >
                    {#if copied}
                        <span class="text-green-400">COPIED! ✓</span>
                    {:else}
                        <span>COPY MAGIC LINK</span>
                    {/if}
                </button>
            </div>

            <div class="h-px w-full bg-gray-800"></div>

            <button 
                onclick={playNow}
                class="w-full rounded-lg bg-fuchsia-600 py-4 font-bold text-white shadow-lg shadow-fuchsia-900/20 transition-all hover:bg-fuchsia-500 hover:shadow-fuchsia-900/40 active:scale-95"
            >
                PLAY NOW
            </button>

            <a href="/builder" class="text-xs font-bold text-gray-500 hover:text-white mt-2">
                ← EDIT GAME
            </a>
        </div>
    </div>
</div>
