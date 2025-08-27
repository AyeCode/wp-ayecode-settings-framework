import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    // The public directory is where Vite will look for static assets.
    // We set it to false because we handle assets via WordPress enqueueing.
    publicDir: false,

    build: {
        // The output directory for the final compiled assets.
        outDir: resolve(__dirname, 'assets/dist'),
        // The assets directory within the outDir.
        assetsDir: '',
        // Empty the output directory before each build.
        emptyOutDir: true,
        // Generate a manifest file for PHP to read asset paths.
        manifest: true,
        rollupOptions: {
            input: {
                // Define your entry points here.
                // The key is the output filename (without extension).
                // The value is the path to the source file.
                'settings': resolve(__dirname, 'assets/js/src/settings.js'),
                // Example for another entry point:
                // 'setup-wizard': resolve(__dirname, 'assets/js/src/setup-wizard.js'),
            },
            output: {
                // **THE FIX: Build as a self-executing IIFE for compatibility.**
                format: 'iife',
                // Define how the output files should be named.
                entryFileNames: 'js/[name].js',
                chunkFileNames: 'js/[name]-[hash].js',
                assetFileNames: '[name][extname]',
                // Define the global variables for your external packages
                globals: {
                    alpinejs: 'Alpine',
                    // This is the missing line:
                    '@alpinejs/sort': 'AlpineSort'
                },
            },
            // Add @alpinejs/sort to the external array
            external: [ '@alpinejs/sort', 'alpinejs'],
            plugins: [],
        },
    },
    // Resolve aliases for easier imports.
    resolve: {
        alias: {
            '@': resolve(__dirname, 'assets/js/src'),
        },
    },
});