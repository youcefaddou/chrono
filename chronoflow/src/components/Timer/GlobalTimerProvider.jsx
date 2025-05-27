import React, { useContext, useRef, useState, useEffect } from 'react'
import { GlobalTimerContext } from './GlobalTimerContext'

export function GlobalTimerProvider ({ children }) {
	const [accumulated, setAccumulated] = useState(0) // total seconds before current session
	const [running, setRunning] = useState(false)
	const [paused, setPaused] = useState(false)
	const [task, setTask] = useState(null)
	const [projectId, setProjectId] = useState(null)
	const [startTimestamp, setStartTimestamp] = useState(null) // ms since epoch
	const intervalRef = useRef(null)

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

	const start = (newTask = null, reset = true) => {
		setRunning(true)
		setPaused(false)
		setStartTimestamp(Date.now())
		if (reset) setAccumulated(0)
		if (newTask && newTask.projectId) {
			setProjectId(newTask.projectId)
			setTask({ projectId: newTask.projectId, name: newTask.name, id: newTask.id })
		} else if (newTask) {
			setTask(newTask)
			setProjectId(null)
		} else {
			setTask(null)
			setProjectId(null)
		}
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

	const stop = () => {
		if (running && startTimestamp) {
			const elapsed = Math.floor((Date.now() - startTimestamp) / 1000)
			setAccumulated(a => a + elapsed)
		}
		setRunning(false)
		setPaused(false)
		setStartTimestamp(null)
		setTask(null)
		setProjectId(null)
		setAccumulated(0) // Toujours remettre à zéro
	}

	const setTime = s => setAccumulated(s)

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
				projectId,
				start,
				pause,
				resume,
				stop,
				setTime,
				setTask,
				getElapsedSeconds,
			}}
		>
			{children}
		</GlobalTimerContext.Provider>
	)
}

export default GlobalTimerProvider
