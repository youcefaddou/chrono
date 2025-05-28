import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

// Résoudre __dirname dans un environnement ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'~': path.resolve(__dirname, '../'), // Alias pour le répertoire racine
		},
	},
	plugins: [react()],
	server: {
		host: 'localhost',
		port: 5173,
		strictPort: true, // Échoue si le port est déjà utilisé
	},
})
