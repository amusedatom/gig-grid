<script lang="ts">
    import LandingPage from '$lib/components/LandingPage.svelte';
    import Grid from '$lib/components/Grid.svelte';
    import Header from '$lib/components/Header.svelte';
    import { game } from '$lib/stores/game.svelte';

    // Ensure game state is synced/initialized
    $effect(() => {
        game.syncFromUrl();
    });
</script>

<svelte:head>
    <title>Gig Bingo - Serverless Multiplayer</title>
    <meta name="description" content="Play Music Bingo with your friends. No server, just URL state." />
</svelte:head>

<div class="flex min-h-dvh flex-col items-center justify-center bg-gray-950 p-4 text-white">
    <div class="flex w-full max-w-md flex-col gap-6 h-full flex-1">
        {#if game.generated}
            <Header />

            <main class="flex flex-col items-center gap-4">
                <div class="w-full rounded-xl border border-gray-800 bg-gray-900/50 p-2 shadow-2xl backdrop-blur-sm">
                    <Grid />
                </div>

                <div class="text-center text-xs text-gray-600">
                    <p>Seed: <span class="font-mono text-gray-500">{game.seed}</span></p>
                </div>
            </main>
        {:else}
            <LandingPage />
        {/if}
    </div>
</div>
