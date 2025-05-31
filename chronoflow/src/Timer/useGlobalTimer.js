import { useState, useEffect, useRef } from 'react'

export function useGlobalTimer () {
	const [running, setRunning] = useState(false)
	const [paused, setPaused] = useState(false)
	const [elapsed, setElapsed] = useState(0)
	const [task, setTask] = useState(null)
	const startTimeRef = useRef(null)
	const requestRef = useRef(null)

	const start = (taskObj) => {
		if (running) return
		setRunning(true)
		setPaused(false)
		if (taskObj) setTask(taskObj)
		startTimeRef.current = Date.now() - elapsed * 1000
		requestRef.current = requestAnimationFrame(update)
	}

	const startFrom = (seconds, taskObj) => {
		setElapsed(seconds)
		setTask(taskObj)
		setRunning(true)
		setPaused(false)
		startTimeRef.current = Date.now() - seconds * 1000
		cancelAnimationFrame(requestRef.current)
		requestRef.current = requestAnimationFrame(update)
	}

	const update = () => {
		setElapsed(() => {
			const diff = Math.floor((Date.now() - startTimeRef.current) / 1000)
			return diff >= 0 ? diff : 0
		})
		requestRef.current = requestAnimationFrame(update)
	}

	const pause = () => {
		if (!running || paused) return
		setPaused(true)
		cancelAnimationFrame(requestRef.current)
	}

	const resume = () => {
		if (!running || !paused) return
		setPaused(false)
		startTimeRef.current = Date.now() - elapsed * 1000
		requestRef.current = requestAnimationFrame(update)
	}

	const stop = () => {
		setRunning(false)
		setPaused(false)
		setElapsed(0)
		setTask(null)
		cancelAnimationFrame(requestRef.current)
	}

	useEffect(() => {
		return () => cancelAnimationFrame(requestRef.current)
	}, [])

	return {
		running,
		paused,
		elapsed,
		task,
		start,
		pause,
		resume,
		stop,
		startFrom,
	}
}