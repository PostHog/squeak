import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as pkg from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        sourcemap: true,
        emptyOutDir: false,
        lib: {
            entry: './src/index.ts',
            name: 'SqueakReact',
            formats: ['es', 'umd'],
            fileName: (format) => `squeak-react.${format}.js`,
        },
        rollupOptions: {
            external: [...Object.keys(pkg.peerDependencies)],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                },
            },
        },
    },
})
