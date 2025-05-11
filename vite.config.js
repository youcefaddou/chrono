import { defineConfig } from 'vite'
// ...import éventuels plugins...

export default defineConfig({
	server: {
		host: 'localhost',
		port: 5173,
		strictPort: true, // échoue si le port est déjà utilisé
	},
	// ...autres options éventuelles...
})
