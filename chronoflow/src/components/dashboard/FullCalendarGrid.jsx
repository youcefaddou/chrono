import React, { useEffect, useState, useMemo, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'

import { useTranslation } from '../../hooks/useTranslation'
import { useGlobalTimer } from '../Timer/useGlobalTimer'
import AddTaskModal from './AddTaskModal'
import CalendarEventTimerButton from './CalendarEventTimerButton'
import TaskListView from './TaskListView'

function FullCalendarGrid ({ user, refreshKey, lastSavedTaskId, lastSavedDuration }) {
	const { t, i18n } = useTranslation()
	const lang = i18n.language.startsWith('en') ? 'en' : 'fr'
	const [events, setEvents] = useState([])
	const [selectedEvent, setSelectedEvent] = useState(null)
	const [showAddTaskModal, setShowAddTaskModal] = useState(false)
	const [showEditTaskModal, setShowEditTaskModal] = useState(false)
	const [draftTask, setDraftTask] = useState(null)
	const [errorMessage, setErrorMessage] = useState('')
	const [viewMode, setViewMode] = useState('calendar')
	const timer = useGlobalTimer()

	// Error messages with i18n
	const getErrorMessage = useCallback((key) => {
		const messages = {
			fetch: {
				fr: 'Erreur lors du chargement des tâches',
				en: 'Error loading tasks',
			},
			create: {
				fr: 'Erreur lors de la création de la tâche',
				en: 'Error creating task',
			},
			update: {
				fr: 'Erreur lors de la modification de la tâche',
				en: 'Error updating task',
			},
			delete: {
				fr: 'Erreur lors de la suppression de la tâche',
				en: 'Error deleting task',
			},
		}
		return messages[key]?.[lang] || messages[key]?.fr
	}, [lang])

	// Fetch tasks from MongoDB API and map to FullCalendar format
	const fetchTasks = useCallback(async () => {
		try {
			const res = await fetch('http://localhost:3001/api/tasks', { credentials: 'include' })
			if (!res.ok) throw new Error('Erreur lors du chargement des tâches')
			const data = await res.json()
			const mappedEvents = data.map(mapTaskForCalendar)
			setEvents(mappedEvents)
		} catch (err) {
			setErrorMessage(getErrorMessage('fetch'))
		}
	}, [getErrorMessage])

	useEffect(() => {
		async function fetchAndMapTasks () {
			const res = await fetch('http://localhost:3001/api/tasks', { credentials: 'include' })
			const data = await res.json()
			const mappedEvents = data.map(mapTaskForCalendar)
			setEvents(mappedEvents)
		}
		fetchAndMapTasks()
	}, [refreshKey])

	// Handle event click (edit)
	const handleEventClick = useCallback((info) => {
		// Empêche l'ouverture de la modale d'édition si clic sur un bouton du timer
		const target = info.jsEvent?.target
		if (
			target?.closest('.task-timer-buttons') ||
			target?.tagName === 'BUTTON' ||
			target?.closest('button')
		) {
			return
		}
		setSelectedEvent(info.event)
		setShowEditTaskModal(true)
	}, [])

	// Handle date selection (add)
	const handleDateSelect = useCallback((selectInfo) => {
		setDraftTask({ start: selectInfo.start, end: selectInfo.end })
		setShowAddTaskModal(true)
	}, [])

	// Handle event drop/resize
	const handleEventDrop = useCallback(async (changeInfo) => {
		const { event } = changeInfo
		try {
			await fetch(`http://localhost:3001/api/tasks/${event.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					start: event.start,
					end: event.end,
				}),
			})
			fetchTasks()
		} catch (err) {
			setErrorMessage(getErrorMessage('update'))
		}
	}, [fetchTasks, getErrorMessage])

	// Handle event remove
	const handleEventRemove = useCallback(async (eventId) => {
		try {
			await fetch(`http://localhost:3001/api/tasks/${eventId}`, {
				method: 'DELETE',
				credentials: 'include',
			})
			fetchTasks()
		} catch (err) {
			setErrorMessage(getErrorMessage('delete'))
		}
	}, [fetchTasks, getErrorMessage])

	

	// Handle add/edit task modal save
	const handleAddTaskSave = async (task) => {
		try {
			const res = await fetch('http://localhost:3001/api/tasks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					title: task.title,
					description: task.desc || '',
					start: task.start,
					end: task.end,
					color: task.color || '#2563eb',
					durationSeconds: task.duration_seconds || 0,
					isFinished: false,
				}),
			})
			const contentType = res.headers.get('content-type')
			if (!res.ok || !contentType || !contentType.includes('application/json')) {
				const text = await res.text()
				setErrorMessage(getErrorMessage('create') + ': ' + text.slice(0, 200))
				return
			}
			setShowAddTaskModal(false)
			setDraftTask(null)
			fetchTasks()
		} catch (error) {
			setErrorMessage(getErrorMessage('create'))
		}
	}

	const handleEditTaskSave = async (task) => {
		if (!selectedEvent) return
		try {
			const res = await fetch(`http://localhost:3001/api/tasks/${selectedEvent.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					title: task.title,
					description: task.desc || '',
					start: task.start,
					end: task.end,
					color: task.color || '#2563eb',
				}),
			})
			const contentType = res.headers.get('content-type')
			if (!res.ok || !contentType || !contentType.includes('application/json')) {
				const text = await res.text()
				setErrorMessage(getErrorMessage('update') + ': ' + text.slice(0, 200))
				return
			}
			setShowEditTaskModal(false)
			setSelectedEvent(null)
			fetchTasks()
		} catch (error) {
			setErrorMessage(getErrorMessage('update'))
		}
	}

	const handleEditTaskDelete = async () => {
		if (!selectedEvent) return
		try {
			await fetch(`http://localhost:3001/api/tasks/${selectedEvent.id}`, {
				method: 'DELETE',
				credentials: 'include',
			})
			setShowEditTaskModal(false)
			setSelectedEvent(null)
			fetchTasks()
		} catch (error) {
			setErrorMessage(getErrorMessage('delete'))
		}
	}

	const handleStartTimerForTask = event => {
		if (timer.running && !timer.paused) return
		timer.start({ taskId: event.id })
	}

	// Traductions pour les labels du header FullCalendar
	const calendarButtonText = useMemo(() => ({
		today: lang === 'fr' ? 'Aujourd\'hui' : 'Today',
		month: lang === 'fr' ? 'Mois' : 'Month',
		week: lang === 'fr' ? 'Semaine' : 'Week',
		day: lang === 'fr' ? 'Jour' : 'Day',
		list: lang === 'fr' ? 'Liste' : 'List',
	}), [lang])

	function mapTaskForCalendar (task) {
		if (!task) return task
		return {
			id: task.id || task._id,
			title: task.title,
			start: typeof task.start === 'string' || task.start instanceof Date ? task.start : (task.start ? new Date(task.start) : null),
			end: typeof task.end === 'string' || task.end instanceof Date ? task.end : (task.end ? new Date(task.end) : null),
			backgroundColor: task.color || '#2563eb',
			borderColor: task.color || '#2563eb',
			allDay: false,
			extendedProps: {
				...task,
				id: task.id || task._id,
				durationSeconds: typeof task.durationSeconds === 'number' ? task.durationSeconds : (task.duration_seconds ?? 0),
				isFinished: typeof task.isFinished === 'boolean' ? task.isFinished : (task.is_finished ?? false),
				is_finished: typeof task.is_finished === 'boolean' ? task.is_finished : (task.isFinished ?? false),
			},
		}
	}

	return (
		<div className='bg-white rounded-xl shadow p-2 md:p-4'>
			<div className='flex gap-2 mb-4'>
				<button
					className={`px-3 py-1 rounded ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'} cursor-pointer`}
					onClick={() => setViewMode('calendar')}
				>
					{lang === 'fr' ? 'Calendrier' : 'Calendar'}
				</button>
				<button
					className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'} cursor-pointer`}
					onClick={() => setViewMode('list')}
				>
					{lang === 'fr' ? 'Liste' : 'List'}
				</button>
			</div>
			{viewMode === 'calendar' ? (
				<FullCalendar
					plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
					initialView='timeGridWeek'
					headerToolbar={{
						left: 'prev,next today',
						center: 'title',
						right: 'dayGridMonth,timeGridWeek,timeGridDay'
					}}
					locale={lang}
					buttonText={calendarButtonText}
					events={events}
					selectable
					editable
					select={handleDateSelect}
					eventClick={handleEventClick}
					eventDrop={handleEventDrop}
					eventResize={handleEventDrop}
					dayMaxEvents={true}
					height='auto'
					eventContent={arg => {
						const eventProps = arg.event.extendedProps || {}
						return (
							<div className='flex items-center gap-2'>
								<span className='truncate'>{arg.event.title}</span>
								<CalendarEventTimerButton
									event={{
										...eventProps,
										id: arg.event.id,
										title: arg.event.title,
										durationSeconds: eventProps.durationSeconds ?? 0,
									}}
									timer={timer}
									lang={lang}
									disabled={eventProps.is_finished}
									onTaskUpdate={fetchTasks}
								/>
							</div>
						)
					}}
				/>
			) : (
				<TaskListView
					tasks={events.map(e => e.extendedProps ? { ...e.extendedProps, id: e.id } : e)}
					onTaskUpdate={fetchTasks}
					user={user}
					lastSavedTaskId={lastSavedTaskId}
					lastSavedDuration={lastSavedDuration}
				/>
			)}
			<AddTaskModal
				open={showAddTaskModal}
				initialStart={draftTask?.start}
				initialEnd={draftTask?.end}
				onClose={() => {
					setShowAddTaskModal(false)
					setDraftTask(null)
					setErrorMessage('')
				}}
				onSave={handleAddTaskSave}
				lang={lang}
			/>
			<AddTaskModal
				open={showEditTaskModal}
				initialStart={selectedEvent?.start}
				initialEnd={selectedEvent?.end}
				initialTitle={selectedEvent?.title}
				initialDesc={selectedEvent?.extendedProps?.description}
				initialColor={selectedEvent?.backgroundColor}
				showDelete
				onClose={() => {
					setShowEditTaskModal(false)
					setSelectedEvent(null)
					setErrorMessage('')
				}}
				onSave={handleEditTaskSave}
				onDelete={handleEditTaskDelete}
				lang={lang}
			/>
			{errorMessage && (
				<div className='mb-2 p-2 bg-red-100 text-red-700 rounded text-center text-sm font-semibold'>
					{errorMessage}
				</div>
			)}
		</div>
	)
}

export default FullCalendarGrid
