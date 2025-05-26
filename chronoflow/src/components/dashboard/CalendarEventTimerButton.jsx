import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'

function CalendarEventTimerButton ({ event, timer, lang }) {
	const [saving, setSaving] = useState(false)
	const isRunning = timer.running && timer.task?.id === event.id
	const isPaused = isRunning && timer.paused

	const handlePlayPause = e => {
		e.stopPropagation()
		if (!isRunning) {
			timer.start({ id: event.id, title: event.title })
		} else if (isPaused) {
			timer.resume()
		} else {
			timer.pause()
		}
	}

	const handleStop = async e => {
		e.stopPropagation()
		if (!isRunning) return
		setSaving(true)
		let elapsed = 0
		if (timer.getElapsedSeconds) {
			elapsed = timer.getElapsedSeconds()
		}
		const newDuration = (event.duration_seconds || 0) + (elapsed || 0)
		await supabase
			.from('tasks')
			.update({ duration_seconds: newDuration })
			.eq('id', event.id)
		timer.stop()
		setSaving(false)
	}

	return (
		<div className='flex items-center gap-1'>
			<button
				onClick={handlePlayPause}
				title={isRunning ? (isPaused ? (lang === 'fr' ? 'Reprendre' : 'Resume') : (lang === 'fr' ? 'Pause' : 'Pause')) : (lang === 'fr' ? 'Démarrer le timer' : 'Start timer')}
				aria-label={isRunning ? (isPaused ? (lang === 'fr' ? 'Reprendre' : 'Resume') : (lang === 'fr' ? 'Pause' : 'Pause')) : (lang === 'fr' ? 'Démarrer le timer' : 'Start timer')}
				className={`p-1 rounded-full ${isRunning ? (isPaused ? 'bg-yellow-100' : 'bg-yellow-200') : 'bg-blue-100 hover:bg-blue-200'} flex items-center justify-center cursor-pointer`}
				disabled={saving}
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
