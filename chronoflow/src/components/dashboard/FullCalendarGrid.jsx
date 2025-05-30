import React, { useEffect, useState, useMemo, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import { api } from '../../lib/api'
import { useTranslation } from '../../hooks/useTranslation'
import { useGlobalTimer } from '../Timer/useGlobalTimer'
import AddTaskModal from './AddTaskModal'
import CalendarEventTimerButton from './CalendarEventTimerButton'
import TaskListView from './TaskListView'

function FullCalendarGrid ({ user, refreshKey }) {
	const { t, i18n } = useTranslation()
	const lang = i18n.language.startsWith('en') ? 'en' : 'fr'
	const [events, setEvents] = useState([])
	const [selectedEvent, setSelectedEvent] = useState(null)
	const [showAddTaskModal, setShowAddTaskModal] = useState(false)
	const [showEditTaskModal, setShowEditTaskModal] = useState(false)
	const [draftTask, setDraftTask] = useState(null)
	const [errorMessage, setErrorMessage] = useState('')
	const [viewMode, setViewMode] = useState('calendar') // 'calendar' or 'list'
	const timer = useGlobalTimer()

	// Fetch tasks from Supabase and map to FullCalendar format
	const fetchTasks = useCallback(async () => {
		if (!user) return
		try {
			const data = await api.getTasks()
			const mappedEvents = data.map(task => ({
				id: task._id || task.id,
				title: task.title,
				start: task.start ? new Date(task.start) : null,
				end: task.end ? new Date(task.end) : null,
				backgroundColor: task.color || '#2563eb',
				borderColor: task.color || '#2563eb',
				allDay: false,
				extendedProps: { ...task },
			}))
			setEvents(mappedEvents)
		} catch (err) {
			setEvents([])
		}
	}, [user])

	useEffect(() => { fetchTasks() }, [user, fetchTasks, refreshKey])

	// Handle event click (edit)
	const handleEventClick = useCallback((info) => {
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
		await api.updateTask(event.id, {
			start: event.start,
			end: event.end,
		})
		fetchTasks()
	}, [fetchTasks])

	// Handle event remove
	const handleEventRemove = useCallback(async (eventId) => {
		await api.deleteTask(eventId)
		fetchTasks()
	}, [fetchTasks])

	// Error messages with i18n
	const getErrorMessage = (key) => {
		const messages = {
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
	}

	// Handle add/edit task modal save
	const handleAddTaskSave = async (task) => {
		if (!user) return
		try {
			await api.createTask({
				title: task.title,
				description: task.desc || '',
				start: task.start,
				end: task.end,
				color: task.color || '#2563eb',
				user_id: user.id,
				is_finished: false,
				duration_seconds: 0,
			})
			setShowAddTaskModal(false)
			setDraftTask(null)
			fetchTasks()
		} catch (error) {
			setErrorMessage(getErrorMessage('create'))
		}
	}

	const handleEditTaskSave = async (task) => {
		if (!user || !selectedEvent) return
		try {
			await api.updateTask(selectedEvent.id, {
				title: task.title,
				description: task.desc || '',
				start: task.start,
				end: task.end,
				color: task.color || '#2563eb',
			})
			setShowEditTaskModal(false)
			setSelectedEvent(null)
			fetchTasks()
		} catch (error) {
			setErrorMessage(getErrorMessage('update'))
		}
	}

	const handleEditTaskDelete = async () => {
		if (!user || !selectedEvent) return
		try {
			await api.deleteTask(selectedEvent.id)
			setShowEditTaskModal(false)
			setSelectedEvent(null)
			fetchTasks()
		} catch (error) {
			setErrorMessage(getErrorMessage('delete'))
		}
	}

	const handleStartTimerForTask = event => {
		if (!user) return
		if (timer.running && !timer.paused) return // Ne pas relancer si déjà en cours
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
						right: 'dayGridMonth,timeGridWeek,timeGridDay' // 'listWeek' retiré
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
					eventContent={arg => (
						<div className='flex items-center gap-2'>
							<span className='truncate'>{arg.event.title}</span>
							<CalendarEventTimerButton event={arg.event} timer={timer} lang={lang} />
						</div>
					)}
				/>
			) : (
				<TaskListView tasks={events.map(e => e.extendedProps ? { ...e.extendedProps, id: e.id } : e)} onTaskUpdate={fetchTasks} />
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
