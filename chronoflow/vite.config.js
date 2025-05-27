import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'


export default defineConfig({
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'~': path.resolve(__dirname, '../'), // Alias for the root directory
		},
	},
	plugins: [react()],
	server: {
		host: 'localhost',
		port: 5173,
		strictPort: true, // échoue si le port est déjà utilisé
	},
	// ...autres options éventuelles...
})
