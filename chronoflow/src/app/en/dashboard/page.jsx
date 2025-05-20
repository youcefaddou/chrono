import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../../lib/supabase'
import i18n from '../../../lib/i18n'

function FeatureCard ({ icon, title, desc, children }) {
	return (
		<div className='bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center'>
			<div className='mb-3 text-4xl'>{icon}</div>
			<h3 className='font-bold text-lg mb-1 text-center'>{title}</h3>
			<p className='text-gray-500 text-center mb-2'>{desc}</p>
			{children}
		</div>
	)
}

export default function DashboardPage () {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)
	const navigate = useNavigate()
	const { t } = useTranslation()

	useEffect(() => {
		const getUser = async () => {
			const { data } = await supabase.auth.getUser()
			if (!data?.user) {
				navigate('/en/login')
			} else {
				setUser(data.user)
			}
			setLoading(false)
		}
		getUser()
	}, [navigate])

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-2'>
			<div className='max-w-6xl mx-auto'>
				<div className='flex flex-col md:flex-row md:justify-between md:items-center mb-8'>
					<div>
						<h1 className='text-3xl font-bold mb-1 text-gray-900 dark:text-white'>
							{t('dashboard.welcome')}{user ? `, ${user.email}` : ''}!
						</h1>
						<p className='text-gray-500'>{t('dashboard.subtitle')}</p>
					</div>
				</div>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					<FeatureCard
						icon='⏱️'
						title={t('features.timerTitle')}
						desc={t('features.timerDesc')}
					>
						<Timer />
					</FeatureCard>
					<FeatureCard
						icon='📝'
						title={t('features.tasksTitle')}
						desc={t('features.tasksDesc')}
					>
						<Tasks />
					</FeatureCard>
					<FeatureCard
						icon='📊'
						title={t('features.statsTitle')}
						desc={t('features.statsDesc')}
					>
						<Stats />
					</FeatureCard>
					<FeatureCard
						icon='📅'
						title={t('features.calendarTitle')}
						desc={t('features.calendarDesc')}
					>
						<div className='text-xs text-gray-400 mt-2'>
							{t('features.calendarDesc')}
						</div>
					</FeatureCard>
					<FeatureCard
						icon='🔒'
						title={t('features.securityTitle')}
						desc={t('features.securityDesc')}
					>
						<div className='text-xs text-gray-400 mt-2'>
							{t('features.securityDesc')}
						</div>
					</FeatureCard>
				</div>
			</div>
		</div>
	)
}

function Timer () {
	const [seconds, setSeconds] = useState(0)
	const [running, setRunning] = useState(false)

	useEffect(() => {
		let interval
		if (running) {
			interval = setInterval(() => setSeconds(s => s + 1), 1000)
		}
		return () => clearInterval(interval)
	}, [running])

	const handleStart = () => setRunning(true)
	const handleStop = () => setRunning(false)
	const handleReset = () => {
		setRunning(false)
		setSeconds(0)
	}

	return (
		<div className='flex flex-col items-center mt-2'>
			<div className='text-2xl font-mono mb-2'>
				{String(Math.floor(seconds / 60)).padStart(2, '0')}:
				{String(seconds % 60).padStart(2, '0')}
			</div>
			<div className='flex gap-2'>
				<button onClick={handleStart} className='px-2 py-1 bg-green-500 text-white rounded text-xs'>Start</button>
				<button onClick={handleStop} className='px-2 py-1 bg-rose-500 text-white rounded text-xs'>Stop</button>
				<button onClick={handleReset} className='px-2 py-1 bg-gray-400 text-white rounded text-xs'>Reset</button>
			</div>
		</div>
	)
}

function Tasks () {
	const [tasks, setTasks] = useState([])
	const [input, setInput] = useState('')

	const handleAdd = () => {
		if (input.trim()) {
			setTasks([...tasks, { text: input, done: false }])
			setInput('')
		}
	}

	const handleToggle = idx => {
		setTasks(tasks.map((t, i) => i === idx ? { ...t, done: !t.done } : t))
	}

	return (
		<div className='w-full'>
			<div className='flex gap-2 mb-2'>
				<input
					type='text'
					value={input}
					onChange={e => setInput(e.target.value)}
					className='flex-1 px-2 py-1 border rounded text-sm'
					placeholder='New task'
				/>
				<button onClick={handleAdd} className='bg-blue-500 text-white px-3 py-1 rounded text-xs'>+</button>
			</div>
			<ul className='max-h-32 overflow-y-auto'>
				{tasks.map((task, idx) => (
					<li
						key={idx}
						className={`flex items-center gap-2 text-sm ${task.done ? 'line-through text-gray-400' : ''}`}
					>
						<input type='checkbox' checked={task.done} onChange={() => handleToggle(idx)} />
						{task.text}
					</li>
				))}
			</ul>
		</div>
	)
}

function Stats () {
	const data = [
		{ label: 'Completed', value: 12, color: 'bg-green-500' },
		{ label: 'In progress', value: 3, color: 'bg-blue-500' },
		{ label: 'To do', value: 5, color: 'bg-rose-500' },
	]
	const total = data.reduce((sum, d) => sum + d.value, 0)
	return (
		<div className='w-full flex flex-col items-center'>
			<div className='flex w-full gap-1 mb-2'>
				{data.map(d => (
					<div
						key={d.label}
						className={`${d.color} h-3 rounded`}
						style={{ width: `${(d.value / total) * 100}%` }}
						title={d.label}
					/>
				))}
			</div>
			<div className='flex justify-between w-full text-xs text-gray-500'>
				{data.map(d => (
					<span key={d.label}>{d.label}: {d.value}</span>
				))}
			</div>
		</div>
	)
}
