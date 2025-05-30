import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { api } from '../../lib/api'

function CalendarEventTimerButton ({ event, timer, lang, disabled, onTaskUpdate }) {
	const [saving, setSaving] = useState(false)
	const [localDuration, setLocalDuration] = useState(event.duration_seconds || 0)
	const isRunning = timer.running && timer.task?.id === event.id
	const isPaused = isRunning && timer.paused

	// Mettre à jour la durée locale quand l'événement change
	useEffect(() => {
		setLocalDuration(event.duration_seconds || 0)
	}, [event.duration_seconds])

	const handlePlayPause = e => {
		e.stopPropagation();
		e.preventDefault(); // Ajouter preventDefault pour éviter les comportements par défaut
		if (disabled) return
		if (!isRunning) {
			timer.start({ 
				id: event.id, 
				title: event.title,
				duration_seconds: localDuration // Préserver la durée actuelle
			})
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
		const newDuration = (event.duration_seconds || 0) + (elapsed || 0)
		setLocalDuration(newDuration)
		await api.updateTask(event.id, { durationSeconds: newDuration })
		timer.stop()
		setSaving(false)
		if (onTaskUpdate) onTaskUpdate(event.id, newDuration)
	}

	return (
		<div className='flex items-center gap-1 task-timer-buttons'>
			<button
				onClick={handlePlayPause}
				title={isRunning ? (isPaused ? (lang === 'fr' ? 'Reprendre' : 'Resume') : (lang === 'fr' ? 'Pause' : 'Pause')) : (lang === 'fr' ? 'Démarrer le timer' : 'Start timer')}
				aria-label={isRunning ? (isPaused ? (lang === 'fr' ? 'Reprendre' : 'Resume') : (lang === 'fr' ? 'Pause' : 'Pause')) : (lang === 'fr' ? 'Démarrer le timer' : 'Start timer')}
				className={`p-1 rounded-full ${isRunning ? (isPaused ? 'bg-yellow-100' : 'bg-yellow-200') : 'bg-blue-100 hover:bg-blue-200'} flex items-center justify-center cursor-pointer`}
				disabled={saving || disabled}
				data-timer-button="true" // Ajouter un attribut data pour faciliter la détection
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
					data-timer-button="true" // Ajouter un attribut data pour faciliter la détection
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
