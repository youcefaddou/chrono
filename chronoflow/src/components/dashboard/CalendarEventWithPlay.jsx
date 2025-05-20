import React from 'react'
import { useGlobalTimer } from '../Timer/GlobalTimerProvider'
import { supabase } from '../../lib/supabase'

function formatDuration (seconds) {
	if (!seconds || seconds < 1) return ''
	const h = Math.floor(seconds / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	const s = seconds % 60
	return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

function CalendarEventWithPlay({ event }) {
	const timer = useGlobalTimer()
	const isRunning = timer.running && timer.task?.id === event.id
	const isPaused = isRunning && timer.paused
	const [localDuration, setLocalDuration] = React.useState(event.duration_seconds || 0)
	const [saving, setSaving] = React.useState(false)

	// Update local duration when event changes
	React.useEffect(() => {
		setLocalDuration(event.duration_seconds || 0)
	}, [event.duration_seconds])

	// When timer stops, update duration in DB
	const handleStop = async e => {
		e.stopPropagation()
		timer.stop()
		let debugMsg = ''
		let elapsed = 0
		if (isRunning && timer.getElapsedSeconds) {
			elapsed = timer.getElapsedSeconds()
			debugMsg = `⏱ [DEBUG] handleStop: elapsed=${elapsed}, prev=${event.duration_seconds}, new=${(event.duration_seconds || 0) + elapsed}`
			if (!elapsed || elapsed < 1) {
				debugMsg += ' [ERREUR] elapsed est 0 ou undefined!'
			}
		}
		const newDuration = (event.duration_seconds || 0) + (elapsed || 0)
		setLocalDuration(newDuration)
		setSaving(true)
		await supabase
			.from('tasks')
			.update({ duration_seconds: newDuration })
			.eq('id', event.id)
		setSaving(false)
	}

	// Refetch global après stop ou finish
	React.useEffect(() => {
		if (saving === false) {
			if (typeof window !== 'undefined' && window.dispatchEvent) {
				window.dispatchEvent(new Event('task-finished'))
			}
		}
	}, [saving])

	const handlePlayPause = e => {
		e.stopPropagation()
		if (!isRunning) {
			timer.start({
				id: event.id,
				title: event.title,
				desc: event.desc,
				start: event.start,
				end: event.end,
				color: event.color,
				duration_seconds: localDuration,
			})
		} else if (isPaused) {
			timer.resume()
		} else {
			timer.pause()
		}
	}

	const handleFinish = async e => {
		e.stopPropagation()
		timer.stop()
		let debugMsg = ''
		let newDuration = localDuration
		let elapsed = 0
		if (isRunning && timer.getElapsedSeconds) {
			elapsed = timer.getElapsedSeconds()
			newDuration += elapsed
			debugMsg = `⏱ [DEBUG] handleFinish: elapsed=${elapsed}, prev=${localDuration}, new=${newDuration}`
			if (!elapsed || elapsed < 1) {
				debugMsg += ' [ERREUR] elapsed est 0 ou undefined!'
			}
			setLocalDuration(newDuration)
		}
		setSaving(true)
		await supabase
			.from('tasks')
			.update({ is_finished: true, duration_seconds: newDuration })
			.eq('id', event.id)
		setSaving(false)
		if (typeof event.onFinish === 'function') {
			event.onFinish(event.id)
		}
		if (window.dispatchEvent) {
			window.dispatchEvent(new Event('task-finished'))
		}
	}

	const isDone = event.is_finished === true || event.is_finished === 'true' || event.is_finished === 1

	return (
		<div className={`flex flex-col w-full h-full relative${isDone ? ' task-done-zebra' : ''}`}> 
			{isDone && (
				<span className='absolute inset-0 flex items-center justify-center z-10 text-xs font-bold text-green-700 pointer-events-none' style={{background: 'rgba(255,255,255,0.7)'}}>
					Terminée
				</span>
			)}
			<div className='flex items-center justify-between w-full'>
				<span className={`truncate font-semibold${isDone ? ' line-through text-gray-400' : ''}`}>{event.title}</span>
				<div className='flex items-center gap-1'>
					<button
						onClick={handlePlayPause}
						className={`p-1 rounded-full${isRunning ? ' bg-yellow-200' : ' bg-blue-100 hover:bg-blue-200'} flex items-center justify-center`}
						title={isRunning ? (isPaused ? 'Reprendre' : 'Pause') : 'Démarrer le timer'}
						aria-label={isRunning ? (isPaused ? 'Reprendre' : 'Pause') : 'Démarrer le timer'}
						disabled={isDone || saving}
					>
						{!isRunning ? (
							<svg width='16' height='16' fill='none' viewBox='0 0 20 20'>
								<polygon points='6,4 16,10 6,16' fill='#2563eb'/>
							</svg>
						) : isPaused ? (
							<svg width='16' height='16' fill='none' viewBox='0 0 20 20'>
								<polygon points='6,4 16,10 6,16' fill='#eab308'/>
							</svg>
						) : (
							<svg width='16' height='16' fill='none' viewBox='0 0 20 20'>
								<rect x='5' y='4' width='3' height='12' rx='1' fill='#eab308'/>
								<rect x='12' y='4' width='3' height='12' rx='1' fill='#eab308'/>
							</svg>
						)}
					</button>
					<button
						onClick={handleStop}
						className='p-1 rounded-full bg-rose-100 hover:bg-rose-200 flex items-center justify-center'
						title='Stopper le timer'
						aria-label='Stopper le timer'
						disabled={isDone || saving}
					>
						<svg width='16' height='16' fill='none' viewBox='0 0 20 20'>
							<rect x='5' y='5' width='10' height='10' rx='2' fill='#e11d48'/>
						</svg>
					</button>
				</div>
			</div>
			<div className='flex items-center justify-between mt-1'>
				<span className='text-xs text-gray-500 font-mono'>⏱ {formatDuration(localDuration)}</span>
				<button
					onClick={handleFinish}
					className='px-2 py-1 rounded bg-green-100 hover:bg-green-200 text-xs font-semibold text-green-700 w-fit ml-auto'
					title='Terminer la tâche'
					aria-label='Terminer la tâche'
					disabled={isDone || saving}
				>
					{saving ? '...' : 'Terminer la tâche'}
				</button>
			</div>
			{isDone && (
				<style>{`.task-done-zebra:before { content: ''; position: absolute; inset: 0; pointer-events: none; background: repeating-linear-gradient(45deg, #d1fae5 0 8px, #fff 8px 16px); z-index: 5; }`}</style>
			)}
		</div>
	)
}

export default CalendarEventWithPlay
