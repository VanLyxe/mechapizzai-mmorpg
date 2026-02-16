import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    server: {
        port: 3000,
        host: true,
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser'],
                    'socket.io': ['socket.io-client'],
                },
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@shared': path.resolve(__dirname, '../../packages/shared/src'),
            '@ui-kit': path.resolve(__dirname, '../../packages/ui-kit/src'),
        },
    },
    optimizeDeps: {
        include: ['phaser', 'socket.io-client'],
    },
});