import React, { useMemo, useEffect, useState } from 'react'
import { useGlobalTimer } from '../Timer/useGlobalTimer'
import { supabase } from '../../lib/supabase'
import { useTranslation } from '../../hooks/useTranslation'
import CalendarEventTimerButton from './CalendarEventTimerButton'

function formatDuration (seconds) {
	if (!seconds || isNaN(seconds)) return '00:00:00'
	const h = Math.floor(seconds / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	const s = seconds % 60
	return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

function TaskListView ({ tasks, onTaskUpdate }) {
	const timer = useGlobalTimer()
	const { t, i18n } = useTranslation()
	const lang = i18n.language.startsWith('en') ? 'en' : 'fr'
	const [, setTick] = useState(0)

	// Force re-render every second if a timer is running
	useEffect(() => {
		if (!timer.running) return
		const interval = setInterval(() => setTick(t => t + 1), 1000)
		return () => clearInterval(interval)
	}, [timer.running])

	const handleFinish = async (task) => {
		let elapsed = 0
		if (timer.running && timer.task?.id === task.id && timer.getElapsedSeconds) {
			elapsed = timer.getElapsedSeconds()
			timer.stop()
		}
		const newDuration = (task.duration_seconds || 0) + elapsed
		await supabase.from('tasks').update({
			duration_seconds: newDuration,
			is_finished: true,
		}).eq('id', task.id)
		onTaskUpdate && onTaskUpdate()
	}

	const handleExport = (task) => {
		const csv = `Title,Description,Duration (s),Duration (hh:mm:ss),Finished\n"${task.title}","${task.description || ''}",${task.duration_seconds},${formatDuration(task.duration_seconds)},${task.is_finished ? 'Yes' : 'No'}`
		const blob = new Blob([csv], { type: 'text/csv' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `${task.title || 'task'}.csv`
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(url)
	}

	return (
		<div className='divide-y'>
			{tasks.map(task => {
				const isRunning = timer.running && timer.task?.id === task.id
				// Correction: n'affiche le temps en cours que si le timer est actif sur CETTE tâche
				const elapsed = isRunning && timer.getElapsedSeconds ? timer.getElapsedSeconds() : 0
				const totalSeconds = (task.duration_seconds || 0) + (isRunning ? elapsed : 0)
				return (
					<div key={task.id} className='flex items-center gap-3 py-2'>
						<span className='flex-1 truncate'>{task.title}</span>
						<span className='font-mono text-2xl text-blue-700 min-w-[70px] text-center'>{formatDuration(totalSeconds)}</span>
						<CalendarEventTimerButton event={task} timer={timer} lang={lang} />
						<button
							onClick={() => handleFinish(task)}
							disabled={task.is_finished}
							className='px-2 py-1 rounded bg-green-100 hover:bg-green-200 text-xl font-medium text-green-700 cursor-pointer disabled:cursor-not-allowed'
						>
							{lang === 'fr' ? 'Terminer' : 'Finish'}
						</button>
						<button
							onClick={() => handleExport(task)}
							className='px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-xl font-medium text-gray-700 cursor-pointer'
						>
							{lang === 'fr' ? 'Exporter' : 'Export'}
						</button>
					</div>
				)
			})}
		</div>
	)
}

export default TaskListView
