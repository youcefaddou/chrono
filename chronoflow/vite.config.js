import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
	plugins: [react()],
	server: {
		host: 'localhost',
		port: 5173,
		strictPort: true, // échoue si le port est déjà utilisé
	},
	// ...autres options éventuelles...
})
