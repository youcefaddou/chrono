const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

async function apiFetch (endpoint, options = {}) {
	const headers = { 'Content-Type': 'application/json', ...options.headers }
	// Pas d'en-tête Authorization, le cookie est envoyé automatiquement
	const res = await fetch(`${API_URL}${endpoint}`, {
		...options,
		headers,
		credentials: 'include',
	})
	const data = await res.json().catch(() => ({}))
	if (!res.ok) throw new Error(data.message || data.error || 'API error')
	return data
}

export const api = {
	signup: (body) => apiFetch('/signup', { method: 'POST', body: JSON.stringify(body) }),
	login: (body) => apiFetch('/login', { method: 'POST', body: JSON.stringify(body) }),
	getMe: () => apiFetch('/me'),
	logout: () => apiFetch('/logout', { method: 'POST' }),
	getTasks: () => apiFetch('/tasks'),
	createTask: (body) => apiFetch('/tasks', { method: 'POST', body: JSON.stringify(body) }),
	updateTask: (id, body) => apiFetch(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
	deleteTask: (id) => apiFetch(`/tasks/${id}`, { method: 'DELETE' }),
	// Ajoute ici d'autres endpoints (projects, user, etc.)
}
