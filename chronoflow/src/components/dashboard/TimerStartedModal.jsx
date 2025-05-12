import React, { useEffect } from 'react'

function TimerStartedModal ({ onClose, task, seconds, running, paused, onStartPause, onStop }) {
	useEffect(() => {
		const timeout = setTimeout(() => {
			onClose && onClose()
		}, 3000)
		return () => clearTimeout(timeout)
	}, [onClose])

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40'>
			<div className='bg-white rounded-xl shadow-lg p-6 w-full max-w-xs relative flex flex-col items-center'>
				<button
					onClick={onClose}
					className='absolute top-2 right-2 text-gray-400 hover:text-rose-500 text-xl'
					aria-label='Close'
				>
					&times;
				</button>
				<div className='text-blue-700 font-bold text-lg mb-2'>
					Timer started!
				</div>
				{task && (
					<div className='mb-2 text-center'>
						<div className='font-semibold text-blue-600'>{task.desc || 'Task'}</div>
						{task.project && (
							<div className='text-xs text-gray-500'>Project: {task.project}</div>
						)}
					</div>
				)}
				<div className='text-3xl font-mono text-blue-700 mb-2'>
					{String(Math.floor((seconds || 0) / 60)).padStart(2, '0')}:
					{String((seconds || 0) % 60).padStart(2, '0')}
				</div>
				<div className='flex gap-2 mt-2'>
					<button
						onClick={onStartPause}
						className={`px-3 py-1 rounded-full text-sm font-semibold ${
							paused
								? 'bg-blue-600 text-white hover:bg-blue-700'
								: 'bg-yellow-100 text-blue-700 hover:bg-yellow-200'
						}`}
					>
						{paused ? 'Resume' : 'Pause'}
					</button>
					<button
						onClick={onStop}
						className='px-3 py-1 rounded-full text-sm font-semibold bg-rose-100 text-rose-700 hover:bg-rose-200'
					>
						Stop
					</button>
				</div>
			</div>
		</div>
	)
}

export default TimerStartedModal
