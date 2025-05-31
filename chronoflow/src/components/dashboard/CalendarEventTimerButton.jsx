import React, { useState, useEffect } from 'react'


function CalendarEventTimerButton ({ event, timer, lang, disabled, onTaskUpdate }) {
	const [saving, setSaving] = useState(false)
	const isRunning = timer.running && timer.task?.id === event.id
	const isPaused = isRunning && timer.paused

	// Plus de localDuration, toujours utiliser la valeur de la DB (event.durationSeconds)

	const handlePlayPause = e => {
		e.stopPropagation()
		e.preventDefault()
		if (disabled) return
		if (!isRunning) {
			// Démarre le timer à partir de la dernière valeur connue (locale)
			if (typeof timer.startFrom === 'function') {
				timer.startFrom(event.durationSeconds || 0, event)
			} else if (typeof timer.start === 'function') {
				timer.start(event, event.durationSeconds || 0)
			}
		} else if (isPaused) {
			timer.resume()
		} else {
			timer.pause()
		}
	}

	const handleStop = async e => {
		e.stopPropagation()
		e.preventDefault()
		if (!isRunning) return
		setSaving(true)
		let elapsed = 0
		if (timer.getElapsedSeconds) {
			elapsed = timer.getElapsedSeconds()
		}
		const newDuration = (event.durationSeconds || 0) + (elapsed || 0)
		try {
			// Defensive: ensure timer.task is the correct event before stopping
			if (!timer.task || timer.task.id !== event.id) {
				if (typeof timer.setTask === 'function') {
					timer.setTask(event)
				}
			}
			if (!event.id && !event._id) {
				console.warn('handleStop: event.id/_id is missing, aborting stop')
				setSaving(false)
				return
			}
			const eventId = event.id || event._id
			const res = await fetch(`http://localhost:3001/api/tasks/${eventId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ durationSeconds: newDuration })
			})
			const contentType = res.headers.get('content-type')
			if (!res.ok || !contentType || !contentType.includes('application/json')) {
				const text = await res.text()
				console.error('Erreur lors de la mise à jour du timer:', text)
				alert('Erreur lors de la mise à jour du timer: ' + text.slice(0, 200))
				setSaving(false)
				return
			}
			if (typeof timer.stop === 'function') {
				timer.stop()
			}
			setSaving(false)
			if (onTaskUpdate) onTaskUpdate(event.id, newDuration)
		} catch (err) {
			console.error('Erreur lors de la mise à jour du timer:', err)
			setSaving(false)
		}
	}

	return (
		<div className='flex items-center gap-1 task-timer-buttons'>
			<button
				onClick={handlePlayPause}
				title={isRunning ? (isPaused ? (lang === 'fr' ? 'Reprendre' : 'Resume') : (lang === 'fr' ? 'Pause' : 'Pause')) : (lang === 'fr' ? 'Démarrer le timer' : 'Start timer')}
				aria-label={isRunning ? (isPaused ? (lang === 'fr' ? 'Reprendre' : 'Resume') : (lang === 'fr' ? 'Pause' : 'Pause')) : (lang === 'fr' ? 'Démarrer le timer' : 'Start timer')}
				className={`p-1 rounded-full ${isRunning ? (isPaused ? 'bg-yellow-100' : 'bg-yellow-200') : 'bg-blue-100 hover:bg-blue-200'} flex items-center justify-center cursor-pointer`}
				disabled={saving || disabled}
				data-timer-button="true"
			>
				{!isRunning ? (
					<svg width='10' height='10' fill='none' viewBox='0 0 20 20'>
						<polygon points='6,4 16,10 6,16' fill='#2563eb' />
					</svg>
				) : isPaused ? (
					<svg width='10' height='10' fill='none' viewBox='0 0 20 20'>
						<polygon points='6,4 16,10 6,16' fill='#eab308' />
					</svg>
				) : (
					<svg width='10' height='10' fill='none' viewBox='0 0 20 20'>
						<rect x='5' y='4' width='3' height='12' rx='1' fill='#eab308' />
						<rect x='12' y='4' width='3' height='12' rx='1' fill='#eab308' />
					</svg>
				)}
			</button>
			{isRunning && (
				<button
					onClick={handleStop}
					title={lang === 'fr' ? 'Arrêter' : 'Stop'}
					aria-label={lang === 'fr' ? 'Arrêter' : 'Stop'}
					className='p-1 rounded-full bg-rose-100 hover:bg-rose-200 flex items-center justify-center cursor-pointer'
					disabled={saving}
					data-timer-button="true"
				>
					<svg width='14' height='14' fill='none' viewBox='0 0 20 20'>
						<rect x='5' y='5' width='10' height='10' rx='2' fill='#e11d48' />
					</svg>
				</button>
			)}
		</div>
	)
}

export default CalendarEventTimerButton
