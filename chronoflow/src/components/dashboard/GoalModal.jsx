import React, { useState } from 'react'
import './GoalModal.css'

/**
 * Modale de création d'objectif (Goal) inspirée de l'UI Toggl, multilingue FR/EN
 * Props :
 * - open: bool
 * - onClose: function
 * - onCreate: function(goalData)
 * - lang: 'fr' | 'en'
 */
function GoalModal({ open, onClose, onCreate, lang = 'fr' }) {
	// Always call hooks at the top level
	const [goal, setGoal] = useState('')
	const [track, setTrack] = useState('')
	const [forType, setForType] = useState('atLeast')
	const [hours, setHours] = useState('')
	const [per, setPer] = useState('day')
	const [until, setUntil] = useState('')
	const [noEnd, setNoEnd] = useState(false)

	if (!open) return null

	const labels = {
		fr: {
			title: 'Créer un objectif',
			goal: 'Objectif',
			goalPlaceholder: 'Nom de l\'objectif',
			member: 'Membre',
			track: 'Projet/Tâche',
			trackPlaceholder: 'Rechercher un projet, tâche...',
			for: 'Pour',
			atLeast: 'au moins',
			exactly: 'exactement',
			hours: 'heures',
			per: 'chaque',
			day: 'jour',
			week: 'semaine',
			until: 'Jusqu\'au',
			noEnd: 'Pas de date de fin',
			cancel: 'Annuler',
			create: 'Créer l\'objectif',
			memberYou: '(Vous)',
		},
		en: {
			title: 'Create a goal',
			goal: 'Goal',
			goalPlaceholder: 'Goal name',
			member: 'Member',
			track: 'Track',
			trackPlaceholder: 'Search for project, task...',
			for: 'For',
			atLeast: 'at least',
			exactly: 'exactly',
			hours: 'hours',
			per: 'every',
			day: 'day',
			week: 'week',
			until: 'Until',
			noEnd: 'No end date',
			cancel: 'Cancel',
			create: 'Create goal',
			memberYou: '(You)',
		},
	}
	const t = labels[lang]

	const today = new Date().toISOString().slice(0, 10)

	function handleSubmit(e) {
		e.preventDefault()
		onCreate({ goal, track, forType, hours, per, until: noEnd ? null : until })
		onClose()
	}

	return (
		<div className='goal-modal-overlay'>
			<div className='goal-modal'>
				<div className='goal-modal-header'>
					<span>{t.title}</span>
					<button className='goal-modal-close' onClick={onClose}>×</button>
				</div>
				<form onSubmit={handleSubmit} className='goal-modal-form'>
					<label>{t.goal}</label>
					<input
						type='text'
						placeholder={t.goalPlaceholder}
						value={goal}
						onChange={e => setGoal(e.target.value)}
						required
					/>
					<label>{t.member}</label>
					<select disabled value='me'>
						<option value='me'>Johnnhash13 {t.memberYou}</option>
					</select>
					<label>{t.track}</label>
					<input
						type='text'
						placeholder={t.trackPlaceholder}
						value={track}
						onChange={e => setTrack(e.target.value)}
					/>
					<label>{t.for}</label>
					<div className='goal-modal-for-row'>
						<select value={forType} onChange={e => setForType(e.target.value)}>
							<option value='atLeast'>{t.atLeast}</option>
							<option value='exactly'>{t.exactly}</option>
						</select>
						<input
							type='number'
							min='0'
							placeholder='0'
							value={hours}
							onChange={e => setHours(e.target.value)}
							required
						/>
						<span>{t.hours}</span>
						<select value={per} onChange={e => setPer(e.target.value)}>
							<option value='day'>{t.day}</option>
							<option value='week'>{t.week}</option>
						</select>
					</div>
					<label>{t.until}</label>
					<div className='goal-modal-until-row'>
						<input
							type='date'
							value={until || today}
							onChange={e => setUntil(e.target.value)}
							disabled={noEnd}
							min={today}
						/>
						<label className='goal-modal-checkbox'>
							<input
								type='checkbox'
								checked={noEnd}
								onChange={e => setNoEnd(e.target.checked)}
							/>
							{t.noEnd}
						</label>
					</div>
					<div className='goal-modal-actions'>
						<button type='button' onClick={onClose}>{t.cancel}</button>
						<button type='submit' className='goal-modal-create'>{t.create}</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default GoalModal
