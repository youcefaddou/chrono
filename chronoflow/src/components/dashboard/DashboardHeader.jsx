import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGlobalTimer } from '../Timer/useGlobalTimer'
import FocusZoneModal from './FocusZoneModal'
import CalendarSelectorModal from './CalendarSelectorModal'
import CalendarGrid from './CalendarGrid'
import SaveTimerModal from './SaveTimerModal'
import { supabase } from '../../lib/supabase'
import flagFr from '../../assets/france.png'
import flagEn from '../../assets/eng.png'
import styles from './DashboardHeader.module.css'

function getWeekNumber (date) {
	const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
	const dayNum = d.getUTCDay() || 7
	d.setUTCDate(d.getUTCDate() + 4 - dayNum)
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
	return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

function getMondayOfWeek (date) {
	const d = new Date(date)
	const day = d.getDay() || 7
	d.setDate(d.getDate() - day + 1)
	d.setHours(0, 0, 0, 0)
	return d
}

function DashboardHeader ({ user, sidebarCollapsed, setSidebarCollapsed }) {
	const { t, i18n } = useTranslation()
	const { seconds, running, paused, start, pause, resume, stop } = useGlobalTimer()
	const [showZone, setShowZone] = useState(false)
	const [showCalendar, setShowCalendar] = useState(false)
	const [showSaveTimer, setShowSaveTimer] = useState(false)
	const [elapsedSecondsToSave, setElapsedSecondsToSave] = useState(0)
	const [selectedDate, setSelectedDate] = useState(getMondayOfWeek(new Date()))
	const [selectedRange, setSelectedRange] = useState('this-week')
	const [externalDate, setExternalDate] = useState(null) // Pour synchronisation externe

	const weekNumber = getWeekNumber(selectedDate)
	const year = selectedDate.getFullYear()
	const currentFlag = i18n.language.startsWith("en") ? flagEn : flagFr
	const nextLang = i18n.language.startsWith("en") ? "fr" : "en"
	const handleLangSwitch = () => i18n.changeLanguage(nextLang)
	const handleStartPause = () => {
		if (!running) start()
		else if (paused) resume()
		else pause()
	}
		const handleStop = () => {
		if (seconds > 0) {
			// Capturer le temps écoulé AVANT d'appeler stop()
			setElapsedSecondsToSave(seconds)
			stop()
			setShowSaveTimer(true)
		} else {
			stop()
		}
	}
	const handleSaveTimer = async (taskData) => {
		if (!user || !user.id) {
			alert('Utilisateur non authentifié')
			return
		}

		try {
			const { data, error } = await supabase
				.from('tasks')
				.insert([
					{
						title: taskData.title,
						description: taskData.desc || '',
						start: taskData.start.toISOString(),
						end: taskData.end.toISOString(),
						color: taskData.color || '#2563eb',
						user_id: user.id,
						duration_seconds: taskData.duration_seconds || 0,
						is_finished: true
					}
				])
				.select()

			if (error) {
				console.error('Erreur lors de l\'enregistrement:', error)
				alert('Erreur lors de l\'enregistrement: ' + error.message)
				return
			}			setShowSaveTimer(false)
			setElapsedSecondsToSave(0) // Remettre à zéro le temps sauvegardé
			// Optionnel: rafraîchir le calendrier si nécessaire
			// window.location.reload()
		} catch (err) {
			console.error('Erreur lors de l\'enregistrement (exception):', err)
			alert('Erreur lors de l\'enregistrement: ' + err.message)
		}
	}
	const handleZone = () => setShowZone(true)
	const handleCloseZone = () => setShowZone(false)
	const handleOpenCalendar = () => setShowCalendar(true)
	const handleCloseCalendar = () => setShowCalendar(false)

	const handleSelectCalendar = (range, date) => {
		setSelectedRange(range)
		setSelectedDate(getMondayOfWeek(date))
		setShowCalendar(false)
	}

	const handlePrevWeek = () => {
		const prev = new Date(selectedDate)
		prev.setDate(prev.getDate() - 7)
		setSelectedDate(getMondayOfWeek(prev))
		setSelectedRange('this-week')
	}
	const handleNextWeek = () => {
		const next = new Date(selectedDate)
		next.setDate(next.getDate() + 7)
		const maxWeek = getWeekNumber(new Date(selectedDate.getFullYear(), 11, 28))
		const nextWeek = getWeekNumber(next)
		if (nextWeek <= maxWeek) {
			setSelectedDate(getMondayOfWeek(next))
			setSelectedRange('this-week')
		}
	}

	// Permet à CalendarGrid de changer la semaine affichée depuis l'extérieur
	const handleExternalDateChange = date => {
		setSelectedRange('this-week')
		setSelectedDate(getMondayOfWeek(date))
		setExternalDate(date)
	}

	return (
		<>
			<header className='flex flex-col md:flex-row md:items-center md:justify-between px-6 py-4 border-b border-gray-200 bg-white'>
				<div className='flex items-center gap-4 mb-2 md:mb-0'>
					<button
						onClick={() => setSidebarCollapsed(v => !v)}
						className='p-2 rounded-full hover:bg-gray-200 focus:outline-none md:hidden'
						aria-label={sidebarCollapsed ? 'Open menu' : 'Close menu'}
					>
						<svg width='24' height='24' fill='none' viewBox='0 0 24 24'>
							<rect y='4' width='24' height='2' rx='1' fill='currentColor'/>
							<rect y='11' width='24' height='2' rx='1' fill='currentColor'/>
							<rect y='18' width='24' height='2' rx='1' fill='currentColor'/>
						</svg>
					</button>					<span className='font-mono text-3xl text-blue-700 w-24 text-center'>
						{String(Math.floor(seconds / 60)).padStart(2, '0')}:
						{String(seconds % 60).padStart(2, '0')}
					</span>
					<button
						onClick={handleStartPause}
						className={`p-2 rounded-full border flex items-center ${
							!running
								? 'bg-blue-100 hover:bg-blue-200 border-blue-200'
								: paused
									? 'bg-blue-100 hover:bg-blue-200 border-blue-200'
									: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-200'
						}`}
						aria-label={!running ? 'Start timer' : paused ? 'Resume timer' : 'Pause timer'}
					>
						{!running || paused ? (
							<svg width='20' height='20' fill='none' viewBox='0 0 20 20'>
								<polygon points='6,4 16,10 6,16' fill='#2563eb'/>
							</svg>
						) : (
							<svg width='20' height='20' fill='none' viewBox='0 0 20 20'>
								<rect x='5' y='4' width='3' height='12' rx='1' fill='#eab308'/>
								<rect x='12' y='4' width='3' height='12' rx='1' fill='#eab308'/>
							</svg>
						)}
					</button>
					<button
						onClick={handleStop}
						disabled={!running && seconds === 0}
						className={`p-2 rounded-full border flex items-center ${running || seconds > 0 ? 'bg-rose-100 hover:bg-rose-200 border-rose-200' : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'}`}
						aria-label='Stop timer'
					>
						<svg width='20' height='20' fill='none' viewBox='0 0 20 20'>
							<rect x='5' y='5' width='10' height='10' rx='2' fill='#e11d48'/>
						</svg>
					</button>
					<button
						onClick={handleZone}
						className='relative p-2 rounded-full bg-rose-100 hover:bg-rose-200 border border-rose-200 flex items-center group'
						aria-label='Get in the zone'
					>
						<svg width='20' height='20' fill='none' viewBox='0 0 20 20'>
							<circle cx='10' cy='10' r='8' stroke='#e11d48' strokeWidth='2'/>
							<circle cx='10' cy='10' r='3' fill='#e11d48'/>
						</svg>
						<span className='absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity duration-200'>
							{ i18n.language.startsWith('fr')
								? 'Active le mode focus : le timer démarre et toutes les distractions sont masquées.'
								: 'Enable focus mode: timer starts and all distractions are hidden.' }
						</span>					</button>
				</div>
			</header>
			{showZone && (
				<FocusZoneModal
					seconds={seconds}
					running={running}
					isPaused={paused}
					onStartPause={handleStartPause}
					onStop={handleStop}
					onClose={handleCloseZone}
				/>			)}
			{showCalendar && (
				<CalendarSelectorModal
					onClose={handleCloseCalendar}
					onSelect={handleSelectCalendar}
					selectedRange={selectedRange}
					selectedDate={selectedDate}
				/>
			)}			{showSaveTimer && (
				<SaveTimerModal
					open={showSaveTimer}
					elapsedSeconds={elapsedSecondsToSave}
					onClose={() => {
						setShowSaveTimer(false)
						setElapsedSecondsToSave(0)
					}}
					onSave={handleSaveTimer}
				/>
			)}
			<div className={styles.dashboardMain}>
				<div className={styles.calendarPanel}>
					<CalendarGrid
						user={user}
						selectedRange={selectedRange}
						selectedDate={selectedDate}
						onExternalDateChange={handleExternalDateChange}
					/>
				</div>
			</div>
		</>
	)
}

export default DashboardHeader
