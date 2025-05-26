import { useState, useEffect, useMemo } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { fr, enUS } from 'date-fns/locale'
import { format, parse, startOfWeek, getDay, getISOWeek, endOfWeek } from 'date-fns'
import { useTranslation } from '../../hooks/useTranslation'
import { supabase } from '../../lib/supabase'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import CalendarSelectorModal from './CalendarSelectorModal'
import AddTaskModal from './AddTaskModal'
import { useGlobalTimer } from '../Timer/useGlobalTimer'
import CalendarEventWithPlayPositioned from './CalendarEventWithPlayPositioned'
import CalendarEventWithPlay from './CalendarEventWithPlay'
import { calculateAllEventPositions } from './utils/collision-detection'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import './CalendarGrid.css'

const DnDCalendar = withDragAndDrop(Calendar)
const locales = { fr, en: enUS }

const daysShortFr = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const daysShortEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function CalendarGrid ({ user }) {
	const { t, i18n } = useTranslation()
	const lang = i18n.language.startsWith('en') ? 'en' : 'fr'
	const [events, setEvents] = useState([])
	const [view, setView] = useState('week')
	const [date, setDate] = useState(new Date())
	const [isGlobalLoading, setIsGlobalLoading] = useState(false)
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

	const formats = useMemo(() => ({
		weekdayFormat: (date) => {
			const day = date.getDay()
			const idx = day === 0 ? 6 : day - 1
			return lang === 'fr'
				? `${daysShortFr[idx]} ${date.getDate()}`
				: `${daysShortEn[idx]} ${date.getDate()}`
		},
		dayFormat: (date) => {
			const day = date.getDay()
			const idx = day === 0 ? 6 : day - 1
			return lang === 'fr'
				? `${daysShortFr[idx]} ${date.getDate()}`
				: `${daysShortEn[idx]} ${date.getDate()}`
		},
		dayHeaderFormat: (date) => {
			const day = date.getDay()
			const idx = day === 0 ? 6 : day - 1
			return lang === 'fr'
				? `${daysShortFr[idx]} ${date.getDate()}`
				: `${daysShortEn[idx]} ${date.getDate()}`
		},
		timeGutterFormat: (date, culture, localizer) => {
			return localizer.format(date, 'HH:mm', culture)
		},
	}), [lang])

	async function fetchTasks () {
		if (!user) return
		setIsGlobalLoading(true)
		const { data, error } = await supabase
			.from('tasks')
			.select('*')
			.eq('user_id', user.id)
		if (!error) {
			const mappedEvents = data.map(task => ({
				id: task.id,
				title: task.title,
				desc: task.description,
				start: task.start ? new Date(task.start) : null,
				end: task.end ? new Date(task.end) : null,
				color: task.color || 'blue',
				is_finished: !!task.is_finished,
				duration_seconds: task.duration_seconds || 0,
			}))

			const positions = calculateAllEventPositions(mappedEvents)
			const eventsWithCollisionData = mappedEvents.map(event => ({
				...event,
				collisionData: positions[event.id] || { width: 100, left: 0 },
			}))
			setEvents(eventsWithCollisionData)
		}
		setIsGlobalLoading(false)
	}

	useEffect(() => {
		fetchTasks()
	}, [user, date])

	useEffect(() => {
		function handleTaskFinished () {
			fetchTasks()
		}
		window.addEventListener('task-finished', handleTaskFinished)
		return () => {
			window.removeEventListener('task-finished', handleTaskFinished)
		}
	}, [user, date])

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

	const handleSelectSlot = ({ start, end }) => {
		setDraftTask({ start, end })
		setShowAddTaskModal(true)
	}

	const weekNumber = useMemo(() => getISOWeek(date), [date])

	const weekRangeLabel = useMemo(() => {
		const start = startOfWeek(date, { weekStartsOn: 1, locale: locales[lang] })
		const end = endOfWeek(date, { weekStartsOn: 1, locale: locales[lang] })
		const formatDay = d => lang === 'fr'
			? `${d.getDate()} ${d.toLocaleString('fr-FR', { month: 'long' })}`
			: `${d.toLocaleString('en-US', { month: 'short' })} ${d.getDate()}`
		return `${formatDay(start)} – ${formatDay(end)}`
	}, [date, lang])

	const messages = useMemo(() => ({
		today: t('calendar.today'),
		previous: t('calendar.prev'),
		next: t('calendar.next'),
		month: t('calendar.calendar'),
		week: lang === 'fr'
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

	// Ajout d'une fonction pour gérer l'édition d'une tâche
	const handleEventEdit = (event) => {
		setEditTask(event);
	};

	return (
		<div className='bg-white rounded-xl shadow p-2 md:p-4'>
			{isGlobalLoading && (
				<div className='text-center text-blue-600'>
					{lang === 'fr' ? 'Chargement...' : 'Loading...'}
				</div>
			)}
			{errorMessage && (
				<div className='mb-2 p-2 bg-red-100 text-red-700 rounded text-center text-sm font-semibold'>
					{errorMessage}
				</div>
			)}
			{/* Barre de navigation calendrier */}
			<div className='flex items-center justify-center gap-2 mb-2'>
				<button
					onClick={() => setDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7))}
					className='px-2 py-1 rounded hover:bg-blue-50 border border-blue-100 text-blue-700 font-semibold'
					aria-label={messages.previous}
				>
					{'<'}
				</button>
				<button
					onClick={() => setShowCalendarModal(true)}
					className='font-semibold px-3 py-1 rounded hover:bg-blue-50 border border-blue-100 text-blue-700'
					aria-label={lang === 'fr' ? 'Changer la date' : 'Change date'}
				>
					{weekRangeLabel}
				</button>
				<button
					onClick={() => setDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7))}
					className='px-2 py-1 rounded hover:bg-blue-50 border border-blue-100 text-blue-700 font-semibold'
					aria-label={messages.next}
				>
					{'>'}
				</button>
			</div>
			<DnDCalendar
				localizer={localizer}
				events={events}
				startAccessor={event => event?.start ? new Date(event.start) : null}
				endAccessor={event => event?.end ? new Date(event.end) : null}
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
				messages={messages}
				formats={formats}
				style={{ minHeight: '100%', height: 'calc(100vh - 250px)', background: '#fff' }}
				eventPropGetter={event => ({
					style: {
						backgroundColor: event?.color || '#2563eb',
						color: '#fff',
						borderRadius: 6,
						border: 'none',
						padding: 0,
						display: 'flex',
						alignItems: 'stretch',
						fontWeight: 500,
						fontSize: 13,
						lineHeight: '1.2',
						boxSizing: 'border-box',
						width: '100%',
						margin: 0,
					},
				})}
				step={60}
				timeslots={1}
				min={new Date(2024, 0, 1, 0, 0, 0)}
				max={new Date(2024, 0, 1, 23, 59, 59)}
				components={{
					event: props => (
						<CalendarEventWithPlayPositioned
							{...props}
							isListMode={false}
							onEdit={handleEventEdit}
						/>
					),
					agenda: {
						date: ({ event, label, day, resource }) => {
							// Force l'affichage de la date pour chaque événement dans l'agenda
							// en désactivant le regroupement implicite de react-big-calendar
							
							let dateDisplay = '';
							
							try {
								if (event?.start) {
									const eventDate = new Date(event.start);
									dateDisplay = eventDate.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
										weekday: 'short',
										day: '2-digit',
										month: 'short',
										year: 'numeric'
									});
								} else if (label) {
									dateDisplay = label;
								} else if (day) {
									const dayDate = new Date(day);
									dateDisplay = dayDate.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US');
								} else {
									dateDisplay = "—";
								}
							} catch (e) {
								console.error("Error formatting date:", e);
								dateDisplay = "—";
							}
							
							return (
								<div className='rbc-agenda-date-cell font-bold text-black'>
									{dateDisplay}
								</div>
							);
						},
						time: ({ event, label, value }) => {
						
							
							// label contient souvent le texte formaté de l'heure dans la vue agenda
							return (
								<div className='rbc-agenda-time-cell'>
									{label || (event?.start && event?.end ? 
										`${new Date(event.start).toLocaleTimeString('fr-FR', {
											hour: '2-digit',
											minute: '2-digit',
										})} - ${new Date(event.end).toLocaleTimeString('fr-FR', {
											hour: '2-digit',
											minute: '2-digit',
										})}` : '')}
								</div>
							);
						},
						event: ({ event }) => {
							// Un dernier console.log pour vérifier cet objet
							console.log("AGENDA EVENT PROPS:", { event });
							return (
								<CalendarEventWithPlay
									event={{
										...event,
										onEdit: handleEventEdit // Passer la fonction d'édition
									}}
									isListMode={true}
								/>
							);
						},
					},
				}}
				length={7} // Afficher 7 jours à la fois
			/>
			{showCalendarModal && (
				<CalendarSelectorModal
					onClose={() => setShowCalendarModal(false)}
					onSelect={(_range, selectedDate) => setDate(selectedDate)}
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
				onSave={handleEventSave}
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
					onSave={task => handleEventSave({ ...editTask, ...task })}
					showDelete
					onDelete={() => handleEventDelete(editTask)}
				/>
			)}
		</div>
	)
}

export default CalendarGrid
