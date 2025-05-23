import { useState, useEffect, useCallback, useRef } from 'react'

const STORAGE_KEY = 'chrono_project_timer'

export function useProjectTimer () {
	const [activeProjectId, setActiveProjectId] = useState(null)
	const [startTime, setStartTime] = useState(null)
	const [now, setNow] = useState(Date.now())
	const intervalRef = useRef(null)

	// Tick every second, but update immediately on start/stop for instant feedback
	const clearTick = () => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current)
			intervalRef.current = null
		}
	}

	const tick = useCallback(() => {
		setNow(Date.now())
	}, [])

	useEffect(() => {
		if (activeProjectId && startTime) {
			tick() // update immediately for no delay
			clearTick()
			intervalRef.current = setInterval(tick, 1000)
		} else {
			clearTick()
		}
		return () => clearTick()
	}, [activeProjectId, startTime, tick])

	// Load from localStorage on mount
	useEffect(() => {
		const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
		if (data.projectId && data.startTime) {
			setActiveProjectId(data.projectId)
			setStartTime(data.startTime)
		}
	}, [])

	// Save to localStorage
	useEffect(() => {
		if (activeProjectId && startTime) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify({ projectId: activeProjectId, startTime }))
		} else {
			localStorage.removeItem(STORAGE_KEY)
		}
	}, [activeProjectId, startTime])

	const start = useCallback((projectId) => {
		const t = Date.now()
		setActiveProjectId(projectId)
		setStartTime(t)
		setNow(t) // update immediately for no delay
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ projectId, startTime: t }))
	}, [])

	const stop = useCallback(() => {
		setActiveProjectId(null)
		setStartTime(null)
		setNow(Date.now()) // update immediately for no delay
		localStorage.removeItem(STORAGE_KEY)
	}, [])

	const getElapsed = useCallback(() => {
		if (!activeProjectId || !startTime) return 0
		const elapsed = Math.floor((now - startTime) / 1000)
		return elapsed
	}, [activeProjectId, startTime, now])

	const elapsedTime = getElapsed()

	return {
		activeProjectId,
		startTime,
		isRunning: !!activeProjectId,
		start,
		stop,
		getElapsed,
		elapsedTime,
	}
}
