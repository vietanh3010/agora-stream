import react from '@vitejs/plugin-react';
import path from "path";
import { defineConfig, loadEnv } from 'vite';
// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
    const env = loadEnv(mode, process.cwd(), '')
    return {
        // vite config
        base: '/',
        define: {
            __APP_ENV__: env.APP_ENV,
        },
        build: {
            outDir: 'docs'
        },
        plugins: [react()],
        // css: {
        //     postcss: {
        //         plugins: [tailwindcss],
        //     },
        // },
        server: {
            port: 3011,
            host: true,
        },
        resolve: {
            alias: {
                // '@': path.resolve(__dirname, './src'),
                '@': path.resolve(__dirname, 'src'),
            },
        }
    }
})
