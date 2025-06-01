import { useState, useEffect, useCallback } from 'react'

/**
 * Hook pour fusionner les tâches internes et les événements Google Calendar avec leur temps suivi
 * Retourne : { events, loading, error, refetch }
 */
function useMergedEvents () {
	const [events, setEvents] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	const fetchMergedEvents = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const [tasksRes, googleRes] = await Promise.all([
				fetch('http://localhost:3001/api/tasks', { credentials: 'include' }),
				fetch('http://localhost:3001/api/integrations/google-calendar/imported-events', { credentials: 'include' }),
			])

			let merged = []

			if (tasksRes.ok) {
				const data = await tasksRes.json()
				merged = data
			}

			if (googleRes.ok) {
				const googleEvents = await googleRes.json()
				const mappedGoogle = googleEvents.map(event => ({
					...event,
					isGoogle: true,
					id: 'gcal-' + event.eventId, // id unique string pour React
					eventId: event.eventId, // id Google pur pour la DB/API
					title: event.title || event.summary || '(Google event)',
					start: event.start,
					end: event.end,
					durationSeconds: event.durationSeconds || 0,
					is_finished: !!event.isFinished,
					isFinished: !!event.isFinished,
				}))
				merged = [...merged, ...mappedGoogle]
			}

			setEvents(merged)
		} catch (err) {
			setError(err)
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchMergedEvents()
	}, [fetchMergedEvents])

	return { events, loading, error, refetch: fetchMergedEvents }
}

export default useMergedEvents
