import React, { useState } from 'react'
import styled from '@emotion/styled'
import AddTaskModal from './AddTaskModal'
import TaskPopover from './TaskPopover'
import TimerStartedModal from './TimerStartedModal'
import { useGlobalTimer } from '../Timer/GlobalTimerProvider'

// Utilitaire pour obtenir la date du jour de la semaine courante (lundi = 0)
function getDateOfWeek(dayIdx) {
	const now = new Date()
	const first = now.getDate() - now.getDay() + 1 + dayIdx
	const d = new Date(now.setDate(first))
	d.setHours(0, 0, 0, 0)
	return d
}

function getWeekDates (date) {
	const d = new Date(date)
	const day = d.getDay() || 7
	const monday = new Date(d)
	monday.setDate(d.getDate() - day + 1)
	return Array.from({ length: 7 }, (_, i) => {
		const dt = new Date(monday)
		dt.setDate(monday.getDate() + i)
		return dt
	})
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const hours = Array.from({ length: 24 }, (_, i) =>
	String(i).padStart(2, '0') + ':00'
)
const QUARTERS = [0, 15, 30, 45]

function CalendarGrid ({
	selectedRange = 'this-week',
	selectedDate = new Date(),
	onExternalDateChange,
}) {
	const [modalOpen, setModalOpen] = useState(false)
	const [selected, setSelected] = useState(null) // { dayIdx, hourIdx, quarterIdx, endHourIdx, endQuarterIdx }
	const [dragStart, setDragStart] = useState(null)
	const [tasks, setTasks] = useState([])
	const [popoverTask, setPopoverTask] = useState(null)
	const [popoverAnchor, setPopoverAnchor] = useState(null)
	const [favorites, setFavorites] = useState([])
	const [shouldOpenModal, setShouldOpenModal] = useState(false)
	const [timerModalOpen, setTimerModalOpen] = useState(false)
	const { start } = useGlobalTimer()
	const [internalSelectedDate, setInternalSelectedDate] = useState(selectedDate)
	const [internalSelectedRange, setInternalSelectedRange] = useState(selectedRange)

	// Synchronise avec le parent si la date change de l'extérieur
	React.useEffect(() => {
		setInternalSelectedDate(selectedDate)
		setInternalSelectedRange(selectedRange)
	}, [selectedDate, selectedRange])

	// Calcule la date de chaque colonne affichée
	let daysToShow = days
	let dayIndices = [0,1,2,3,4,5,6]
	let highlightDayIdx = null
	let daysDates = []

	if (internalSelectedRange === 'today' || internalSelectedRange === 'yesterday' || internalSelectedRange === 'custom') {
		const d = internalSelectedDate
		const idx = d.getDay() === 0 ? 6 : d.getDay() - 1
		daysToShow = [days[idx]]
		dayIndices = [idx]
		highlightDayIdx = idx
		daysDates = [d]
	} else if (internalSelectedRange === 'this-week' || internalSelectedRange === 'last-week') {
		const refDate = new Date(internalSelectedDate)
		if (internalSelectedRange === 'last-week') refDate.setDate(refDate.getDate() - 7)
		const weekDates = getWeekDates(refDate)
		dayIndices = weekDates.map(d => d.getDay() === 0 ? 6 : d.getDay() - 1)
		daysToShow = dayIndices.map(i => days[i])
		daysDates = weekDates
	}

	const handleDateChange = date => {
		setInternalSelectedDate(date)
		setInternalSelectedRange('custom')
		if (onExternalDateChange) {
			onExternalDateChange(date)
		}
	}

	const handleCellMouseDown = (dayIdx, hourIdx, quarterIdx) => {
		setDragStart({ dayIdx, hourIdx, quarterIdx })
		setSelected({ dayIdx, hourIdx, quarterIdx, endHourIdx: hourIdx, endQuarterIdx: quarterIdx })
	}

	const handleCellMouseEnter = (dayIdx, hourIdx, quarterIdx) => {
		if (dragStart && dragStart.dayIdx === dayIdx) {
			const startIndex = dragStart.hourIdx * 4 + dragStart.quarterIdx
			const endIndex = hourIdx * 4 + quarterIdx
			const min = Math.min(startIndex, endIndex)
			const max = Math.max(startIndex, endIndex)
			setSelected({
				dayIdx,
				hourIdx: Math.floor(min / 4),
				quarterIdx: min % 4,
				endHourIdx: Math.floor(max / 4),
				endQuarterIdx: max % 4,
			})
		}
	}

	const handleCellMouseUp = () => {
		// Ouvre la modale d'ajout seulement si aucune popover n'est ouverte
		if (selected && !popoverTask) setModalOpen(true)
		setDragStart(null)
	}

	const handleCellClick = (dayIdx, hourIdx, quarterIdx) => {
		// Si une popover est ouverte, ne rien faire
		if (popoverTask) return
		const today = getDateOfWeek(dayIdx)
		setSelected({ dayIdx, hourIdx, quarterIdx, endHourIdx: hourIdx, endQuarterIdx: quarterIdx })
		setModalOpen(true)
	}

	const handleTaskClick = (task, event) => {
		event.stopPropagation()
		setPopoverTask(task)
		setPopoverAnchor(event.currentTarget)
		setModalOpen(false) // Ferme la modale d'ajout si elle était ouverte
	}

	const handleCloseModal = () => {
		setModalOpen(false)
		setSelected(null)
	}

	const handleClosePopover = () => {
		setPopoverTask(null)
		setPopoverAnchor(null)
	}

	const handleAddTask = task => {
		setTasks([...tasks, task])
		setModalOpen(false)
		setSelected(null)
	}

	const handleDeleteTask = taskId => {
		setTasks(tasks.filter(t => t.id !== taskId))
		handleClosePopover()
	}

	const handleDuplicateTask = task => {
		const newTask = { ...task, id: Date.now() }
		setTasks([...tasks, newTask])
		handleClosePopover()
	}

	const handlePinFavorite = task => {
		if (!favorites.find(f => f.id === task.id)) {
			setFavorites([...favorites, task])
		}
		handleClosePopover()
	}

	const handleStartTimer = task => {
		start(task)
		setTimerModalOpen(true)
		handleClosePopover()
	}

	const handleCloseTimerModal = () => {
		setTimerModalOpen(false)
	}

	const handleSplitTask = (task, splitMinute) => {
		const startTotal = task.startHour * 60 + (task.startMinute || 0)
		const endTotal = task.endHour * 60 + (task.endMinute || 0)
		const splitTotal = splitMinute

		if (splitTotal <= startTotal || splitTotal >= endTotal) return

		const first = {
			...task,
			id: Date.now(),
			endHour: Math.floor(splitTotal / 60),
			endMinute: splitTotal % 60,
		}
		const second = {
			...task,
			id: Date.now() + 1,
			startHour: Math.floor(splitTotal / 60),
			startMinute: splitTotal % 60,
		}
		setTasks(tasks =>
			tasks
				.filter(t => t.id !== task.id)
				.concat([first, second])
		)
		handleClosePopover()
	}

	const isCellSelected = (dayIdx, hourIdx, quarterIdx) => {
		if (!selected || selected.dayIdx !== dayIdx) return false
		const start = selected.hourIdx * 4 + selected.quarterIdx
		const end = selected.endHourIdx * 4 + selected.endQuarterIdx
		const idx = hourIdx * 4 + quarterIdx
		return idx >= Math.min(start, end) && idx <= Math.max(start, end)
	}

	const getTaskForCell = (dayIdx, hourIdx, quarterIdx) => {
		return tasks.find(t => {
			const start = t.startHour * 4 + Math.floor((t.startMinute || 0) / 15)
			const end = t.endHour * 4 + Math.floor((t.endMinute || 0) / 15)
			const idx = hourIdx * 4 + quarterIdx
			return (
				t.dayIdx === dayIdx &&
				idx >= Math.min(start, end) &&
				idx <= Math.max(start, end)
				)
		})
	}

	return (
		<CalendarWrapper>
			<CalendarTable>
				<thead>
					<tr>
						<CalendarTh style={{ width: 60 }} />
						{daysToShow.map((day, i) => (
							<CalendarTh key={day}>
								<div className='flex flex-col items-center'>
									<span className='text-base font-semibold text-gray-500'>{day}</span>
									{daysDates[i] && (
											<span
												className='text-2xl font-bold text-blue-700 leading-none'
												style={{ minWidth: 28, textAlign: 'center', display: 'inline-block' }}
											>
												{String(daysDates[i].getDate()).padStart(2, '0')}
											</span>
									)}
								</div>
							</CalendarTh>
						))}
					</tr>
				</thead>
				<tbody>
					{hours.map((hour, hourIdx) => (
						hourIdx === 0 ? null : (
						<tr key={hour}>
							<HourCell>{hour}</HourCell>
							{dayIndices.map((dayIdx, colIdx) => (
								<CalendarTd key={days[dayIdx]}>
									<div className='flex flex-col h-full'>
										{QUARTERS.map((q, quarterIdx) => {
											const isSelected = isCellSelected(dayIdx, hourIdx, quarterIdx)
											const task = getTaskForCell(dayIdx, hourIdx, quarterIdx)
											return (
												<div
													key={q}
													style={{
														flex: 1,
														borderBottom: quarterIdx < 3 ? '1px solid #e5e7eb' : 'none',
														background: isSelected
															? '#dbeafe'
															: task
																? '#f0f9ff'
																: highlightDayIdx === dayIdx
																	? '#f1f5f9'
																	: 'transparent',
														cursor: 'pointer',
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'flex-start',
														paddingLeft: 4,
														position: 'relative',
													}}
													onMouseDown={e => {
														if (e.button === 0) handleCellMouseDown(dayIdx, hourIdx, quarterIdx)
													}}
													onMouseEnter={() => handleCellMouseEnter(dayIdx, hourIdx, quarterIdx)}
													onMouseUp={handleCellMouseUp}
													onClick={e => {
														if (task) {
															handleTaskClick(task, e)
														} else if (!popoverTask) {
															handleCellClick(dayIdx, hourIdx, quarterIdx)
														}
													}}
												>
													{task && quarterIdx === Math.floor((task.startMinute || 0) / 15) && (
														<div className='truncate text-xs font-semibold text-blue-700 bg-blue-100 rounded px-1 py-0.5'>
															{task.desc || 'Task'}
															{task.project && (
																<span className='ml-1 text-gray-400'>[{task.project}]</span>
															)}
														</div>
													)}
												</div>
											)
										})}
									</div>
								</CalendarTd>
							))}
						</tr>
						)
					))}
				</tbody>
			</CalendarTable>
			{modalOpen && selected && !popoverTask && (
				<AddTaskModal
					dayIdx={selected.dayIdx}
					startHour={selected.hourIdx}
					startQuarter={selected.quarterIdx}
					endHour={selected.endHourIdx}
					endQuarter={selected.endQuarterIdx}
					selectedDate={internalSelectedDate}
					onDateChange={handleDateChange}
					onClose={handleCloseModal}
					onAddTask={task => {
						task.id = Date.now()
						handleAddTask(task)
					}}
				/>
			)}
			{popoverTask && (
				<TaskPopover
					task={popoverTask}
					anchor={popoverAnchor}
					onClose={handleClosePopover}
					onDelete={handleDeleteTask}
					onDuplicate={handleDuplicateTask}
					onPin={handlePinFavorite}
					onStartTimer={handleStartTimer}
					onSplit={handleSplitTask}
				/>
			)}
			{timerModalOpen && (
				<TimerStartedModal
					onClose={handleCloseTimerModal}
					task={null}
					seconds={0}
					running={false}
					paused={false}
					onStartPause={() => {}}
					onStop={() => {}}
				/>
			)}
		</CalendarWrapper>
	)
}

// Ajoute une bordure externe grise à la grille
const CalendarWrapper = styled.div`
	overflow-x: auto;
	position: relative;
	background: #f8fafc;
	border-radius: 1rem;
	box-shadow: 0 2px 8px rgba(59,130,246,0.08);
	border: 2px solid #e5e7eb;
`

const CalendarTable = styled.table`
	min-width: 100%;
	border-collapse: collapse;
	user-select: none;
`

const CalendarTh = styled.th`
	padding: 0.5rem 0.25rem;
	font-size: 0.75rem;
	font-weight: 600;
	color: #64748b;
	border-bottom: 1px solid #e5e7eb;
	background: #f1f5f9;
`

const CalendarTd = styled.td`
	height: 3.5rem;
	min-height: 3.5rem;
	border: 1px solid #475569; // gray-600
	cursor: pointer;
	transition: background 0.15s;
	background: ${({ selected, hasTask }) =>
		selected ? '#dbeafe'
			: hasTask ? '#f0f9ff'
				: 'transparent'};
	vertical-align: middle;
	padding: 0;
	&:hover {
		background: #e0e7ef;
	}
`

const HourCell = styled.td`
	font-size: 1rem;
	color: #64748b;
	padding-right: 0.5rem;
	padding-top: 0.5rem;
	padding-bottom: 0.5rem;
	border: 1px solid #475569; // gray-600
	background: #f8fafc;
	text-align: right;
	min-width: 3.5rem;
`

export default CalendarGrid
