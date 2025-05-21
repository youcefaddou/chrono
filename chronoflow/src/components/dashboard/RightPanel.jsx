import React, { useState, useContext, useRef } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { GlobalTimerContext } from '../Timer/GlobalTimerProvider'
import GoalModal from './GoalModal'
import FavoriteModal from './FavoriteModal'
import './RightPanel.css'
import { supabase } from '../../lib/supabase'

function RightPanel() {
	const { t } = useTranslation()
	const [showGoalModal, setShowGoalModal] = useState(false)
	const [showFavoriteModal, setShowFavoriteModal] = useState(false)
	const [goals, setGoals] = useState([])
	const [favorites, setFavorites] = useState([])
	const [favoriteTimers, setFavoriteTimers] = useState([])
	const [editingGoalIndex, setEditingGoalIndex] = useState(null)
	const [editingGoalValue, setEditingGoalValue] = useState('')
	const [editingFavoriteIndex, setEditingFavoriteIndex] = useState(null)
	const [editingFavoriteValue, setEditingFavoriteValue] = useState('')
	const lang = window.location.pathname.startsWith('/en') ? 'en' : 'fr'
	const globalTimer = useContext(GlobalTimerContext)
	const [user, setUser] = useState(null)
	const [pendingGlobalTimerAction, setPendingGlobalTimerAction] = useState(null)
	const prevFavoriteTimersRef = useRef([])

	React.useEffect(() => {
		supabase.auth.getUser().then(({ data }) => {
			if (data?.user) {
				setUser(data.user)
				fetchGoals(data.user.id)
				fetchFavorites(data.user.id)
			}
		})
	}, [])

	React.useEffect(() => {
		if (!globalTimer) return
		const interval = setInterval(() => {
			console.log('[RightPanel] globalTimer.seconds:', globalTimer.seconds)
		}, 1000)
		return () => clearInterval(interval)
	}, [globalTimer])

	async function fetchGoals(userId) {
		const { data, error } = await supabase
			.from('goals')
			.select('*')
			.eq('user_id', userId)
			.order('created_at', { ascending: true })
		if (!error && data) setGoals(data)
	}

	async function fetchFavorites(userId) {
		const { data, error } = await supabase
			.from('favorites')
			.select('*')
			.eq('user_id', userId)
			.order('created_at', { ascending: true })
		if (!error && data) {
			setFavorites(data)
			setFavoriteTimers(data.map(f => ({
				running: false,
				paused: false,
				startSeconds: null,
				elapsedSeconds: f.elapsed_seconds || 0
			})))
		}
	}

	async function handleCreateGoal(goal) {
		if (!user) return
		const { data, error } = await supabase
			.from('goals')
			.insert([{ ...goal, user_id: user.id }])
			.select()
		if (!error && data && data[0]) setGoals(goals => [...goals, data[0]])
	}

	async function handleUpdateGoal(index, updatedGoal) {
		if (!user) return
		const goal = goals[index]
		const { data, error } = await supabase
			.from('goals')
			.update(updatedGoal)
			.eq('id', goal.id)
			.select()
		if (!error && data && data[0]) setGoals(goals => goals.map((g, i) => i === index ? data[0] : g))
	}

	async function handleDeleteGoal(index) {
		if (!user) return
		const goal = goals[index]
		const { error } = await supabase
			.from('goals')
			.delete()
			.eq('id', goal.id)
		if (!error) setGoals(goals => goals.filter((_, i) => i !== index))
	}

	async function handleCreateFavorite(fav) {
		if (!user) return
		const { data, error } = await supabase
			.from('favorites')
			.insert([{ description: fav.description || fav.desc || fav, user_id: user.id, elapsed_seconds: 0 }])
			.select()
		if (!error && data && data[0]) {
			setFavorites(favs => [...favs, data[0]])
			setFavoriteTimers(timers => [...timers, { running: false, paused: false, startSeconds: null, elapsedSeconds: 0 }])
		}
	}

	const handleUpdateFavorite = React.useCallback(async (index, updatedFavorite, elapsedSeconds) => {
		if (!user) return
		const fav = favorites[index]
		const updateObj = { description: updatedFavorite.description || updatedFavorite.desc || updatedFavorite }
		if (typeof elapsedSeconds === 'number') updateObj.elapsed_seconds = elapsedSeconds
		console.log('[handleUpdateFavorite] index:', index, 'elapsedSeconds:', elapsedSeconds, 'updateObj:', updateObj)
		const { data, error } = await supabase
			.from('favorites')
			.update(updateObj)
			.eq('id', fav.id)
			.select()
		console.log('[handleUpdateFavorite] supabase response:', { data, error })
		if (!error && data && data[0]) setFavorites(favs => favs.map((f, i) => i === index ? data[0] : f))
	}, [user, favorites])

	async function handleDeleteFavorite(index) {
		if (!user) return
		const fav = favorites[index]
		const { error } = await supabase
			.from('favorites')
			.delete()
			.eq('id', fav.id)
		if (!error) {
			setFavorites(favs => favs.filter((_, i) => i !== index))
			setFavoriteTimers(timers => timers.filter((_, i) => i !== index))
		}
	}

	function handlePlayPauseFavorite(index) {
		setFavoriteTimers(timers => timers.map((t, i) => {
			if (i !== index) return t
			if (!t.running) {
				setPendingGlobalTimerAction({ action: 'start', index, reset: true })
				return {
					running: true,
					paused: false,
					startSeconds: globalTimer.seconds, // Correction: start from current globalTimer
					elapsedSeconds: t.elapsedSeconds // Keep previous elapsed if resuming
				}
			} else {
				if (!t.paused) {
					setPendingGlobalTimerAction({ action: 'pause', index })
					const elapsed = t.elapsedSeconds + (globalTimer.seconds - t.startSeconds)
					return {
						...t,
						paused: true,
						elapsedSeconds: elapsed
					}
				} else {
					setPendingGlobalTimerAction({ action: 'resume', index })
					return {
						...t,
						paused: false,
						startSeconds: globalTimer.seconds
					}
				}
			}
		}))
	}

	React.useEffect(() => {
		if (!pendingGlobalTimerAction || !globalTimer) return
		if (pendingGlobalTimerAction.action === 'start' && !globalTimer.running) {
			globalTimer.start(null, true)
		}
		if (pendingGlobalTimerAction.action === 'pause' && globalTimer.running) {
			globalTimer.pause()
		}
		if (pendingGlobalTimerAction.action === 'resume' && !globalTimer.running) {
			globalTimer.resume()
		}
		setPendingGlobalTimerAction(null)
	}, [pendingGlobalTimerAction, globalTimer])

	React.useEffect(() => {
		if (!favorites.length || !favoriteTimers.length) return
		favoriteTimers.forEach((timer, i) => {
			const prev = prevFavoriteTimersRef.current[i] || {}
			// Detect transition from running (not paused) to paused
			if (prev.running && !prev.paused && timer.running && timer.paused) {
				// Timer was running, now paused: update Supabase with latest elapsedSeconds
				handleUpdateFavorite(i, favorites[i], timer.elapsedSeconds)
			}
		})
		// Update ref for next render
		prevFavoriteTimersRef.current = favoriteTimers.map(t => ({ ...t }))
	}, [favoriteTimers, favorites, handleUpdateFavorite])

	function handleStopFavorite(index) {
		setFavoriteTimers(timers => timers.map((t, i) => {
			if (i === index) {
				// Calculer le temps total écoulé avant reset
				const elapsed = t.running && !t.paused && t.startSeconds != null
					? t.elapsedSeconds + (globalTimer.seconds - t.startSeconds)
					: t.elapsedSeconds
				handleUpdateFavorite(i, favorites[i], elapsed)
				return { running: false, paused: false, startSeconds: null, elapsedSeconds: 0 }
			}
			return t
		}))
		if (globalTimer && globalTimer.running) {
			globalTimer.stop()
		}
	}

	function getFavoriteDisplaySeconds(i) {
		const t = favoriteTimers[i]
		if (!t) return favorites[i]?.elapsed_seconds || 0
		if (!t.running) return t.elapsedSeconds ?? favorites[i]?.elapsed_seconds ?? 0
		if (t.paused) return t.elapsedSeconds ?? favorites[i]?.elapsed_seconds ?? 0
		if (t.startSeconds == null) return favorites[i]?.elapsed_seconds || 0
		return (t.elapsedSeconds ?? favorites[i]?.elapsed_seconds ?? 0) + (globalTimer.seconds - t.startSeconds)
	}

	return (
		<aside className='right-panel'>
			<div className='right-panel-section'>
				<div className='right-panel-section-header'>
					<span className='right-panel-section-title'>{lang === 'fr' ? 'Objectifs' : 'Goals'}</span>
					<button className='right-panel-add-btn' onClick={() => setShowGoalModal(true)}>
						+ {lang === 'fr' ? 'Créer un objectif' : 'Create a goal'}
					</button>
				</div>
				<ul className='right-panel-goals-list'>
					{goals.length === 0 && <li className='right-panel-empty'>{lang === 'fr' ? 'Aucun objectif' : 'No goals yet'}</li>}
					{goals.map((g, i) => (
						<li key={i} className='right-panel-goal-item'>
							{editingGoalIndex === i ? (
								<form className='right-panel-edit-form' onSubmit={e => {
									e.preventDefault()
									handleUpdateGoal(i, { ...g, goal: editingGoalValue })
									setEditingGoalIndex(null)
									setEditingGoalValue('')
								}}>
									<input
										type='text'
										value={editingGoalValue}
										onChange={e => setEditingGoalValue(e.target.value)}
										autoFocus
										className='right-panel-edit-input'
									/>
									<button type='submit' className='right-panel-edit-btn'>{lang === 'fr' ? 'Valider' : 'Save'}</button>
									<button type='button' className='right-panel-delete-btn' onClick={() => { setEditingGoalIndex(null); setEditingGoalValue('') }}>{lang === 'fr' ? 'Annuler' : 'Cancel'}</button>
								</form>
							) : (
								<>
									<strong>{g.goal}</strong><br />
									<span className='right-panel-goal-meta'>
										{lang === 'fr' ? 'Projet/Tâche' : 'Track'}: {g.track || <span className='right-panel-goal-track-empty'>-</span>}<br />
										{lang === 'fr' ? 'Pour' : 'For'}: {g.forType === 'atLeast' ? (lang === 'fr' ? 'au moins' : 'at least') : (lang === 'fr' ? 'exactement' : 'exactly')} {g.hours} {lang === 'fr' ? 'heures' : 'hours'} / {g.per === 'day' ? (lang === 'fr' ? 'jour' : 'day') : (lang === 'fr' ? 'semaine' : 'week')}<br />
										{lang === 'fr' ? 'Jusqu\'au' : 'Until'}: {g.until ? g.until : (lang === 'fr' ? 'Pas de date de fin' : 'No end date')}
									</span>
									<div className='right-panel-goal-actions'>
										<button className='right-panel-edit-btn' onClick={() => { setEditingGoalIndex(i); setEditingGoalValue(g.goal) }}>{lang === 'fr' ? 'Modifier' : 'Edit'}</button>
										<button className='right-panel-delete-btn' onClick={() => handleDeleteGoal(i)}>{lang === 'fr' ? 'Supprimer' : 'Delete'}</button>
									</div>
								</>
							)}
						</li>
					))}
				</ul>
			</div>
			<div className='right-panel-section'>
				<div className='right-panel-section-header'>
					<span className='right-panel-section-title'>{lang === 'fr' ? 'Favoris' : 'Favorites'}</span>
					<button className='right-panel-add-btn' onClick={() => setShowFavoriteModal(true)}>
						+ {lang === 'fr' ? 'Ajouter' : 'Add'}
					</button>
				</div>
				<ul className='right-panel-favorites-list'>
					{favorites.length === 0 && <li className='right-panel-empty'>{lang === 'fr' ? 'Aucun favori' : 'No favorites yet'}</li>}
					{favorites.map((f, i) => (
						<li key={i} className='right-panel-favorite-item'>
							<span>{f.description || f.desc || f}</span>
							<div className='right-panel-favorite-actions'>
								<button
									onClick={() => handlePlayPauseFavorite(i)}
									className={`timer-btn ${favoriteTimers[i]?.running ? (favoriteTimers[i]?.paused ? 'timer-btn-paused' : 'timer-btn-running') : 'timer-btn-idle'}`}
									aria-label={favoriteTimers[i]?.running ? (favoriteTimers[i]?.paused ? (lang === 'fr' ? 'Reprendre' : 'Resume') : (lang === 'fr' ? 'Pause' : 'Pause')) : (lang === 'fr' ? 'Démarrer' : 'Play')}
								>
									{favoriteTimers[i]?.running ? (
										favoriteTimers[i]?.paused ? (
											<svg width='20' height='20' fill='none' viewBox='0 0 20 20'><polygon points='6,4 16,10 6,16' fill='currentColor'/></svg>
										) : (
											<svg width='20' height='20' fill='none' viewBox='0 0 20 20'><rect x='4' y='4' width='4' height='12' rx='1' fill='currentColor'/><rect x='12' y='4' width='4' height='12' rx='1' fill='currentColor'/></svg>
										)
									) : (
										<svg width='20' height='20' fill='none' viewBox='0 0 20 20'><polygon points='6,4 16,10 6,16' fill='currentColor'/></svg>
									)}
								</button>
								<button
									onClick={() => handleStopFavorite(i)}
									className='timer-btn timer-btn-stop'
									aria-label='Stop'
								>
									<svg width='20' height='20' fill='none' viewBox='0 0 20 20'><rect x='5' y='5' width='10' height='10' rx='2' fill='currentColor'/></svg>
								</button>
								<button className='right-panel-delete-btn' onClick={() => handleDeleteFavorite(i)}>{lang === 'fr' ? 'Supprimer' : 'Delete'}</button>
								{favoriteTimers[i]?.running && (
									<span className='right-panel-timer'>{formatSeconds(getFavoriteDisplaySeconds(i))}</span>
								)}
							</div>
						</li>
					))}
				</ul>
				<FavoriteModal open={showFavoriteModal} onClose={() => setShowFavoriteModal(false)} onSave={fav => { handleCreateFavorite(fav); setShowFavoriteModal(false) }} lang={lang} />
			</div>
			<GoalModal open={showGoalModal} onClose={() => setShowGoalModal(false)} onCreate={handleCreateGoal} lang={lang} />
		</aside>
	)
}

function formatSeconds(s) {
	const m = Math.floor(s / 60)
	const sec = s % 60
	return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

export default RightPanel
