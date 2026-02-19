<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import UpdatePrompt from '$lib/components/UpdatePrompt.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
<UpdatePrompt />
