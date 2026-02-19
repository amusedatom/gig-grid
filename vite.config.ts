import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		SvelteKitPWA({
			registerType: 'prompt',
			workbox: {
				cleanupOutdatedCaches: true,
				skipWaiting: false,
				clientsClaim: true,
				runtimeCaching: [
					{
						urlPattern: ({ request }) => request.mode === 'navigate',
						handler: 'NetworkFirst',
						options: {
							cacheName: 'pages',
							expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
							networkTimeoutSeconds: 3
						}
					},
					{
						urlPattern: /\.(js|css|woff2?)$/,
						handler: 'CacheFirst',
						options: {
							cacheName: 'static-assets',
							expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }
						}
					},
					{
						urlPattern: /\.(png|svg|ico)$/,
						handler: 'CacheFirst',
						options: {
							cacheName: 'images',
							expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 }
						}
					}
				]
			},
			manifest: {
				name: 'Gig Bingo',
				short_name: 'GigBingo',
				theme_color: '#030712',
				background_color: '#030712',
				display: 'standalone',
				icons: [
					{
						src: 'icon-192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: 'icon-512.png',
						sizes: '512x512',
						type: 'image/png'
					}
				]
			},
			devOptions: {
				enabled: false
			}
		})
	]
});
