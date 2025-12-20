import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
        plugins: [
                sveltekit()
        ],
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
                allowedHosts: true,
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
