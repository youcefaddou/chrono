import React, { useMemo, useEffect, useState } from 'react'
import { useGlobalTimer } from '../Timer/useGlobalTimer'
import { supabase } from '../../lib/supabase'
import { useTranslation } from '../../hooks/useTranslation'
import CalendarEventTimerButton from './CalendarEventTimerButton'
import AddTaskModal from './AddTaskModal' // Ajout de la modale d'édition
import TaskExporterModal, { exportTask } from '../export/TaskExporter'

function formatDuration (seconds) {
	if (!seconds || isNaN(seconds)) return '00:00:00'
	const h = Math.floor(seconds / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	const s = seconds % 60
	return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

function TaskListView ({ tasks, onTaskUpdate, user }) {  // Ajout du prop user
	const timer = useGlobalTimer()
	const { t, i18n } = useTranslation()
	const lang = i18n.language.startsWith('en') ? 'en' : 'fr'
	const [, setTick] = useState(0)
	const [editTask, setEditTask] = useState(null) // Pour la modale d'édition
	const [localTaskDurations, setLocalTaskDurations] = useState({})
	const [showAddTaskModal, setShowAddTaskModal] = useState(false) // Pour la modale d'ajout
	const [showExportModal, setShowExportModal] = useState(false)
	const [taskToExport, setTaskToExport] = useState(null)
	
	// Force re-render every second if a timer is running
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
		const newDuration = (task.duration_seconds || 0) + elapsed
		await supabase.from('tasks').update({
			duration_seconds: newDuration,
			is_finished: true,
		}).eq('id', task.id)
		onTaskUpdate && onTaskUpdate()
	}

	// Modification: utiliser toutes les tâches pour l'export plutôt qu'une seule
	const handleExport = () => {
		setTaskToExport(tasks) // Passer toutes les tâches, pas juste une
		setShowExportModal(true)
	}

	// Amélioration de la détection des clics sur les éléments interactifs
	const handleTaskClick = (task, e) => {
		// Utiliser closest pour détecter les clics dans n'importe quel élément de bouton/conteneur
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
			// Ne pas ouvrir la modale si l'élément est interactif
			return;
		}
		
		// Si on arrive ici, c'est qu'on a cliqué sur la zone de texte de la tâche
		setEditTask(task);
	}

	const handleEditSave = async (updatedTask) => {
		await supabase.from('tasks').update({
			title: updatedTask.title,
			description: updatedTask.desc || '',
			start: updatedTask.start,
			end: updatedTask.end,
			color: updatedTask.color || '#2563eb',
		}).eq('id', editTask.id)
		setEditTask(null)
		onTaskUpdate && onTaskUpdate()
	}

	const handleEditClose = () => setEditTask(null)
	const handleAddTaskOpen = () => setShowAddTaskModal(true)
	const handleAddTaskClose = () => setShowAddTaskModal(false)
	
	const handleAddTaskSave = async (newTask) => {
		try {
			// Vérifier si un utilisateur est connecté
			const { data: { user: authUser } } = await supabase.auth.getUser()
			
			if (!authUser) {
				alert(lang === 'fr' 
					? 'Vous devez être connecté pour ajouter une tâche' 
					: 'You must be logged in to add a task')
				return
			}
			
			const { error } = await supabase.from('tasks').insert([{
				title: newTask.title,
				description: newTask.desc || '',
				start: newTask.start,
				end: newTask.end,
				color: newTask.color || '#2563eb',
				user_id: authUser.id,  // Utiliser l'ID de l'utilisateur authentifié
				duration_seconds: 0,
				is_finished: false
			}])
			
			if (error) {
				console.error('Error adding task:', error)
				alert(lang === 'fr' 
					? `Erreur lors de l'ajout de la tâche: ${error.message}` 
					: `Error adding task: ${error.message}`)
			} else {
				onTaskUpdate && onTaskUpdate()
				setShowAddTaskModal(false)
			}
		} catch (err) {
			console.error('Error saving task:', err)
			alert(lang === 'fr' 
				? `Erreur lors de l'ajout de la tâche: ${err.message}` 
				: `Error adding task: ${err.message}`)
		}
	}

	// Cette fonction sera appelée quand un timer est arrêté pour mettre à jour localement la durée
	const handleTaskTimerUpdate = (taskId, newDuration) => {
		setLocalTaskDurations(prev => ({
			...prev,
			[taskId]: newDuration
		}))
		
		// Déclencher également le refresh général des tâches
		onTaskUpdate && onTaskUpdate()
	}

	// S'assurer que l'utilisateur est toujours un objet
	const safeUser = user || {}

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
						disabled={tasks.length === 0}
						className={`px-4 py-2 ${tasks.length === 0 ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium rounded-md flex items-center gap-2 transition-colors`}
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
				{tasks.length === 0 ? (
					<div className='py-8 text-center text-gray-400 text-lg'>
						{lang === 'fr'
							? 'Aucune tâche à afficher.'
							: 'No tasks to display.'}
					</div>
				) : (
					tasks.map(task => {
						const isRunning = timer.running && timer.task?.id === task.id
						const elapsed = isRunning && timer.getElapsedSeconds ? timer.getElapsedSeconds() : 0
						
						// Utiliser la durée locale si disponible, sinon utiliser celle de la tâche
						const taskDuration = localTaskDurations[task.id] !== undefined 
							? localTaskDurations[task.id]
							: task.duration_seconds || 0
							
						const totalSeconds = taskDuration + (isRunning ? elapsed : 0)
						
						return (
							<div
								key={task.id}
								className='flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-50 transition'
								onClick={(e) => handleTaskClick(task, e)}
								role="button"
								tabIndex={0}
								style={{ position: 'relative' }}
							>
								{/* Span non-interactif pour le titre */}
								<span className='flex-1 truncate z-10 relative'>{task.title}</span>
								<span className='font-mono text-2xl text-blue-700 min-w-[70px] text-center z-10 relative'>{formatDuration(totalSeconds)}</span>
								
								{/* Wrapper pour tous les boutons avec classe spécifique */}
								<div className="task-timer-buttons z-10 relative">
									<CalendarEventTimerButton 
										event={task} 
										timer={timer} 
										lang={lang}
										disabled={task.is_finished} 
										onTaskUpdate={handleTaskTimerUpdate}
									/>
								</div>
								
								{/* Bouton terminer */}
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
						await supabase.from('tasks').delete().eq('id', editTask.id)
						setEditTask(null)
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
