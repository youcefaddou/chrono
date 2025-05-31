import React, { useMemo, useEffect, useState } from 'react'
import { useGlobalTimer } from '../Timer/useGlobalTimer'
import { useTranslation } from '../../hooks/useTranslation'
import CalendarEventTimerButton from './CalendarEventTimerButton'
import AddTaskModal from './AddTaskModal'
import TaskExporterModal, { exportTask } from '../export/TaskExporter'

function formatDuration (seconds) {
	if (!seconds || isNaN(seconds)) return '00:00:00'
	const h = Math.floor(seconds / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	const s = seconds % 60
	return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

function mapTaskFromApi (task) {
	if (!task) return task
	return {
		id: task.id || task._id,
		title: task.title,
		description: task.description,
		start: typeof task.start === 'string' || task.start instanceof Date ? task.start : (task.start ? new Date(task.start) : null),
		end: typeof task.end === 'string' || task.end instanceof Date ? task.end : (task.end ? new Date(task.end) : null),
		color: task.color || '#2563eb',
		userId: task.userId,
		isFinished: typeof task.isFinished === 'boolean' ? task.isFinished : (task.is_finished ?? false),
		is_finished: typeof task.is_finished === 'boolean' ? task.is_finished : (task.isFinished ?? false),
		durationSeconds: typeof task.durationSeconds === 'number' ? task.durationSeconds : (task.duration_seconds ?? 0),
		// Ajoute tous les autres champs éventuels
		...task,
	}
}

function TaskListView ({ tasks = [], onTaskUpdate, user, lastSavedTaskId, lastSavedDuration, refreshKey }) {
	const timer = useGlobalTimer()
	const { t, i18n } = useTranslation()
	const lang = i18n.language.startsWith('en') ? 'en' : 'fr'
	const [, setTick] = useState(0)
	const [editTask, setEditTask] = useState(null)
	const [localTaskDurations, setLocalTaskDurations] = useState({})
	const [showAddTaskModal, setShowAddTaskModal] = useState(false)
	const [showExportModal, setShowExportModal] = useState(false)
	const [taskToExport, setTaskToExport] = useState(null)
	const [taskList, setTaskList] = useState(tasks.map(mapTaskFromApi))

	// Keep local taskList in sync with tasks prop
	useEffect(() => {
		setTaskList(tasks.map(mapTaskFromApi))
	}, [tasks])

	useEffect(() => {
		if (!timer.running) return
		const interval = setInterval(() => setTick(t => t + 1), 1000)
		return () => clearInterval(interval)
	}, [timer.running])

	const handleFinish = async (task) => {
		let elapsed = 0
		if (timer.running && timer.task?.id === task.id && timer.getElapsedSeconds) {
			elapsed = timer.getElapsedSeconds()
			timer.stop()
		}
		const newDuration = (task.durationSeconds || 0) + elapsed
		try {
			const res = await fetch(`http://localhost:3001/api/tasks/${task.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					durationSeconds: newDuration,
					isFinished: true,
				}),
			})
			const contentType = res.headers.get('content-type')
			if (!res.ok || !contentType || !contentType.includes('application/json')) {
				const text = await res.text()
				console.error('Erreur lors de la mise à jour de la tâche:', text)
				alert('Erreur lors de la mise à jour de la tâche: ' + text.slice(0, 200))
				return
			}
			setLocalTaskDurations(prev => ({
				...prev,
				[task.id]: newDuration,
			}))
			onTaskUpdate && onTaskUpdate()
		} catch (err) {
			console.error('Erreur lors de la mise à jour de la tâche:', err)
		}
	}

	const handleExport = () => {
		setTaskToExport(taskList)
		setShowExportModal(true)
	}

	const handleTaskClick = (task, e) => {
		if (e.target.closest('.task-timer-buttons') || 
			e.target.closest('button') || 
			e.target.tagName === 'BUTTON' || 
			e.target.tagName === 'svg' || 
			e.target.tagName === 'SVG' ||
			e.target.tagName === 'path' ||
			e.target.tagName === 'rect' ||
			e.target.tagName === 'polygon' ||
			e.target.closest('svg')
		) {
			return;
		}
		setEditTask(task);
	}

	const handleEditSave = async (updatedTask) => {
		const id = editTask?.id || editTask?._id
		if (!id) {
			console.error('handleEditSave: missing task id')
			setEditTask(null)
			return
		}
		try {
			const res = await fetch(`http://localhost:3001/api/tasks/${id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					title: updatedTask.title,
					description: updatedTask.desc || '',
					start: updatedTask.start,
					end: updatedTask.end,
					color: updatedTask.color || '#2563eb',
				}),
			})
			const contentType = res.headers.get('content-type')
			if (!res.ok || !contentType || !contentType.includes('application/json')) {
				const text = await res.text()
				console.error('Erreur lors de la modification de la tâche:', text)
				setEditTask(null)
				onTaskUpdate && onTaskUpdate()
				return
			}
			// Mettre à jour la liste locale pour éviter la disparition de la tâche
			const updated = await res.json()
			setTaskList(prev => prev.map(t => (t.id === id || t._id === id) ? { ...t, ...updated } : t))
			setEditTask(null)
			onTaskUpdate && onTaskUpdate()
		} catch (err) {
			console.error('Erreur lors de la modification de la tâche:', err)
			setEditTask(null)
			onTaskUpdate && onTaskUpdate()
		}
	}

	const handleEditClose = () => setEditTask(null)
	const handleAddTaskOpen = () => setShowAddTaskModal(true)
	const handleAddTaskClose = () => setShowAddTaskModal(false)
	
	const handleAddTaskSave = async (newTask) => {
		try {
			const res = await fetch('http://localhost:3001/api/tasks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					title: newTask.title,
					description: newTask.desc || '',
					start: newTask.start,
					end: newTask.end,
					color: newTask.color || '#2563eb',
					durationSeconds: 0,
					isFinished: false,
				}),
			})
			const contentType = res.headers.get('content-type')
			if (!res.ok || !contentType || !contentType.includes('application/json')) {
				const text = await res.text()
				console.error('Erreur lors de l\'ajout de la tâche:', text)
				alert(lang === 'fr'
					? `Erreur lors de l'ajout de la tâche: ${text.slice(0, 200)}`
					: `Error adding task: ${text.slice(0, 200)}`)
				return
			}
			onTaskUpdate && onTaskUpdate()
			setShowAddTaskModal(false)
		} catch (err) {
			console.error('Error saving task:', err)
			alert(lang === 'fr'
				? `Erreur lors de l'ajout de la tâche: ${err.message}`
				: `Error adding task: ${err.message}`)
		}
	}

	const handleTaskTimerUpdate = (taskId, newDuration) => {
		setLocalTaskDurations(prev => ({
			...prev,
			[taskId]: newDuration
		}))
		onTaskUpdate && onTaskUpdate()
	}

	const safeUser = user || {}

	const getTaskDuration = (task) => {
		if (typeof task.durationSeconds === 'number') {
			return task.durationSeconds
		}
		return 0
	}

	return (
		<>
			{/* En-tête avec bouton d'ajout et rapport */}
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-xl font-semibold text-blue-700">
					{lang === 'fr' ? 'Liste des tâches' : 'Task List'}
				</h2>
				<div className="flex gap-2">
					{/* Ajouter un bouton Rapport global */}
					<button
						onClick={handleExport}
						disabled={taskList.length === 0}
						className={`px-4 py-2 ${taskList.length === 0 ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium rounded-md flex items-center gap-2 transition-colors`}
						aria-label={lang === 'fr' ? 'Générer un rapport' : 'Generate report'}
					>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<path d="M3 12h10M3 8h10M3 4h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
						</svg>
						<span className="hidden sm:inline">
							{lang === 'fr' ? 'Rapport' : 'Report'}
						</span>
					</button>
					
					{/* Bouton Ajouter une tâche existant */}
					<button
						onClick={handleAddTaskOpen}
						className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md flex items-center gap-2 transition-colors"
						aria-label={lang === 'fr' ? 'Ajouter une tâche' : 'Add task'}
					>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
						</svg>
						<span className="hidden sm:inline">
							{lang === 'fr' ? 'Ajouter une tâche' : 'Add task'}
						</span>
					</button>
				</div>
			</div>

			<div className='divide-y'>
				{taskList.length === 0 ? (
					<div className='py-8 text-center text-gray-400 text-lg'>
						{lang === 'fr'
							? 'Aucune tâche à afficher.'
							: 'No tasks to display.'}
					</div>
				) : (
					taskList.map(task => {
						const isRunning = timer.running && timer.task?.id === task.id
						const elapsed = isRunning && timer.getElapsedSeconds ? timer.getElapsedSeconds() : 0
						const taskDuration = getTaskDuration(task)
						const totalSeconds = isRunning ? elapsed : taskDuration

						return (
							<div
								key={task.id || task._id}
								className='flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-50 transition'
								onClick={(e) => handleTaskClick(task, e)}
								role="button"
								tabIndex={0}
								style={{ position: 'relative' }}
							>
								<span className='flex-1 truncate z-10 relative'>{task.title}</span>
								<span className='font-mono text-2xl text-blue-700 min-w-[70px] text-center z-10 relative'>
									{formatDuration(totalSeconds)}
								</span>
								<div className="task-timer-buttons z-10 relative">
									<CalendarEventTimerButton 
										event={task} 
										timer={timer} 
										lang={lang}
										disabled={task.is_finished} 
										onTaskUpdate={onTaskUpdate}
									/>
								</div>
								<div className="task-timer-buttons z-10 relative">
									<button
										onClick={e => { e.stopPropagation(); handleFinish(task) }}
										data-button="finish"
										disabled={task.is_finished}
										className={`px-2 py-1 rounded text-xl font-medium cursor-pointer disabled:cursor-not-allowed ${
											task.is_finished
												? 'bg-green-200 text-green-700'
												: 'bg-green-100 hover:bg-green-200 text-green-700'
										}`}
									>
										{task.is_finished
											? (lang === 'fr' ? 'Terminé' : 'Completed')
											: (lang === 'fr' ? 'Terminer' : 'Finish')}
									</button>
								</div>
							</div>
						)
					})
				)}
			</div>
			
			{/* Modale d'édition existante */}
			{editTask && (
				<AddTaskModal
					open={!!editTask}
					initialTitle={editTask.title}
					initialDesc={editTask.description}
					initialStart={editTask.start ? new Date(editTask.start) : new Date()}
					initialEnd={editTask.end ? new Date(editTask.end) : new Date()}
					initialColor={editTask.color}
					showDelete
					onClose={handleEditClose}
					onSave={handleEditSave}
					onDelete={async () => {
						// Si l'id est manquant, on ferme la modale et on synchronise, mais sans alert
						if (!editTask || !(editTask.id || editTask._id)) {
							setEditTask(null)
							onTaskUpdate && onTaskUpdate()
							return
						}
						try {
							const id = editTask.id || editTask._id
							const res = await fetch(`http://localhost:3001/api/tasks/${id}`, {
								method: 'DELETE',
								credentials: 'include',
							})
							if (!res.ok) {
								const text = await res.text()
								console.error('Erreur lors de la suppression:', text)
							}
						} catch (err) {
							console.error('Erreur lors de la suppression:', err)
						}
						setEditTask(null)
						// On synchronise la liste locale immédiatement sans attendre le fetch
						setTaskList(prev => prev.filter(t => (t.id || t._id) !== (editTask.id || editTask._id)))
						onTaskUpdate && onTaskUpdate()
					}}
					lang={lang}
				/>
			)}
			
			{/* Nouvelle modale d'ajout */}
			{showAddTaskModal && (
				<AddTaskModal
					open={showAddTaskModal}
					onClose={handleAddTaskClose}
					onSave={handleAddTaskSave}
					lang={lang}
				/>
			)}
			
			{/* Modal d'export avancé */}
			{showExportModal && (
				<TaskExporterModal
					isOpen={showExportModal}
					onClose={() => setShowExportModal(false)}
					tasks={taskToExport || []} // Passer toutes les tâches
					user={user}
					lang={lang}
				/>
			)}
		</>
	)
}

export default TaskListView
