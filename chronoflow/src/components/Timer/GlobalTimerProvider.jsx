import React, { useContext, useRef, useState, useEffect, useCallback } from 'react'
import { GlobalTimerContext } from './GlobalTimerContext'

export function GlobalTimerProvider ({ children }) {
	const [accumulated, setAccumulated] = useState(0) // total seconds before current session
	const [running, setRunning] = useState(false)
	const [paused, setPaused] = useState(false)
	const [task, setTask] = useState(null)
	const [startTimestamp, setStartTimestamp] = useState(null) // ms since epoch
	const intervalRef = useRef(null)
	const [onSave, setOnSave] = useState(null) // callback pour notifier la sauvegarde

	// Tick for UI update
	const [, setTick] = useState(0)
	useEffect(() => {
		if (running && !paused) {
			if (!intervalRef.current) {
				intervalRef.current = setInterval(() => setTick(t => t + 1), 1000)
			}
		} else {
			if (intervalRef.current) {
				clearInterval(intervalRef.current)
				intervalRef.current = null
			}
		}
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current)
				intervalRef.current = null
			}
		}
	}, [running, paused])

	const start = (newTask = null, initialSeconds = 0) => {
		setTask(newTask)
		setAccumulated(initialSeconds)
		setRunning(true)
		setPaused(false)
		setStartTimestamp(Date.now())
	}

	const pause = () => {
		if (running && !paused && startTimestamp) {
			const elapsed = Math.floor((Date.now() - startTimestamp) / 1000)
			setAccumulated(a => a + elapsed)
			setStartTimestamp(null)
		}
		setPaused(true)
	}

	const resume = () => {
		if (running && paused) {
			setStartTimestamp(Date.now())
			setPaused(false)
		}
	}

	const stop = useCallback(async () => {
		let total = accumulated
		if (running && startTimestamp) {
			const elapsed = Math.floor((Date.now() - startTimestamp) / 1000)
			total += elapsed
		}
		const taskId = task?.id || task?._id
		if (task && taskId) {
			const isGoogleEvent = !!task.isGoogle || String(taskId).startsWith('gcal-')
			try {
				if (isGoogleEvent) {
					const eventId = String(taskId).replace(/^gcal-/, '')
					await fetch('http://localhost:3001/api/integrations/google-calendar/event-times', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						credentials: 'include',
						body: JSON.stringify({ eventId, durationSeconds: total }),
					})
					if (typeof onSave === 'function') onSave(eventId, total)
				} else {
					await fetch(`http://localhost:3001/api/tasks/${taskId}`, {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						credentials: 'include',
						body: JSON.stringify({ durationSeconds: total }),
					})
					if (typeof onSave === 'function') onSave(taskId, total)
				}
			} catch (err) {
				console.error('GlobalTimerProvider.stop: Failed to save timer', err)
			}
		} else {
			console.warn('GlobalTimerProvider.stop: No valid task id or _id, skipping save', task)
		}
		setRunning(false)
		setPaused(false)
		setStartTimestamp(null)
		setTask(null)
		setAccumulated(0)
	}, [accumulated, running, startTimestamp, task, onSave])

	const setTime = s => setAccumulated(s)
	const setOnSaveCallback = cb => setOnSave(() => cb)

	const getElapsedSeconds = () => {
		if (!running) return 0
		if (paused || !startTimestamp) return accumulated
		return accumulated + Math.floor((Date.now() - startTimestamp) / 1000)
	}

	return (
		<GlobalTimerContext.Provider
			value={{
				running,
				paused,
				task,
				start,
				pause,
				resume,
				stop,
				setTime,
				setTask,
				getElapsedSeconds,
				setOnSaveCallback,
			}}
		>
			{children}
		</GlobalTimerContext.Provider>
	)
}

export default GlobalTimerProvider
