import React, { useState } from 'react'
import { useGlobalTimer } from '../Timer/GlobalTimerProvider'
import { useTranslation } from '../../hooks/useTranslation'

function TaskPopover ({
	task,
	anchor,
	onClose,
	onDelete,
	onDuplicate,
	onPin,
	onStartTimer,
	onSplit,
}) {
	const [showSplit, setShowSplit] = useState(false)
	const [splitMinute, setSplitMinute] = useState(
		(task.startHour * 60 + (task.startMinute || 0)) +
		Math.floor(((task.endHour * 60 + (task.endMinute || 0)) - (task.startHour * 60 + (task.startMinute || 0))) / 2)
	)
	const {
		running,
		paused,
		task: timerTask,
		start,
		pause,
		resume,
	} = useGlobalTimer()
	const { t } = useTranslation()

	const isTaskRunning = running && timerTask?.id === task.id
	const isTaskPaused = isTaskRunning && paused

	const handleSplit = () => {
		onSplit(task, splitMinute)
		setShowSplit(false)
	}

	const handleStartPause = () => {
		if (!isTaskRunning) start(task)
		else if (isTaskPaused) resume()
		else pause()
	}

	return (
		<div
			style={{
				position: 'fixed',
				top: anchor?.getBoundingClientRect().top + 30 || 200,
				left: anchor?.getBoundingClientRect().left || 200,
				zIndex: 100,
				background: '#fff',
				borderRadius: 12,
				boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
				padding: 16,
				minWidth: 240,
				border: '1px solid #e5e7eb',
			}}
		>
			<button
				onClick={onClose}
				style={{
					position: 'absolute',
					top: 8,
					right: 12,
					fontSize: 18,
					color: '#64748b',
					background: 'none',
					border: 'none',
					cursor: 'pointer',
				}}
				aria-label='Close'
			>
				&times;
			</button>
			<div className='mb-2 font-bold text-blue-700 text-base truncate'>{task.desc || 'Task'}</div>
			{task.project && (
				<div className='mb-2 text-xs text-gray-500 truncate'>Project: <span className='font-semibold'>{task.project}</span></div>
			)}
			<div className='flex gap-2 mb-3 items-center'>
				<button
					onClick={handleStartPause}
					className={`p-1.5 rounded-full border flex items-center justify-center
						${!isTaskRunning
							? 'bg-blue-100 hover:bg-blue-200 border-blue-200'
							: isTaskPaused
								? 'bg-blue-100 hover:bg-blue-200 border-blue-200'
								: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-200'
						}`}
					aria-label={!isTaskRunning ? t('timer.start') : isTaskPaused ? t('timer.resume') : t('timer.pause')}
					style={{ width: 32, height: 32 }}
				>
					{!isTaskRunning || isTaskPaused ? (
						<svg width='18' height='18' fill='none' viewBox='0 0 20 20'>
							<polygon points='6,4 16,10 6,16' fill='#2563eb'/>
						</svg>
					) : (
						<svg width='18' height='18' fill='none' viewBox='0 0 20 20'>
							<rect x='5' y='4' width='3' height='12' rx='1' fill='#eab308'/>
							<rect x='12' y='4' width='3' height='12' rx='1' fill='#eab308'/>
						</svg>
					)}
				</button>
				<button
					onClick={() => onDuplicate(task)}
					className='px-2 py-1 rounded bg-gray-200 text-xs font-semibold shadow hover:bg-gray-300 transition'
				>
					Duplicate
				</button>
				<button
					onClick={() => setShowSplit(s => !s)}
					className='px-2 py-1 rounded bg-gray-100 text-xs font-semibold shadow hover:bg-gray-200 transition'
					style={{ minWidth: 32 }}
				>
					⋮
				</button>
			</div>
			<div className='flex items-center gap-2 mb-2'>
				{showSplit && (
					<div
						style={{
							position: 'absolute',
							top: 40,
							left: 0,
							background: '#222',
							color: '#fff',
							borderRadius: 8,
							padding: 16,
							width: 260,
							zIndex: 200,
						}}
					>
						<div className='font-semibold mb-2'>Split Time Entry</div>
						<div className='mb-2 text-xs'>Choose the split time</div>
						<input
							type='range'
							min={startTotal + 1}
							max={endTotal - 1}
							value={splitMinute}
							onChange={e => setSplitMinute(Number(e.target.value))}
							className='w-full'
						/>
						<div className='flex justify-between text-xs mt-1'>
							<span>
								{`${Math.floor(splitMinute / 60)
									.toString()
									.padStart(2, '0')}:${(splitMinute % 60)
									.toString()
									.padStart(2, '0')}`}
							</span>
							<span>
								{`${Math.floor((endTotal - splitMinute) / 60)
									.toString()
									.padStart(2, '0')}:${((endTotal - splitMinute) % 60)
									.toString()
									.padStart(2, '0')}`}
							</span>
						</div>
						<div className='flex gap-2 mt-3'>
							<button
								onClick={() => setShowSplit(false)}
								className='flex-1 px-2 py-1 rounded bg-gray-100 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition'
							>
								Cancel
							</button>
							<button
								onClick={handleSplit}
								className='flex-1 px-2 py-1 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition'
							>
								Split
							</button>
						</div>
						<div className='flex flex-col gap-2 mt-3'>
							<button
								onClick={() => {
									onPin(task)
									setShowSplit(false)
								}}
								className='text-left px-2 py-1 rounded bg-blue-100 text-xs font-semibold text-blue-700 hover:bg-blue-200 transition'
							>
								Pin as favorite
							</button>
							<button
								onClick={() => {
									onDelete(task.id)
									setShowSplit(false)
								}}
								className='text-left px-2 py-1 rounded bg-rose-100 text-xs font-semibold text-rose-700 hover:bg-rose-200 transition'
							>
								Delete
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default TaskPopover
