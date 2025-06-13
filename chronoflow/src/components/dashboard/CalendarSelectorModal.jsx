import React, { useState, useEffect } from 'react'
import { useTranslation } from '../../hooks/useTranslation'

const getWeekNumber = date => {
	const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
	const dayNum = d.getUTCDay() || 7
	d.setUTCDate(d.getUTCDate() + 4 - dayNum)
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
	return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

function CalendarSelectorModal ({ onClose, onSelect, selectedRange, selectedDate }) {
	const { i18n } = useTranslation()
	const lang = i18n.language.startsWith('en') ? 'en' : 'fr'
	const today = new Date()
	const [month, setMonth] = useState(selectedDate?.getMonth() ?? today.getMonth())
	const [year, setYear] = useState(selectedDate?.getFullYear() ?? today.getFullYear())
	const [date, setDate] = useState(selectedDate || today)

	useEffect(() => {
		setDate(selectedDate || today)
	}, [selectedDate])

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

	const handleSelectDate = d => {
		setDate(d)
		onSelect && onSelect('custom', d)
	}

	const monthLabel = new Date(year, month).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'long' })
	const daysShort = lang === 'fr'
		? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
		: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
			<div className='bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative animate-fade-in'>
				<button
					className='absolute top-2 right-2 text-gray-500 hover:text-rose-600 text-2xl font-bold'
					onClick={onClose}
					aria-label='Fermer'
				>
					&times;
				</button>
				<div className='flex flex-col items-center'>
					<div>
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
								{monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)} {year}
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
							{daysShort.map(d => (
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
								{lang === 'fr' ? `S${getWeekNumber(date)}` : `W${getWeekNumber(date)}`}
							</span>
							<span className='text-xs text-gray-400'>
								{date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US')}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default CalendarSelectorModal
