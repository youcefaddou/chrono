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
			const [tasksRes, googleRes, timesRes] = await Promise.all([
				fetch('http://localhost:3001/api/tasks', { credentials: 'include' }),
				fetch('http://localhost:3001/api/integrations/google-calendar/events', { credentials: 'include' }),
				fetch('http://localhost:3001/api/integrations/google-calendar/event-times', { credentials: 'include' }),
			])

			let merged = []
			let googleEventTimes = []
			if (timesRes.ok) {
				googleEventTimes = await timesRes.json()
			}
			const timesByEventId = {}
			googleEventTimes.forEach(t => {
				timesByEventId[t.eventId] = t.durationSeconds
			})

			if (tasksRes.ok) {
				const data = await tasksRes.json()
				merged = data
			}

			if (googleRes.ok) {
				const googleEvents = await googleRes.json()
				const mappedGoogle = googleEvents.map(event => {
					const eventId = String(event.id)
					return {
						...event,
						isGoogle: true,
						readOnly: true,
						id: 'gcal-' + eventId, // id unique string pour React
						eventId: eventId, // id Google pur pour la DB/API
						title: event.summary || event.title || '(Google event)',
						start: event.start,
						end: event.end,
						durationSeconds: typeof timesByEventId[eventId] === 'number' ? timesByEventId[eventId] : 0,
					}
				})
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
