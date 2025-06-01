import React, { useState, useMemo, useCallback } from 'react'
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
import useMergedEvents from './useMergedEvents'

function FullCalendarGrid ({ user, refreshKey, lastSavedTaskId, lastSavedDuration }) {
	const { t, i18n } = useTranslation()
	const lang = i18n.language.startsWith('en') ? 'en' : 'fr'
	const [selectedEvent, setSelectedEvent] = useState(null)
	const [showAddTaskModal, setShowAddTaskModal] = useState(false)
	const [showEditTaskModal, setShowEditTaskModal] = useState(false)
	const [draftTask, setDraftTask] = useState(null)
	const [errorMessage, setErrorMessage] = useState('')
	const [viewMode, setViewMode] = useState('calendar')
	const timer = useGlobalTimer()

	const { events: mergedEvents, loading: eventsLoading, error: eventsError, refetch: refetchEvents } = useMergedEvents()

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

	// Handle event click (edit)
	const handleEventClick = useCallback((info) => {
		const target = info.jsEvent?.target
		if (
			target?.closest('.task-timer-buttons') ||
			target?.dataset?.timerButton === 'true' ||
			target?.parentElement?.dataset?.timerButton === 'true'
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
		if (String(event.id).startsWith('gcal-')) {
			// Déplacement local d'un événement Google
			const eventId = String(event.id).replace(/^gcal-/, '')
			try {
				await fetch(`http://localhost:3001/api/integrations/google-calendar/event-times/${eventId}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include',
					body: JSON.stringify({
						start: event.start,
						end: event.end,
					}),
				})
				refetchEvents()
			} catch (err) {
				setErrorMessage('Erreur lors du déplacement local de l’événement Google')
			}
			return
		}
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
			refetchEvents()
		} catch (err) {
			setErrorMessage(getErrorMessage('update'))
		}
	}, [refetchEvents, getErrorMessage])

	// Handle event remove
	const handleEventRemove = useCallback(async (eventId) => {
		if (String(eventId).startsWith('gcal-')) {
			// Suppression locale d'un événement Google
			const pureId = String(eventId).replace(/^gcal-/, '')
			try {
				await fetch(`http://localhost:3001/api/integrations/google-calendar/event-times/${pureId}`, {
					method: 'DELETE',
					credentials: 'include',
				})
				refetchEvents()
			} catch (err) {
				setErrorMessage('Erreur lors de la suppression locale de l’événement Google')
			}
			return
		}
		try {
			await fetch(`http://localhost:3001/api/tasks/${eventId}`, {
				method: 'DELETE',
				credentials: 'include',
			})
			refetchEvents()
		} catch (err) {
			setErrorMessage(getErrorMessage('delete'))
		}
	}, [refetchEvents, getErrorMessage])

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
			refetchEvents()
		} catch (error) {
			setErrorMessage(getErrorMessage('create'))
		}
	}

	const handleEditTaskSave = async (task) => {
		if (!selectedEvent) return
		if (String(selectedEvent.id).startsWith('gcal-')) {
			console.error('Tentative d’appel de la route locale avec un id Google, opération annulée')
			return
		}
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
			refetchEvents()
		} catch (error) {
			setErrorMessage(getErrorMessage('update'))
		}
	}

	const handleEditTaskDelete = async () => {
		if (!selectedEvent) return
		if (String(selectedEvent.id).startsWith('gcal-')) {
			// Suppression locale d'un événement Google depuis la modale
			const pureId = String(selectedEvent.id).replace(/^gcal-/, '')
			try {
				await fetch(`http://localhost:3001/api/integrations/google-calendar/event-times/${pureId}`, {
					method: 'DELETE',
					credentials: 'include',
				})
				setShowEditTaskModal(false)
				setSelectedEvent(null)
				refetchEvents()
			} catch (error) {
				setErrorMessage('Erreur lors de la suppression locale de l’événement Google')
			}
			return
		}
		try {
			await fetch(`http://localhost:3001/api/tasks/${selectedEvent.id}`, {
				method: 'DELETE',
				credentials: 'include',
			})
			setShowEditTaskModal(false)
			setSelectedEvent(null)
			refetchEvents()
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

	function mapGoogleEventForCalendar (event) {
		// Use the already-prefixed id from mergedEvents (should be 'gcal-...')
		return {
			id: event.id, // already 'gcal-...'
			title: event.title || event.summary || '(Google event)',
			start: event.start ? new Date(event.start) : null,
			end: event.end ? new Date(event.end) : null,
			backgroundColor: '#34a853',
			borderColor: '#34a853',
			allDay: false,
			editable: true, // rendre éditable
			classNames: ['google-calendar-event'],
			extendedProps: {
				...event,
				id: event.id, // keep as is
				title: event.title || event.summary || '(Google event)',
				isGoogle: true,
				durationSeconds: typeof event.durationSeconds === 'number' ? event.durationSeconds : 0,
				is_finished: !!event.is_finished,
				isFinished: !!event.isFinished,
			},
		}
	}

	const handleImportGoogleEvents = async () => {
		try {
			const res = await fetch('http://localhost:3001/api/integrations/google-calendar/import', {
				method: 'POST',
				credentials: 'include',
			})
			if (!res.ok) {
				const data = await res.json()
				setErrorMessage(data.error || 'Erreur lors de l\'import Google')
				return
			}
			refetchEvents()
		} catch (err) {
			setErrorMessage('Erreur lors de l\'import Google')
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
				<button
					className='px-3 py-1 rounded bg-green-600 text-white cursor-pointer'
					onClick={handleImportGoogleEvents}
				>
					{lang === 'fr' ? 'Importer Google' : 'Import Google'}
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
					events={mergedEvents.map(e => e.isGoogle ? mapGoogleEventForCalendar(e) : mapTaskForCalendar(e))}
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
						const eventId = String(arg.event.id)
						// Find the merged event object by id for timer sync
						const mergedEventObj = mergedEvents.find(e => String(e.id) === eventId) || eventProps
						const eventForTimer = {
							...mergedEventObj,
							id: eventId,
							title: arg.event.title,
							durationSeconds: typeof eventProps.durationSeconds === 'number' ? eventProps.durationSeconds : 0,
							isGoogle: !!eventProps.isGoogle,
							is_finished: !!eventProps.is_finished,
							isFinished: !!eventProps.isFinished,
						}
						return (
							<div className='flex items-center gap-2'>
								<span className='truncate'>{arg.event.title}</span>
								{arg.event.classNames?.includes('google-calendar-event') && (
									<span className='ml-1 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold'>Google</span>
								)}
								<CalendarEventTimerButton
									event={eventForTimer}
									timer={timer}
									lang={lang}
									disabled={eventForTimer.is_finished}
									onTaskUpdate={refetchEvents}
								/>
							</div>
						)
					}}
				/>
			) : (
				<TaskListView
					tasks={mergedEvents}
					onTaskUpdate={refetchEvents}
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
