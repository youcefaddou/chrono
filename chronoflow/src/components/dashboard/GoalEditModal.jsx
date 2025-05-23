import React, { useState, useEffect } from 'react'
import './GoalModal.css'
import { supabase } from '../../lib/supabase'

function GoalEditModal({ open, onClose, onEdit, initialGoal, lang = 'fr' }) {
	const [goal, setGoal] = useState('')
	const [track, setTrack] = useState('')
	const [forType, setForType] = useState('atLeast')
	const [hours, setHours] = useState('')
	const [per, setPer] = useState('day')
	const [until, setUntil] = useState('')
	const [noEnd, setNoEnd] = useState(false)
	const [projects, setProjects] = useState([])

	useEffect(() => {
		// Récupère les projets de l'utilisateur pour le select
		async function fetchProjects () {
			const { data, error } = await supabase
				.from('projects')
				.select('id,name')
				.order('created_at', { ascending: false })
			if (!error && data) setProjects(data)
		}
		if (open) fetchProjects()
	}, [open])

	useEffect(() => {
		if (initialGoal) {
			setGoal(initialGoal.goal || '')
			setTrack(initialGoal.track || '')
			setForType(initialGoal.forType || initialGoal.for_type || 'atLeast')
			setHours(initialGoal.hours !== undefined ? initialGoal.hours : '')
			setPer(initialGoal.per || 'day')
			setUntil(initialGoal.until || '')
			setNoEnd(!initialGoal.until)
		}
	}, [initialGoal, open])

	if (!open) return null

	const labels = {
		fr: {
			title: 'Modifier l\'objectif',
			goal: 'Objectif',
			goalPlaceholder: 'Nom de l\'objectif',
			member: 'Membre',
			track: 'Projet/Tâche',
			trackPlaceholder: 'Sélectionner un projet',
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
			save: 'Enregistrer',
			memberYou: '(Vous)',
		},
		en: {
			title: 'Edit goal',
			goal: 'Goal',
			goalPlaceholder: 'Goal name',
			member: 'Member',
			track: 'Track',
			trackPlaceholder: 'Select a project',
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
			save: 'Save',
			memberYou: '(You)',
		},
	}
	const t = labels[lang]
	const today = new Date().toISOString().slice(0, 10)

	function handleSubmit(e) {
		e.preventDefault()
		onEdit({
			goal,
			track,
			forType,
			hours,
			per,
			until: noEnd ? null : until,
		})
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
					<select
						value={track}
						onChange={e => setTrack(e.target.value)}
						required
					>
						<option value=''>{t.trackPlaceholder}</option>
						{projects.map(project =>
							<option key={project.id} value={project.name}>
								{project.name}
							</option>
						)}
					</select>
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
						<button type='submit' className='goal-modal-create'>{t.save}</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default GoalEditModal
