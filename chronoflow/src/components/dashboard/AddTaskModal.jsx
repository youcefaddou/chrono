import React, { useState } from 'react'

function getWeekNumber(date) {
	const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
	const dayNum = d.getUTCDay() || 7
	d.setUTCDate(d.getUTCDate() + 4 - dayNum)
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
	return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

function MiniCalendar ({ value, onChange }) {
	const [month, setMonth] = useState(value.getMonth())
	const [year, setYear] = useState(value.getFullYear())

	const startOfMonth = new Date(year, month, 1)
	const endOfMonth = new Date(year, month + 1, 0)
	const startDay = (startOfMonth.getDay() + 6) % 7 // lundi = 0
	const daysInMonth = endOfMonth.getDate()

	const weeks = []
	let week = []
	for (let i = 0; i < startDay; i++) week.push(null)
	for (let d = 1; d <= daysInMonth; d++) {
		week.push(new Date(year, month, d))
		if (week.length === 7) {
			weeks.push(week)
			week = []
		}
	}
	if (week.length) {
		while (week.length < 7) week.push(null)
		weeks.push(week)
	}

	return (
		<div className='bg-white rounded-lg shadow p-3 mt-2'>
			{/* Affiche la semaine sélectionnée avec le numéro réel */}
			<div className="mb-2 text-center font-semibold text-blue-700">
				Cette semaine - S{getWeekNumber(value)}
			</div>
			<div className='flex justify-between items-center mb-2'>
				<button
					onClick={() => {
						if (month === 0) {
							setMonth(11)
							setYear(y => y - 1)
						} else setMonth(m => m - 1)
					}}
					className='px-2 py-1 text-gray-500 hover:text-blue-700'
				>
					{'<'}
				</button>
				<span className='font-semibold text-sm'>
					{new Date(year, month).toLocaleString('default', { month: 'long' })} {year}
				</span>
				<button
					onClick={() => {
						if (month === 11) {
							setMonth(0)
							setYear(y => y + 1)
						} else setMonth(m => m + 1)
					}}
					className='px-2 py-1 text-gray-500 hover:text-blue-700'
				>
					{'>'}
				</button>
			</div>
			<div className='grid grid-cols-7 gap-1 text-xs text-center'>
				{['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
					<span key={d} className='font-bold text-gray-400'>{d}</span>
				))}
				{weeks.flat().map((d, i) =>
					d ? (
						<button
							key={i}
							onClick={() => onChange(d)}
							className={`rounded-full w-7 h-7 ${
								d.toDateString() === value.toDateString()
									? 'bg-blue-600 text-white'
									: 'hover:bg-blue-100 text-gray-700'
							}`}
						>
							{d.getDate()}
						</button>
					) : (
						<span key={i} />
					)
				)}
			</div>
		</div>
	)
}

function AddTaskModal ({
	dayIdx,
	startHour,
	endHour,
	selectedDate,
	onDateChange,
	onClose,
	onAddTask,
}) {
	const [desc, setDesc] = useState('')
	const [project, setProject] = useState('')
	const [startTime, setStartTime] = useState(`${String(startHour).padStart(2, '0')}:00`)
	const [endTime, setEndTime] = useState(`${String(endHour).padStart(2, '0')}:00`)
	const [startTimer, setStartTimer] = useState(false)
	const [error, setError] = useState('')

	const isValidTime = time => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time)

	const handleAdd = () => {
		if (!desc.trim()) {
			setError('Description is required')
			return
		}
		if (!isValidTime(startTime) || !isValidTime(endTime)) {
			setError('Time must be in HH:mm format')
			return
		}
		const [startH, startM] = startTime.split(':').map(Number)
		const [endH, endM] = endTime.split(':').map(Number)
		const startTotal = startH * 60 + startM
		const endTotal = endH * 60 + endM
		if (endTotal <= startTotal) {
			setError('End time must be after start time')
			return
		}
		setError('')
		onAddTask({
			dayIdx,
			startHour: startH,
			endHour: endH,
			startMinute: startM,
			endMinute: endM,
			desc,
			project,
			selectedDate,
			startTimer,
		})
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center'
			style={{ background: 'rgba(30,41,59,0.7)' }}
		>
			<div className='bg-white rounded-xl shadow-lg p-6 w-full max-w-sm relative'>
				<button
					onClick={onClose}
					className='absolute top-2 right-2 text-gray-400 hover:text-rose-500 text-xl'
					aria-label='Close'
				>
					&times;
				</button>
				<h3 className='text-lg font-bold mb-4'>Add a task/project</h3>
				{error && (
					<div className='mb-2 text-red-600 text-xs'>{error}</div>
				)}
				<input
					type='text'
					placeholder='Description'
					value={desc}
					onChange={e => setDesc(e.target.value)}
					className='w-full mb-2 px-2 py-1 border rounded'
					maxLength={100}
				/>
				<input
					type='text'
					placeholder='Project (optional)'
					value={project}
					onChange={e => setProject(e.target.value)}
					className='w-full mb-2 px-2 py-1 border rounded'
					maxLength={50}
				/>
				<div className='flex gap-2 mb-2'>
					<input
						type='text'
						value={startTime}
						onChange={e => setStartTime(e.target.value)}
						className='border rounded px-2 py-1 w-20'
						placeholder='HH:mm'
						pattern='[0-2][0-9]:[0-5][0-9]'
						maxLength={5}
						aria-label='Start time'
					/>
					<span className='self-center'>→</span>
					<input
						type='text'
						value={endTime}
						onChange={e => setEndTime(e.target.value)}
						className='border rounded px-2 py-1 w-20'
						placeholder='HH:mm'
						pattern='[0-2][0-9]:[0-5][0-9]'
						maxLength={5}
						aria-label='End time'
					/>
				</div>
				<MiniCalendar value={selectedDate} onChange={onDateChange} />
				<label className='flex items-center gap-2 mb-4 mt-2'>
					<input
						type='checkbox'
						checked={startTimer}
						onChange={e => setStartTimer(e.target.checked)}
					/>
					Start timer now
				</label>
				<button
					onClick={handleAdd}
					className='w-full bg-blue-600 text-white rounded py-2 font-semibold hover:bg-blue-700'
				>
					Add
				</button>
			</div>
		</div>
	)
}

export default AddTaskModal
