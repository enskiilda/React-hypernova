import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
        plugins: [
                react()
        ],
        resolve: {
                alias: {
                        '$lib': path.resolve(__dirname, './src/lib'),
                        '$app/navigation': path.resolve(__dirname, './src/lib/app/navigation.ts'),
                        '$app/stores': path.resolve(__dirname, './src/lib/app/stores.ts'),
                        '$app/environment': path.resolve(__dirname, './src/lib/app/environment.ts')
                }
        },
        define: {
                APP_VERSION: JSON.stringify(process.env.npm_package_version),
                APP_BUILD_HASH: JSON.stringify(process.env.APP_BUILD_HASH || 'dev-build')
        },
        build: {
                sourcemap: false,
                minify: false
        },
        worker: {
                format: 'es'
        },
        server: {
                host: '0.0.0.0',
                port: 5000,
                strictPort: false,
                hmr: {
                        overlay: false
                },
                proxy: {
                        '/api': {
                                target: 'http://localhost:3001',
                                changeOrigin: true
                        }
                }
        }
});
