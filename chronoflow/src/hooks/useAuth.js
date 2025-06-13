import { useState, useEffect } from 'react'

export function useAuth () {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const res = await fetch('http://localhost:3001/api/me', {
					credentials: 'include',
				})
				if (res.ok) {
					const data = await res.json()
					setUser(data)
				} else {
					setUser(null)
				}
			} finally {
				setLoading(false)
			}
		}
		fetchUser()
	}, [])

	return { user, loading }
}
