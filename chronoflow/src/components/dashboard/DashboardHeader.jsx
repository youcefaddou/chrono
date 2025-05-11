import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import FocusZoneModal from './FocusZoneModal'

function DashboardHeader () {
	const { t } = useTranslation()
	const [running, setRunning] = useState(false)
	const [paused, setPaused] = useState(false)
	const [seconds, setSeconds] = useState(0)
	const [showZone, setShowZone] = useState(false)
	const intervalRef = useRef(null)

	// Timer effect
	useEffect(() => {
		if (running && !paused) {
			intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
		} else {
			clearInterval(intervalRef.current)
		}
		return () => clearInterval(intervalRef.current)
	}, [running, paused])

	const handleStartPause = () => {
		if (!running) {
			setRunning(true)
			setPaused(false)
		} else {
			setPaused(p => !p)
		}
	}
	const handleStop = () => {
		setRunning(false)
		setPaused(false)
		setSeconds(0)
	}
	const handleZone = () => setShowZone(true)
	const handleAdd = () => alert('Add task/project')
	const handleCloseZone = () => setShowZone(false)

	return (
		<>
			<header className='flex flex-col md:flex-row md:items-center md:justify-between px-6 py-4 border-b border-gray-200 bg-white'>
				<div className='flex items-center gap-4 mb-2 md:mb-0'>
					{/* Timer numérique */}
					<span className='font-mono text-lg text-blue-700 w-20 text-center'>
						{String(Math.floor(seconds / 60)).padStart(2, '0')}:
						{String(seconds % 60).padStart(2, '0')}
					</span>
					{/* Start/Pause bouton SVG */}
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
							// Play icon
							<svg width='20' height='20' fill='none' viewBox='0 0 20 20'>
								<polygon points='6,4 16,10 6,16' fill='#2563eb'/>
							</svg>
						) : (
							// Pause icon
							<svg width='20' height='20' fill='none' viewBox='0 0 20 20'>
								<rect x='5' y='4' width='3' height='12' rx='1' fill='#eab308'/>
								<rect x='12' y='4' width='3' height='12' rx='1' fill='#eab308'/>
							</svg>
						)}
					</button>
					{/* Stop bouton SVG */}
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
					{/* Get in the zone bouton SVG */}
					<button
						onClick={handleZone}
						className='p-2 rounded-full bg-rose-100 hover:bg-rose-200 border border-rose-200 flex items-center'
						aria-label='Get in the zone'
					>
						<svg width='20' height='20' fill='none' viewBox='0 0 20 20'>
							<circle cx='10' cy='10' r='8' stroke='#e11d48' strokeWidth='2'/>
							<circle cx='10' cy='10' r='3' fill='#e11d48'/>
						</svg>
					</button>
					{/* Add task/project bouton SVG */}
					<button
						onClick={handleAdd}
						className='p-2 rounded-full bg-blue-100 hover:bg-blue-200 border border-blue-200 flex items-center'
						aria-label='Add task/project'
					>
						<svg width='20' height='20' fill='none' viewBox='0 0 20 20'>
							<rect x='9' y='4' width='2' height='12' rx='1' fill='#2563eb'/>
							<rect x='4' y='9' width='12' height='2' rx='1' fill='#2563eb'/>
						</svg>
					</button>
					<span className='mx-4 hidden md:inline-block border-l h-6 border-gray-200' />
					<div className='flex items-center gap-2'>
						<button className='px-2 py-1 rounded hover:bg-gray-100'>&lt;</button>
						<span className='font-medium'>This week - W19</span>
						<button className='px-2 py-1 rounded hover:bg-gray-100'>&gt;</button>
					</div>
				</div>
				<div className='flex items-center gap-2'>
					<button className='px-3 py-1 rounded bg-blue-100 text-blue-700 font-medium'>Calendar</button>
					<button className='px-3 py-1 rounded hover:bg-gray-100'>List view</button>
					<button className='px-3 py-1 rounded hover:bg-gray-100'>Timesheet</button>
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
				/>
			)}
		</>
	)
}

export default DashboardHeader
