import { useState, useEffect, useCallback, useMemo } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { fr, enUS } from 'date-fns/locale'
import { format, parse, startOfWeek, getDay, getISOWeek, endOfWeek } from 'date-fns'
import { useTranslation } from '../../hooks/useTranslation'
import { supabase } from '../../lib/supabase'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import CalendarSelectorModal from './CalendarSelectorModal'
import AddTaskModal from './AddTaskModal'
import { useGlobalTimer } from '../Timer/useGlobalTimer'
import CalendarEventWithPlay from './CalendarEventWithPlay'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'

const DnDCalendar = withDragAndDrop(Calendar)
const locales = { fr, en: enUS }

// Custom day names for French (no dot, capitalized)
const daysShortFr = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
// Custom day names for English (no dot, capitalized, Monday first)
const daysShortEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function CalendarGrid ({ user }) {
	const { t, i18n } = useTranslation()
	const lang = i18n.language.startsWith('en') ? 'en' : 'fr'
	const [events, setEvents] = useState([])
	const [view, setView] = useState('week')
	const [date, setDate] = useState(new Date())
	const [loading, setLoading] = useState(false)
	const [showCalendarModal, setShowCalendarModal] = useState(false)
	const [showAddTaskModal, setShowAddTaskModal] = useState(false)
	const [draftTask, setDraftTask] = useState(null)
	const [editTask, setEditTask] = useState(null)
	const [errorMessage, setErrorMessage] = useState('')
	const timer = useGlobalTimer()

	const localizer = useMemo(() =>
		dateFnsLocalizer({
			format: (date, _formatStr, _options) => {
				return format(date, _formatStr, { locale: locales[lang] })
			},
			parse,
			startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1, locale: locales[lang] }),
			getDay,
			locales,
		}), [lang]
	)

	// Custom formats for react-big-calendar
	const formats = useMemo(() => ({
		weekdayFormat: (date) => {
			const day = date.getDay()
			// Map Sunday (0) to last index for both languages
			const idx = day === 0 ? 6 : day - 1
			if (lang === 'fr') {
				return `${daysShortFr[idx]} ${date.getDate()}`
			} else {
				return `${daysShortEn[idx]} ${date.getDate()}`
			}
		},
		dayFormat: (date) => {
			const day = date.getDay()
			const idx = day === 0 ? 6 : day - 1
			if (lang === 'fr') {
				return `${daysShortFr[idx]} ${date.getDate()}`
			} else {
				return `${daysShortEn[idx]} ${date.getDate()}`
			}
		},
		dayHeaderFormat: (date) => {
			const day = date.getDay()
			const idx = day === 0 ? 6 : day - 1
			if (lang === 'fr') {
				return `${daysShortFr[idx]} ${date.getDate()}`
			} else {
				return `${daysShortEn[idx]} ${date.getDate()}`
			}
		},
	}), [lang])

	// Fetch tasks from Supabase
	const fetchTasks = useCallback(async () => {
		if (!user) return
		setLoading(true)
		const { data, error } = await supabase
			.from('tasks')
			.select('*')
			.eq('user_id', user.id)
		if (!error) {
			setEvents(data.map(task => ({
				id: task.id,
				title: task.title,
				desc: task.description,
				start: new Date(task.start),
				end: new Date(task.end),
				color: task.color || 'blue',
				is_finished: !!task.is_finished,
				duration_seconds: task.duration_seconds || 0,
			})))
		}
		setLoading(false)
	}, [user])

	useEffect(() => { fetchTasks() }, [fetchTasks])

	useEffect(() => {
		function handleTaskFinished () {
			fetchTasks()
		}
		window.addEventListener('task-finished', handleTaskFinished)
		return () => {
			window.removeEventListener('task-finished', handleTaskFinished)
		}
	}, [fetchTasks])

	const handleEventSave = async event => {
		if (!user) return
		const task = {
			title: event.title,
			description: event.desc || '',
			start: event.start,
			end: event.end,
			color: event.color || 'blue',
			user_id: user.id,
			is_finished: !!event.is_finished,
			duration_seconds: event.duration_seconds || 0,
		}
		if (event.id) {
			await supabase.from('tasks').update(task).eq('id', event.id)
		} else {
			const { data } = await supabase.from('tasks').insert([task]).select()
			if (data && data[0]) event.id = data[0].id
		}
		fetchTasks()
	}

	const handleEventDelete = async event => {
		if (!user || !event.id) return
		await supabase.from('tasks').delete().eq('id', event.id)
		fetchTasks()
	}

	const handleEventDrop = async ({ event, start, end }) => {
		await handleEventSave({ ...event, start, end })
	}

	const handleEventResize = async ({ event, start, end }) => {
		await handleEventSave({ ...event, start, end })
	}

	const handleSelectSlot = useCallback(({ start, end }) => {
		setDraftTask({ start, end })
		setShowAddTaskModal(true)
	}, [])

	const handleSaveTask = async (task, startTimer) => {
		if (!user || !user.id) {
			setErrorMessage('Utilisateur non authentifié. Veuillez vous reconnecter.')
			return
		}
		try {
			const { data, error } = await supabase
				.from('tasks')
				.insert([
					{
						title: task.title,
						description: task.desc || '',
						start: task.start,
						end: task.end,
						color: task.color || 'blue',
						user_id: user.id,
					},
				])
				.select()
			if (error) {
				setErrorMessage('Erreur lors de la création de la tâche : ' + error.message)
				return
			}
			await fetchTasks()
			setShowAddTaskModal(false)
			setDraftTask(null)
			setErrorMessage('')
			if (startTimer && timer && timer.start && data && data[0]) {
				timer.start({
					id: data[0].id,
					title: data[0].title,
					desc: data[0].description,
					start: new Date(data[0].start),
					end: new Date(data[0].end),
					color: data[0].color,
				})
			}
		} catch (err) {
			setErrorMessage('Erreur lors de la création de la tâche (exception JS) : ' + err.message)
		}
	}

	const handleSelectEvent = event => {
		setEditTask(event)
	}

	const handleUpdateTask = async (task) => {
		if (!user || !user.id) return
		try {
			const { error } = await supabase
				.from('tasks')
				.update({
					title: task.title,
					description: task.desc || '',
					start: task.start,
					end: task.end,
					color: task.color || 'blue',
					is_finished: !!task.is_finished,
					duration_seconds: task.duration_seconds || 0,
				})
				.eq('id', task.id)
			if (error) {
				setErrorMessage('Erreur lors de la modification : ' + error.message)
				return
			}
			await fetchTasks()
			setEditTask(null)
			setErrorMessage('')
		} catch (err) {
			setErrorMessage('Erreur lors de la modification (exception JS) : ' + err.message)
		}
	}

	const handleDeleteTask = async (task) => {
		if (!user || !user.id) return
		try {
			const { error } = await supabase
				.from('tasks')
				.delete()
				.eq('id', task.id)
			if (error) {
				setErrorMessage('Erreur lors de la suppression : ' + error.message)
				return
			}
			await fetchTasks()
			setEditTask(null)
			setErrorMessage('')
		} catch (err) {
			setErrorMessage('Erreur lors de la suppression (exception JS) : ' + err.message)
		}
	}

	const weekNumber = useMemo(() => getISOWeek(date), [date])

	// Format la plage de dates affichée (ex : "19 mai – 25 mai" ou "May 19 – 25")
	const weekRangeLabel = useMemo(() => {
		const start = startOfWeek(date, { weekStartsOn: 1, locale: locales[lang] })
		const end = endOfWeek(date, { weekStartsOn: 1, locale: locales[lang] })
		const formatDay = d =>
			lang === 'fr'
				? `${d.getDate()} ${d.toLocaleString('fr-FR', { month: 'long' })}`
				: `${d.toLocaleString('en-US', { month: 'short' })} ${d.getDate()}`
		return `${formatDay(start)} – ${formatDay(end)}`
	}, [date, lang])

	const messages = useMemo(() => ({
		today: t('calendar.today'),
		previous: t('calendar.prev'),
		next: t('calendar.next'),
		month: t('calendar.calendar'),
		week:
			lang === 'fr'
				? `Cette semaine - S${weekNumber}`
				: `This week - W${weekNumber}`,
		day: lang === 'fr' ? 'Jour' : 'Day',
		agenda: t('calendar.listView'),
		date: t('calendar.custom'),
		time: t('calendar.timesheet'),
		event: t('features.tasksTitle'),
		noEventsInRange: lang === 'fr'
			? 'Aucune tâche sur cette période'
			: 'No tasks in this range',
	}), [t, lang, weekNumber])

	// Navigation handlers
	const handlePrev = () => {
		const newDate =
			view === 'week'
				? new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7)
				: view === 'day'
					? new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1)
					: new Date(date.getFullYear(), date.getMonth() - 1, 1)
		setDate(newDate)
	}
	const handleNext = () => {
		const newDate =
			view === 'week'
				? new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7)
				: view === 'day'
					? new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
					: new Date(date.getFullYear(), date.getMonth() + 1, 1)
		setDate(newDate)
	}

	const handleDateLabelClick = () => setShowCalendarModal(true)
	const handleCalendarModalClose = () => setShowCalendarModal(false)
	const handleCalendarModalSelect = (_range, selectedDate) => {
		setDate(selectedDate)
		setShowCalendarModal(false)
	}

	return (
		<div className='bg-white rounded-xl shadow p-2 md:p-4'>
			<style>{`
				.rbc-time-slot {
					height: 28px !important;
				}
				.rbc-timeslot-group {
					border-bottom: 1px solid #e5e7eb !important;
				}
				.rbc-time-header-gutter, .rbc-time-gutter, .rbc-timeslot-group .rbc-label {
					min-width: 80px !important;
					max-width: 80px !important;
					width: 80px !important;
					text-align: right !important;
					padding-right: 9px !important;
					font-variant-numeric: tabular-nums;
				}
				.rbc-label {
					font-size: 14px !important;
					font-family: 'Inter', 'Roboto', 'Arial', sans-serif !important;
					letter-spacing: 0.01em;
				}
				.rbc-header {
					padding: 8px 0 !important;
					border-right: 1px solid #e5e7eb !important;
				}
				.rbc-header:last-child {
					border-right: none !important;
				}
				
				.rbc-day-bg:last-child {
					border-right: none !important;
				}
				.rbc-row-segment {
					margin-right: 0 !important;
					border-right: 1px solid #e5e7eb !important;
				}
				.rbc-row-segment:last-child {
					border-right: none !important;
					border-right: none !important;
				}
			`}</style>
			{loading && <div className='text-center text-blue-600'>{lang === 'fr' ? 'Chargement...' : 'Loading...'}</div>}
			{errorMessage && (
				<div className='mb-2 p-2 bg-red-100 text-red-700 rounded text-center text-sm font-semibold'>
					{errorMessage}
				</div>
			)}
			{/* Barre de navigation calendrier */}
			<div className='flex items-center justify-center gap-2 mb-2'>
				<button
					onClick={handlePrev}
					className='px-2 py-1 rounded hover:bg-blue-50 border border-blue-100 text-blue-700 font-semibold'
					aria-label={messages.previous}
				>
					{'<'}
				</button>
				<button
					onClick={handleDateLabelClick}
					className='font-semibold px-3 py-1 rounded hover:bg-blue-50 border border-blue-100 text-blue-700'
					aria-label={lang === 'fr' ? 'Changer la date' : 'Change date'}
				>
					{weekRangeLabel}
				</button>
				<button
					onClick={handleNext}
					className='px-2 py-1 rounded hover:bg-blue-50 border border-blue-100 text-blue-700 font-semibold'
					aria-label={messages.next}
				>
					{'>'}
				</button>
			</div>
			<DnDCalendar
				localizer={localizer}
				events={events}
				startAccessor='start'
				endAccessor='end'
				defaultView='week'
				view={view}
				onView={setView}
				date={date}
				onNavigate={setDate}
				selectable
				resizable
				onEventDrop={handleEventDrop}
				onEventResize={handleEventResize}
				onSelectSlot={handleSelectSlot}
				onSelectEvent={handleSelectEvent}
				messages={messages}
				formats={formats}
				style={{ minHeight: 600, background: '#fff' }}
				eventPropGetter={event => ({
					style: {
						backgroundColor: event.color || '#2563eb',
						color: '#fff',
						borderRadius: 8,
						border: 'none',
						paddingLeft: 8,
						paddingRight: 8,
						minHeight: 56, // Even more visible
						display: 'flex',
						alignItems: 'center',
						fontWeight: 600,
						fontSize: 16,
					},
				})}
				step={60} // 1 hour per row
				timeslots={1} 
				components={{ event: CalendarEventWithPlay }}
			/>
			{showCalendarModal && (
				<CalendarSelectorModal
					onClose={handleCalendarModalClose}
					onSelect={handleCalendarModalSelect}
					selectedRange='custom'
					selectedDate={date}
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
				onSave={handleSaveTask}
			/>
			{editTask && (
				<AddTaskModal
					open={!!editTask}
					initialStart={editTask.start}
					initialEnd={editTask.end}
					initialTitle={editTask.title}
					initialDesc={editTask.desc}
					initialColor={editTask.color}
					onClose={() => setEditTask(null)}
					onSave={task => handleUpdateTask({ ...editTask, ...task })}
					showDelete
					onDelete={() => handleDeleteTask(editTask)}
				/>
			)}
		</div>
	)
}

export default CalendarGrid
