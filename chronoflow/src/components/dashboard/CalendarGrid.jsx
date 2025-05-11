import React, { useState } from 'react'
import AddTaskModal from './AddTaskModal'

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const hours = Array.from({ length: 24 }, (_, i) =>
	String(i).padStart(2, '0') + ':00'
)

function CalendarGrid () {
	const [modalOpen, setModalOpen] = useState(false)
	const [selected, setSelected] = useState(null) // { day, startHour, endHour }
	const [dragStart, setDragStart] = useState(null)

	const handleCellMouseDown = (dayIdx, hourIdx) => {
		setDragStart({ dayIdx, hourIdx })
		setSelected({ dayIdx, startHour: hourIdx, endHour: hourIdx })
	}

	const handleCellMouseEnter = (dayIdx, hourIdx) => {
		if (dragStart) {
			const start = Math.min(dragStart.hourIdx, hourIdx)
			const end = Math.max(dragStart.hourIdx, hourIdx)
			setSelected({ dayIdx, startHour: start, endHour: end })
		}
	}

	const handleCellMouseUp = () => {
		if (selected) setModalOpen(true)
		setDragStart(null)
	}

	const handleCellClick = (dayIdx, hourIdx) => {
		setSelected({ dayIdx, startHour: hourIdx, endHour: hourIdx })
		setModalOpen(true)
	}

	const handleCloseModal = () => {
		setModalOpen(false)
		setSelected(null)
	}

	return (
		<div className='overflow-x-auto relative'>
			<table className='min-w-full border-collapse select-none'>
				<thead>
					<tr>
						<th className='w-16'></th>
						{days.map(day => (
							<th key={day} className='px-2 py-1 text-xs font-semibold text-gray-600 border-b border-gray-200'>{day}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{hours.map((hour, hourIdx) => (
						<tr key={hour}>
							<td className='text-xs text-gray-400 pr-2 py-2 border-b border-gray-100'>{hour}</td>
							{days.map((day, dayIdx) => {
								const isSelected =
									selected &&
									selected.dayIdx === dayIdx &&
									hourIdx >= selected.startHour &&
									hourIdx <= selected.endHour
								return (
									<td
										key={day}
										className={`h-8 border-b border-gray-100 cursor-pointer transition ${isSelected ? 'bg-blue-200' : ''}`}
										onMouseDown={e => {
											if (e.button === 0) handleCellMouseDown(dayIdx, hourIdx)
										}}
										onMouseEnter={() => handleCellMouseEnter(dayIdx, hourIdx)}
										onMouseUp={handleCellMouseUp}
										onClick={() => handleCellClick(dayIdx, hourIdx)}
									/>
								)
							})}
						</tr>
					))}
				</tbody>
			</table>
			{modalOpen && selected && (
				<AddTaskModal
					dayIdx={selected.dayIdx}
					startHour={selected.startHour}
					endHour={selected.endHour}
					onClose={handleCloseModal}
				/>
			)}
		</div>
	)
}

export default CalendarGrid
