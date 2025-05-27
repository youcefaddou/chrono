import React from 'react'
import { useGlobalTimer } from '../Timer/useGlobalTimer'
import { supabase } from '../../lib/supabase'
import { useTranslation } from '../../hooks/useTranslation'
import './CalendarEventWithPlay.css'
import '../Timer/timer-styles.css'
import TimerDisplay from '../Timer/TimerDisplay'

// Cache global pour suivre les IDs de tâches supprimées
// Ce cache sera partagé entre toutes les instances du composant
const deletedTasksCache = new Set();

function CalendarEventWithPlay({ 
	event = {}, 
	isOverlapped = false, 
	isListMode = false,
	// Nouvelle prop pour désactiver le polling dans certains contextes
	disablePolling = false 
}) {
	// Ajoutez une valeur par défaut pour `event` pour éviter les erreurs
	const timer = useGlobalTimer()
	const { t } = useTranslation()
	// Optimisation : extraire uniquement les infos nécessaires du timer pour éviter les re-renders globaux
	const runningTaskId = React.useMemo(() => timer.task?.id, [timer.task?.id])
	const isRunning = React.useMemo(() => timer.running && runningTaskId === event.id, [timer.running, runningTaskId, event.id])
	const isPaused = React.useMemo(() => isRunning && timer.paused, [isRunning, timer.paused])
	const getElapsedSeconds = React.useMemo(() => (isRunning && typeof timer.getElapsedSeconds === 'function') ? timer.getElapsedSeconds : undefined, [isRunning, timer.getElapsedSeconds])
	const [localDuration, setLocalDuration] = React.useState(event.duration_seconds || 0)
	const [saving, setSaving] = React.useState(false)
	const [pollingInterval, setPollingInterval] = React.useState(null)
	const [taskExists, setTaskExists] = React.useState(true)
	const taskIdRef = React.useRef(event.id)
	const [displayedDuration, setDisplayedDuration] = React.useState(localDuration)
	
	// Poll la DB pour avoir le temps réel (toutes les 30s), mais uniquement si nécessaire
	React.useEffect(() => {
		// Ne pas faire de polling si explicitement désactivé
		if (disablePolling) return;
		
		// Ne rien faire si l'ID est dans le cache des tâches supprimées
		if (!event.id || deletedTasksCache.has(event.id)) {
			setTaskExists(false);
			return;
		}

		// Référence pour composant monté
		let isMounted = true;
		
		// Vérifier d'abord si la tâche existe avant de commencer le polling
		supabase
			.from('tasks')
			.select('id')
			.eq('id', event.id)
			.single()
			.then(({ data, error }) => {
				if (error || !data) {
					deletedTasksCache.add(event.id);
					if (isMounted) setTaskExists(false);
					return;
				}
				
				// La tâche existe, configurer le polling pour la durée
				if (!isMounted) return;
				
				function fetchDuration() {
					if (!isMounted || deletedTasksCache.has(event.id)) return;
					
					supabase
						.from('tasks')
						.select('duration_seconds')
						.eq('id', event.id)
						.single()
						.then(({ data, error }) => {
							if (!isMounted) return;
							
							if (error) {
								if (error.code === '406') {
									deletedTasksCache.add(event.id);
									setTaskExists(false);
									if (pollingInterval) {
										clearInterval(pollingInterval);
										setPollingInterval(null);
									}
								}
								return;
							}
							
							if (data && typeof data.duration_seconds === 'number') {
								setLocalDuration(data.duration_seconds);
							}
						});
				}
				
				fetchDuration();
				const interval = setInterval(fetchDuration, 30000);
				setPollingInterval(interval);
			})
			.catch(err => {
				console.error("Error checking task existence:", err);
			});
		
		return () => {
			isMounted = false;
			if (pollingInterval) {
				clearInterval(pollingInterval);
			}
		};
	}, [event.id, disablePolling, pollingInterval])

	// Nettoyer l'intervalle au démontage
	React.useEffect(() => {
		return () => {
			if (pollingInterval) {
				clearInterval(pollingInterval);
			}
		};
	}, [pollingInterval])

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
		
		// Ne pas déclencher l'événement onEdit si on clique sur un bouton/input/svg
		if (isButton || isInteractive || isSvg) {
			return
		}
		
		e.stopPropagation(); // Empêcher la propagation pour éviter de déclencher onSelectEvent
		
		// Appeler la fonction onEdit si elle existe
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
	const isTinyTask = containerHeight < 10
	
	const taskSizeClass = isVerySmallTask ? 'very-small-task' : 
						  isSmallTask ? 'small-task' : 
						  isMediumTask ? 'medium-task' : 'large-task'
	const collisionClass = isOverlapped ? 'overlapped-task' : ''
	
	const startTime = event.start ? new Date(event.start) : null
	const endTime = event.end ? new Date(event.end) : null

	// Si la tâche n'existe pas, ne pas rendre le composant
	if (!taskExists) return null;

	return (
		<div
			ref={containerRef}
			className={
				isListMode
					? 'task-event-container flex items-center w-full p-2 gap-2 bg-white border-b'
					: `task-event-container ${taskSizeClass} ${collisionClass} flex flex-col w-full h-full relative p-2`
			}
			onClick={handleContainerClick}
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
						className={`${isTinyTask ? 'p-0' : 'p-1'} rounded-full flex items-center justify-center bg-blue-100 hover:bg-blue-200`}
						style={isTinyTask ? { minWidth: 10, minHeight: 10, width: 10, height: 10 } : {}}
						title={isRunning ? (isPaused ? t('timer.resume') : t('timer.pause')) : t('timer.start')}
						aria-label={isRunning ? (isPaused ? t('timer.resume') : t('timer.pause')) : t('timer.start')}
						disabled={isDone || saving}
					>
						{!isRunning ? (
							<svg width={isTinyTask ? '6' : '14'} height={isTinyTask ? '6' : '14'} fill='none' viewBox='0 0 20 20'>
								<polygon points='6,4 16,10 6,16' fill='#2563eb'/>
							</svg>
						) : isPaused ? (
							<svg width={isTinyTask ? '6' : '14'} height={isTinyTask ? '6' : '14'} fill='none' viewBox='0 0 20 20'>
								<polygon points='6,4 16,10 6,16' fill='#eab308'/>
							</svg>
						) : (
							<svg width={isTinyTask ? '6' : '14'} height={isTinyTask ? '6' : '14'} fill='none' viewBox='0 0 20 20'>
								<rect x='5' y='4' width='3' height='12' rx='1' fill='#eab308'/>
								<rect x='12' y='4' width='3' height='12' rx='1' fill='#eab308'/>
							</svg>
						)}
					</button>
					<button
						onClick={handleStop}
						className={`${isTinyTask ? 'p-0' : 'p-1'} rounded-full bg-rose-100 hover:bg-rose-200 flex items-center justify-center`}
						style={isTinyTask ? { minWidth: 12, minHeight: 12, width: 12, height: 12 } : {}}
						title={t('timer.stop')}
						aria-label={t('timer.stop')}
						disabled={isDone || saving}
					>
						<svg width={isTinyTask ? '6' : '14'} height={isTinyTask ? '6' : '14'} fill='none' viewBox='0 0 20 20'>
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
					{/* Chronomètre réactivé ici uniquement en mode liste */}
					<div className='text-xs font-semibold text-gray-700 font-mono bg-gray-100 px-2 py-0.5 rounded ml-2'>
						⏱&nbsp;
						{String(Math.floor((displayedDuration || 0) / 60)).padStart(2, '0')}:{String((displayedDuration || 0) % 60).padStart(2, '0')}
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

// Exporter un mécanisme pour vider le cache si nécessaire
CalendarEventWithPlay.clearDeletedTasksCache = () => {
	deletedTasksCache.clear();
};

export default React.memo(CalendarEventWithPlay)
