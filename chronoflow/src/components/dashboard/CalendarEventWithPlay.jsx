import React from 'react'
import { useGlobalTimer } from '../Timer/useGlobalTimer'
import { supabase } from '../../lib/supabase'
import { useTranslation } from '../../hooks/useTranslation'
import './CalendarEventWithPlay.css'
import { format } from 'date-fns'

function formatDuration (seconds) {
	if (!seconds || seconds < 1) return ''
	const h = Math.floor(seconds / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	const s = seconds % 60
	return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

function CalendarEventWithPlay({ event = {}, isOverlapped = false, isListMode = false }) {
	// Ajoutez une valeur par défaut pour `event` pour éviter les erreurs
	const timer = useGlobalTimer()
	const { t } = useTranslation()
	const isRunning = timer.running && timer.task?.id === event.id
	const isPaused = isRunning && timer.paused
	const [localDuration, setLocalDuration] = React.useState(event.duration_seconds || 0)
	const [saving, setSaving] = React.useState(false)
	const [pollingInterval, setPollingInterval] = React.useState(null)
	// Calculer le temps total affiché (temps accumulé + temps en cours)
	const getDisplayDuration = React.useCallback(() => {
		if (isRunning && !isPaused && timer.getElapsedSeconds) {
			// Afficher le temps accumulé + temps de la session en cours
			return localDuration + timer.getElapsedSeconds()
		}
		// Sinon, afficher seulement le temps accumulé
		return localDuration
	}, [isRunning, isPaused, localDuration, timer])

	// Forcer le re-render toutes les secondes quand le timer fonctionne
	const [, forceUpdate] = React.useReducer(x => x + 1, 0)
	
	React.useEffect(() => {
		if (isRunning && !isPaused) {
			const interval = setInterval(forceUpdate, 1000)
			return () => clearInterval(interval)
		}
	}, [isRunning, isPaused])

	// Poll la DB pour avoir le temps réel (toutes les 30s)
	React.useEffect(() => {
		if (!event.id) return
		function fetchDuration () {
			supabase
				.from('tasks')
				.select('duration_seconds')
				.eq('id', event.id)
				.single()
				.then(({ data }) => {
					if (data && typeof data.duration_seconds === 'number') {
						setLocalDuration(data.duration_seconds)
					}
				})
		}
		fetchDuration()
		const interval = setInterval(fetchDuration, 30000)
		setPollingInterval(interval)
		return () => {
			clearInterval(interval) // Nettoie l'interval à chaque changement d'event.id ou unmount
		}
	}, [event.id])

	// Update local duration when event changes
	React.useEffect(() => {
		setLocalDuration(event.duration_seconds || 0)
	}, [event.duration_seconds])
	// When timer stops, update duration in DB
	const handleStop = async e => {
		e.stopPropagation()
		let elapsed = 0
		if (isRunning && timer.getElapsedSeconds) {
			elapsed = timer.getElapsedSeconds()
		}
		timer.stop()
		const newDuration = localDuration + (elapsed || 0)
		setLocalDuration(newDuration)
		setSaving(true)
		await supabase
			.from('tasks')
			.update({ duration_seconds: newDuration })
			.eq('id', event.id)
		setSaving(false)
	}

	const handlePlayPause = e => {
		e.stopPropagation()
		if (!isRunning) {
			// Démarrer le timer sans reset pour conserver la continuité
			timer.start({
				id: event.id,
				title: event.title,
				desc: event.desc,
				start: event.start,
				end: event.end,
				color: event.color,
				duration_seconds: localDuration,
			}, false) // false = ne pas réinitialiser le timer		} else if (isPaused) {
			timer.resume()
		} else {
			timer.pause()
		}
	}
	const handleFinish = async e => {
		e.stopPropagation()
		let elapsed = 0
		if (isRunning && timer.getElapsedSeconds) {
			elapsed = timer.getElapsedSeconds()
		}
		timer.stop()
		const newDuration = localDuration + (elapsed || 0)
		setLocalDuration(newDuration)
		setSaving(true)
		await supabase
			.from('tasks')
			.update({ is_finished: true, duration_seconds: newDuration })
			.eq('id', event.id)
		setSaving(false)
		if (typeof event.onFinish === 'function') {
			event.onFinish(event.id)
		}
		// Ne déclenche le refetch global QUE si on n'est PAS en mode agenda/liste
		if (!isListMode && window.dispatchEvent) {
			window.dispatchEvent(new Event('task-finished'))
		}
	}

	// Gérer les clics sur le conteneur de la tâche
	const handleContainerClick = (e) => {
		const target = e.target
		const isButton = target.tagName === 'BUTTON' || target.closest('button')
		const isInteractive = target.tagName === 'INPUT' || target.closest('input')
		const isSvg = target.tagName === 'svg' || target.closest('svg')
		if (isButton || isInteractive || isSvg) {
			return
		}
		// Only open modal if click is on the main event content (not background)
		if (typeof event.onEdit === 'function') {
			event.onEdit(event)
		}
	}
	const isDone = event.is_finished === true || event.is_finished === 'true' || event.is_finished === 1
	// Calculer la hauteur disponible pour déterminer le layout
	const [containerHeight, setContainerHeight] = React.useState(0)
	const [showTooltip, setShowTooltip] = React.useState(false)
	const containerRef = React.useRef(null)
	
	React.useEffect(() => {
		if (containerRef.current) {
			const height = containerRef.current.offsetHeight
			setContainerHeight(height)
		}
	}, [])

	// Observer pour redimensionnement
	React.useEffect(() => {
		if (!containerRef.current) return
		
		const resizeObserver = new ResizeObserver((entries) => {
			for (let entry of entries) {
				setContainerHeight(entry.contentRect.height)
			}
		})
				resizeObserver.observe(containerRef.current)
		return () => resizeObserver.disconnect()
	}, [])
	

	const baseVerySmallThreshold = isOverlapped ? 35 : 40
	const baseSmallThreshold = isOverlapped ? 80 : 100
	const baseMediumThreshold = isOverlapped ? 120 : 150
	
	const isVerySmallTask = containerHeight < baseVerySmallThreshold // Très petite tâche
	const isSmallTask = containerHeight < baseSmallThreshold   // Petite tâche (layout compact préféré)
	const isMediumTask = containerHeight < baseMediumThreshold   // Tâche moyenne
	
	const taskSizeClass = isVerySmallTask ? 'very-small-task' : 
						  isSmallTask ? 'small-task' : 
						  isMediumTask ? 'medium-task' : 'large-task'
	const collisionClass = isOverlapped ? 'overlapped-task' : ''
	
	const startTime = event.start ? new Date(event.start) : null
	const endTime = event.end ? new Date(event.end) : null

	// Ajoutez un log pour vérifier les données de l'événement
	console.log('Event Data:', event)

	return (
		<div
			ref={containerRef}
			className={
				isListMode
					? 'task-event-container flex items-center w-full p-2 gap-2 bg-white border-b'
					: `task-event-container ${taskSizeClass} ${collisionClass} flex flex-col w-full h-full relative p-2`
			}
			onClick={handleContainerClick}
			onMouseEnter={() => isVerySmallTask && setShowTooltip(true)}
			onMouseLeave={() => setShowTooltip(false)}
			data-completed={isDone}
			style={isListMode ? { position: 'static', height: 'auto' } : undefined}
		>
			{isListMode ? (
				// Mode agenda/liste : tout sur une ligne, actions à droite
				<div className='flex items-center w-full gap-2'>
					<span
						className={`truncate font-semibold text-sm${isDone ? ' line-through text-gray-400' : ''}`}
						style={{ flex: 1, minWidth: 0 }}
					>
						{event.title}
					</span>
					<button
						onClick={handlePlayPause}
						className='p-1 rounded-full flex items-center justify-center bg-blue-100 hover:bg-blue-200'
						title={isRunning ? (isPaused ? t('timer.resume') : t('timer.pause')) : t('timer.start')}
						aria-label={isRunning ? (isPaused ? t('timer.resume') : t('timer.pause')) : t('timer.start')}
						disabled={isDone || saving}
					>
						{!isRunning ? (
							<svg width='14' height='14' fill='none' viewBox='0 0 20 20'>
								<polygon points='6,4 16,10 6,16' fill='#2563eb'/>
							</svg>
						) : isPaused ? (
							<svg width='14' height='14' fill='none' viewBox='0 0 20 20'>
								<polygon points='6,4 16,10 6,16' fill='#eab308'/>
							</svg>
						) : (
							<svg width='14' height='14' fill='none' viewBox='0 0 20 20'>
								<rect x='5' y='4' width='3' height='12' rx='1' fill='#eab308'/>
								<rect x='12' y='4' width='3' height='12' rx='1' fill='#eab308'/>
							</svg>
						)}
					</button>
					<button
						onClick={handleStop}
						className='p-1 rounded-full bg-rose-100 hover:bg-rose-200 flex items-center justify-center'
						title={t('timer.stop')}
						aria-label={t('timer.stop')}
						disabled={isDone || saving}
					>
						<svg width='14' height='14' fill='none' viewBox='0 0 20 20'>
							<rect x='5' y='5' width='10' height='10' rx='2' fill='#e11d48'/>
						</svg>
					</button>
					{/* Affiche le bouton "Terminer la tâche" si non terminé, sinon badge terminé */}
					{isDone ? (
						<span className='text-xs font-bold text-green-700 bg-green-50 rounded px-2 py-1 ml-1'>
							{t('task.completed')}
						</span>
					) : (
						<button
							onClick={handleFinish}
							className='px-2 py-1 rounded bg-green-100 hover:bg-green-200 text-xs font-medium text-green-700 ml-1'
							title={t('task.complete')}
							aria-label={t('task.complete')}
							disabled={isDone || saving}
						>
							{saving ? '...' : t('task.complete')}
						</button>
					)}
					<div className='text-xs font-semibold text-gray-700 font-mono bg-gray-100 px-2 py-0.5 rounded ml-2'>
						⏱ {formatDuration(getDisplayDuration())}
					</div>
				</div>
			) : (
				// Mode CALENDRIER : bouton "Terminer la tâche" SOUS la tâche
				<>
					<div className={`flex items-center justify-between w-full ${isSmallTask ? 'mb-1' : 'mb-2'}`}>
						<span className={`truncate font-semibold ${isSmallTask ? 'text-xs' : 'text-sm'}${isDone ? ' line-through text-gray-400' : ''}`}>
							{event.title}
						</span>
						<div className='flex items-center gap-1'>
							<button
								onClick={handlePlayPause}
								className={`${isSmallTask ? 'p-0.5' : 'p-1'} rounded-full${isRunning ? ' bg-yellow-200' : ' bg-blue-100 hover:bg-blue-200'} flex items-center justify-center`}
								title={isRunning ? (isPaused ? t('timer.resume') : t('timer.pause')) : t('timer.start')}
								aria-label={isRunning ? (isPaused ? t('timer.resume') : t('timer.pause')) : t('timer.start')}
								disabled={isDone || saving}
							>
								{!isRunning ? (
									<svg width={isSmallTask ? '10' : '14'} height={isSmallTask ? '10' : '14'} fill='none' viewBox='0 0 20 20'>
										<polygon points='6,4 16,10 6,16' fill='#2563eb'/>
									</svg>
								) : isPaused ? (
									<svg width={isSmallTask ? '10' : '14'} height={isSmallTask ? '10' : '14'} fill='none' viewBox='0 0 20 20'>
										<polygon points='6,4 16,10 6,16' fill='#eab308'/>
									</svg>
								) : (
									<svg width={isSmallTask ? '10' : '14'} height={isSmallTask ? '10' : '14'} fill='none' viewBox='0 0 20 20'>
										<rect x='5' y='4' width='3' height='12' rx='1' fill='#eab308'/>
										<rect x='12' y='4' width='3' height='12' rx='1' fill='#eab308'/>
									</svg>
								)}
							</button>
							<button
								onClick={handleStop}
								className={`${isSmallTask ? 'p-0.5' : 'p-1'} rounded-full bg-rose-100 hover:bg-rose-200 flex items-center justify-center`}
								title={t('timer.stop')}
								aria-label={t('timer.stop')}
								disabled={isDone || saving}
							>
								<svg width={isSmallTask ? '10' : '14'} height={isSmallTask ? '10' : '14'} fill='none' viewBox='0 0 20 20'>
									<rect x='5' y='5' width='10' height='10' rx='2' fill='#e11d48'/>
								</svg>
							</button>
						</div>
					</div>
					{isSmallTask ? (
						<div className='flex items-center justify-between w-full gap-1'>
							<div className='text-xs font-semibold text-gray-700 font-mono bg-gray-100 px-1 py-0.5 rounded text-center min-w-0'>
								⏱ {formatDuration(getDisplayDuration())}
							</div>
						</div>
					) : (
						<div className='flex flex-col items-center gap-1'>
							<div className='text-sm font-semibold text-gray-700 font-mono bg-gray-50 px-2 py-0.5 rounded border'>
								⏱ {formatDuration(getDisplayDuration())}
							</div>
						</div>
					)}
					<div className='w-full flex flex-col items-stretch'>
						{isDone ? (
							<div className='flex items-center justify-center text-xs font-bold text-green-700 bg-green-50 rounded mb-1 py-1'>
								{t('task.completed')}
							</div>
						) : (
							<button
								onClick={handleFinish}
								className={`w-full ${isSmallTask ? 'px-1 py-0.5 text-xs' : 'px-2 py-1 text-xs'} rounded bg-green-100 hover:bg-green-200 font-medium text-green-700 mb-1`}
								title={t('task.complete')}
								aria-label={t('task.complete')}
								disabled={isDone || saving}
							>
								{saving ? '...' : t('task.complete')}
							</button>
						)}
					</div>
				</>
			)}
		</div>
	)
}

export default CalendarEventWithPlay
