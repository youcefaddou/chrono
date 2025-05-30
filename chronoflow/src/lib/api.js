const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

function getToken () {
	return localStorage.getItem('token')
}

async function apiFetch (endpoint, options = {}) {
	const headers = { 'Content-Type': 'application/json', ...options.headers }
	const token = getToken()
	if (token) headers.Authorization = `Bearer ${token}`
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
	getTasks: () => apiFetch('/tasks'),
	createTask: (body) => apiFetch('/tasks', { method: 'POST', body: JSON.stringify(body) }),
	updateTask: (id, body) => apiFetch(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
	deleteTask: (id) => apiFetch(`/tasks/${id}`, { method: 'DELETE' }),
	// Ajoute ici d'autres endpoints (projects, user, etc.)
}

export async function login ({ email, password }) {
	const res = await fetch('http://localhost:3001/api/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email, password }),
	})
	const data = await res.json()
	if (!res.ok) throw new Error(data.message || 'Login failed')
	return data
}
