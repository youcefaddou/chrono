import React, { createContext, useContext, useRef, useState, useEffect } from 'react'

const GlobalTimerContext = createContext()

export function GlobalTimerProvider ({ children }) {
	const [seconds, setSeconds] = useState(0)
	const [running, setRunning] = useState(false)
	const [paused, setPaused] = useState(false)
	const [task, setTask] = useState(null)
	const intervalRef = useRef(null)

	useEffect(() => {
		if (running && !paused) {
			if (!intervalRef.current) {
				intervalRef.current = setInterval(() => {
					setSeconds(s => s + 1)
				}, 1000)
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
		if (reset) setSeconds(0)
		if (newTask) setTask(newTask)
	}

	const pause = () => setPaused(true)
	const resume = () => setPaused(false)
	const stop = () => {
		setRunning(false)
		setPaused(false)
		setSeconds(0)
		setTask(null)
	}

	const setTime = s => setSeconds(s)

	return (
		<GlobalTimerContext.Provider
			value={{
				seconds,
				running,
				paused,
				task,
				start,
				pause,
				resume,
				stop,
				setTime,
				setTask,
				getElapsedSeconds: () => seconds,
			}}
		>
			{children}
		</GlobalTimerContext.Provider>
	)
}

export { GlobalTimerContext }
