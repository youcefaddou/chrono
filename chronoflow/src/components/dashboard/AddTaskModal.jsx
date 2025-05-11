import React, { useState } from 'react'

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function AddTaskModal ({ dayIdx, startHour, endHour, onClose }) {
	const [desc, setDesc] = useState('')
	const [project, setProject] = useState('')
	const [start, setStart] = useState(startHour)
	const [end, setEnd] = useState(endHour)
	const [startTimer, setStartTimer] = useState(false)

	const handleAdd = () => {
		// Ici tu peux connecter à Supabase ou à ton state global
		// Pour la démo, on affiche juste les infos
		alert(
			`Task: ${desc}\nProject: ${project}\nDay: ${days[dayIdx]}\nStart: ${String(start).padStart(2, '0')}:00\nEnd: ${String(end).padStart(2, '0')}:00\nStart timer: ${startTimer ? 'yes' : 'no'}`
		)
		onClose()
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40'>
			<div className='bg-white rounded-xl shadow-lg p-6 w-full max-w-sm relative'>
				<button
					onClick={onClose}
					className='absolute top-2 right-2 text-gray-400 hover:text-rose-500 text-xl'
					aria-label='Close'
				>
					&times;
				</button>
				<h3 className='text-lg font-bold mb-4'>Add a task/project</h3>
				<input
					type='text'
					placeholder='Description'
					value={desc}
					onChange={e => setDesc(e.target.value)}
					className='w-full mb-2 px-2 py-1 border rounded'
				/>
				<input
					type='text'
					placeholder='Project (optional)'
					value={project}
					onChange={e => setProject(e.target.value)}
					className='w-full mb-2 px-2 py-1 border rounded'
				/>
				<div className='flex gap-2 mb-2'>
					<select value={start} onChange={e => setStart(Number(e.target.value))} className='border rounded px-2 py-1'>
						{Array.from({ length: 24 }, (_, i) => (
							<option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
						))}
					</select>
					<span className='self-center'>→</span>
					<select value={end} onChange={e => setEnd(Number(e.target.value))} className='border rounded px-2 py-1'>
						{Array.from({ length: 24 }, (_, i) => (
							<option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
						))}
					</select>
				</div>
				<label className='flex items-center gap-2 mb-4'>
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
