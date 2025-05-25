import React, { useState, useEffect } from 'react'
import { useTranslation } from '../../hooks/useTranslation'

const COLORS = [
	'#2563eb', // blue
	'#16a34a', // green
	'#eab308', // yellow
	'#f59e42', // orange
	'#e11d48', // red
	'#7c3aed', // purple
]

// Helper to format date as local ISO string for datetime-local input
function toLocalISOString(date) {
	if (!date) return ''
	const pad = n => n.toString().padStart(2, '0')
	const yyyy = date.getFullYear()
	const mm = pad(date.getMonth() + 1)
	const dd = pad(date.getDate())
	const hh = pad(date.getHours())
	const min = pad(date.getMinutes())
	return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

function SaveTimerModal({ open, elapsedSeconds, onClose, onSave }) {
	const { t, i18n } = useTranslation()
	const lang = i18n.language.startsWith('en') ? 'en' : 'fr'
	const [title, setTitle] = useState('')
	const [desc, setDesc] = useState('')
	const [color, setColor] = useState(COLORS[0])
	const [start, setStart] = useState(new Date())
	const [end, setEnd] = useState(new Date())

	useEffect(() => {
		if (open && elapsedSeconds > 0) {
			// Calculer automatiquement les heures de début et fin
			const now = new Date()
			const startTime = new Date(now.getTime() - (elapsedSeconds * 1000))
			setStart(startTime)
			setEnd(now)
		}
	}, [open, elapsedSeconds])

	const handleSave = () => {
		if (!title.trim()) return

		onSave({
			title: title.trim(),
			desc: desc.trim(),
			start,
			end,
			color,
			duration_seconds: elapsedSeconds
		})

		// Reset form
		setTitle('')
		setDesc('')
		setColor(COLORS[0])
	}

	if (!open) return null

	const formatTime = (seconds) => {
		const minutes = Math.floor(seconds / 60)
		const remainingSeconds = seconds % 60
		return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
	}

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
				
				<h2 className='text-xl font-bold mb-4'>
					{lang === 'fr' ? 'Enregistrer le temps' : 'Save Time Entry'}
				</h2>

				{/* Affichage du temps écoulé */}
				<div className='bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4'>
					<div className='text-sm text-blue-600 font-medium mb-1'>
						{lang === 'fr' ? 'Temps écoulé' : 'Elapsed Time'}
					</div>
					<div className='text-2xl font-mono text-blue-700 font-bold'>
						{formatTime(elapsedSeconds)}
					</div>
				</div>

				<div className='flex flex-col gap-3'>
					<input
						type='text'
						placeholder={lang === 'fr' ? 'Nom de la tâche (requis)' : 'Task name (required)'}
						value={title}
						onChange={e => setTitle(e.target.value)}
						className='border rounded px-3 py-2 text-sm mb-1 focus:outline-none focus:ring-2 focus:ring-blue-500'
						required
						autoFocus
					/>
					
					<textarea
						placeholder={lang === 'fr' ? 'Description (optionnel)' : 'Description (optional)'}
						value={desc}
						onChange={e => setDesc(e.target.value)}
						className='border rounded px-3 py-2 text-sm mb-1 focus:outline-none focus:ring-2 focus:ring-blue-500'
						rows={2}
					/>

					{/* Sélection de couleur */}
					<div className='flex items-center gap-2 mb-2'>
						<span className='text-xs font-medium'>{lang === 'fr' ? 'Couleur :' : 'Color:'}</span>
						{COLORS.map(c => (
							<button
								key={c}
								type='button'
								className={`w-6 h-6 rounded-full border-2 transition-all ${
									color === c ? 'border-blue-600 scale-110' : 'border-gray-200 hover:border-gray-400'
								}`}
								style={{ background: c }}
								onClick={() => setColor(c)}
								aria-label={c}
							/>
						))}
					</div>

					{/* Dates automatiquement calculées (affichage en lecture seule) */}
					<div className='grid grid-cols-2 gap-2'>
						<div>
							<label className='text-xs font-semibold mb-1 block text-gray-600'>
								{lang === 'fr' ? 'Début' : 'Start'}
							</label>
							<input
								type='datetime-local'
								value={toLocalISOString(start)}
								onChange={e => setStart(new Date(e.target.value))}
								className='border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
							/>
						</div>
						<div>
							<label className='text-xs font-semibold mb-1 block text-gray-600'>
								{lang === 'fr' ? 'Fin' : 'End'}
							</label>
							<input
								type='datetime-local'
								value={toLocalISOString(end)}
								onChange={e => setEnd(new Date(e.target.value))}
								className='border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
							/>
						</div>
					</div>

					{/* Boutons d'action */}
					<div className='flex gap-2 mt-4'>
						<button
							onClick={onClose}
							className='flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded font-semibold text-sm hover:bg-gray-200 transition'
						>
							{lang === 'fr' ? 'Annuler' : 'Cancel'}
						</button>
						<button
							onClick={handleSave}
							className='flex-1 bg-blue-600 text-white px-4 py-2 rounded font-semibold text-sm hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed'
							disabled={!title.trim()}
						>
							{lang === 'fr' ? 'Enregistrer' : 'Save'}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default SaveTimerModal
