import React, { useState, useEffect } from 'react'

const getWeekNumber = date => {
	const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
	const dayNum = d.getUTCDay() || 7
	d.setUTCDate(d.getUTCDate() + 4 - dayNum)
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
	return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

function CalendarSelectorModal ({ onClose, onSelect, selectedRange, selectedDate }) {
	const today = new Date()
	const [month, setMonth] = useState(selectedDate?.getMonth() ?? today.getMonth())
	const [year, setYear] = useState(selectedDate?.getFullYear() ?? today.getFullYear())
	const [range, setRange] = useState(selectedRange || 'this-week')
	const [date, setDate] = useState(selectedDate || today)

	useEffect(() => {
		setRange(selectedRange || 'this-week')
		setDate(selectedDate || today)
	}, [selectedRange, selectedDate])

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

	const handleSelectRange = rangeValue => {
		setRange(rangeValue)
		let newDate = date
		if (rangeValue === 'today') newDate = today
		else if (rangeValue === 'yesterday') {
			const yest = new Date(today)
			yest.setDate(today.getDate() - 1)
			newDate = yest
		}
		setDate(newDate)
		onSelect && onSelect(rangeValue, newDate)
	}

	const handleSelectDate = d => {
		setDate(d)
		setRange('custom')
		onSelect && onSelect('custom', d)
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-[rgba(30,41,59,0.7)]'>
			<div
				className='bg-white text-gray-900 rounded-2xl shadow-xl flex flex-col md:flex-row gap-6 min-w-[340px] max-w-lg relative'
				style={{ padding: '2rem 2.5rem', minHeight: 400, minWidth: 400 }}
			>
				<button
					onClick={onClose}
					className='absolute top-3 right-4 text-2xl text-gray-400 hover:text-rose-400'
					aria-label='Close'
				>
					&times;
				</button>
				<div className='flex flex-col gap-2 min-w-[120px]'>
					<button
						onClick={() => handleSelectRange('today')}
						className={`text-left px-3 py-2 rounded font-medium ${range === 'today' ? 'bg-blue-700 text-white' : 'hover:bg-blue-100 text-gray-700'}`}
					>
						Today
					</button>
					<button
						onClick={() => handleSelectRange('yesterday')}
						className={`text-left px-3 py-2 rounded font-medium ${range === 'yesterday' ? 'bg-blue-700 text-white' : 'hover:bg-blue-100 text-gray-700'}`}
					>
						Yesterday
					</button>
					<button
						onClick={() => handleSelectRange('this-week')}
						className={`text-left px-3 py-2 rounded font-medium ${range === 'this-week' ? 'bg-blue-700 text-white' : 'hover:bg-blue-100 text-gray-700'}`}
					>
						This week
					</button>
					<button
						onClick={() => handleSelectRange('last-week')}
						className={`text-left px-3 py-2 rounded font-medium ${range === 'last-week' ? 'bg-blue-700 text-white' : 'hover:bg-blue-100 text-gray-700'}`}
					>
						Last week
					</button>
				</div>
				<div style={{ minWidth: 240 }}>
					<div className='flex items-center justify-between mb-2'>
						<button
							onClick={() => {
								if (month === 0) {
									setMonth(11)
									setYear(y => y - 1)
								} else setMonth(m => m - 1)
							}}
							className='px-2 py-1 text-gray-400 hover:text-blue-400 text-xl'
						>
							{'<'}
						</button>
						<span className='font-semibold text-lg'>
							{new Date(year, month).toLocaleString('default', { month: 'long' })} {year}
						</span>
						<button
							onClick={() => {
								if (month === 11) {
									setMonth(0)
									setYear(y => y + 1)
								} else setMonth(m => m + 1)
							}}
							className='px-2 py-1 text-gray-400 hover:text-blue-400 text-xl'
						>
							{'>'}
						</button>
					</div>
					<div className='grid grid-cols-7 gap-1 text-xs text-center mb-1'>
						{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
							<span key={d} className='font-bold text-gray-400'>{d}</span>
						))}
						{weeks.flat().map((d, i) =>
							d ? (
								<button
									key={i}
									onClick={() => handleSelectDate(d)}
									className={`rounded-full w-8 h-8 ${
										d.toDateString() === date.toDateString()
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
					<div className='flex gap-2 mt-2'>
						<span className='text-xs text-gray-400'>
							W{getWeekNumber(date)}
						</span>
						<span className='text-xs text-gray-400'>
							{date.toLocaleDateString()}
						</span>
					</div>
				</div>
			</div>
		</div>
	)
}

export default CalendarSelectorModal
