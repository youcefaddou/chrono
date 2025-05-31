import React, { useState, useContext, useRef, useCallback, useEffect } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { GlobalTimerContext } from '../Timer/GlobalTimerProvider'
// import GoalModal from './GoalModal' // Objectifs désactivés
// import FavoriteModal from './FavoriteModal' // Favoris désactivés
// import GoalEditModal from './GoalEditModal' // Objectifs désactivés
import './RightPanel.css'

function RightPanel () {
	const { t } = useTranslation()
	// const [showGoalModal, setShowGoalModal] = useState(false) // Objectifs désactivés
	// const [goalModalKey, setGoalModalKey] = useState(0) // Objectifs désactivés
	// const [showFavoriteModal, setShowFavoriteModal] = useState(false) // Favoris désactivés
	// const [favorites, setFavorites] = useState([]) // Favoris désactivés
	// const [favoriteTimers, setFavoriteTimers] = useState([]) // Favoris désactivés
	// const [editingFavoriteIndex, setEditingFavoriteIndex] = useState(null) // Favoris désactivés
	// const [editingFavoriteValue, setEditingFavoriteValue] = useState('') // Favoris désactivés
	const lang = window.location.pathname.startsWith('/en') ? 'en' : 'fr'
	const globalTimer = useContext(GlobalTimerContext)
	const [user, setUser] = useState(null)
	const [pendingGlobalTimerAction, setPendingGlobalTimerAction] = useState(null)
	// const prevFavoriteTimersRef = useRef([]) // Favoris désactivés

	useEffect(() => {
		if (!globalTimer) return
		const interval = setInterval(() => {}, 1000)
		return () => clearInterval(interval)
	}, [globalTimer])

	// async function fetchGoals (userId) { ... } // Objectifs désactivés

	// async function fetchFavorites (userId) { ... } // Favoris désactivés

	// async function handleCreateFavorite (fav) { ... } // Favoris désactivés
	// const handleUpdateFavorite = useCallback(async (index, updatedFavorite, elapsedSeconds) => { ... }, [user, favorites]) // Favoris désactivés
	// async function handleDeleteFavorite (index) { ... } // Favoris désactivés
	// function handlePlayPauseFavorite (index) { ... } // Favoris désactivés

	useEffect(() => {
		if (!pendingGlobalTimerAction || !globalTimer) return
		if (pendingGlobalTimerAction.action === 'start' && !globalTimer.running) {
			globalTimer.start(null, true)
		}
		if (pendingGlobalTimerAction.action === 'pause' && globalTimer.running) {
			globalTimer.pause()
		}
		if (pendingGlobalTimerAction.action === 'resume') {
			if (!globalTimer.running) {
				globalTimer.start(null, false)
			}
		}
		setPendingGlobalTimerAction(null)
	}, [pendingGlobalTimerAction, globalTimer])

	// useEffect(() => { ... }, [favoriteTimers, favorites, handleUpdateFavorite]) // Favoris désactivés

	// function handleStopFavorite (index) { ... } // Favoris désactivés

	// function getFavoriteDisplaySeconds (i) { ... } // Favoris désactivés

	return (
		<aside className='right-panel'>
			{/* Section Objectifs désactivée */}
			{/* <div className='right-panel-section'> ...objectifs... </div> */}
			{/* Section Favoris désactivée */}
			{/* <div className='right-panel-section'> ...favoris... </div> */}
			{/* Modales Objectifs désactivées */}
			{/* <GoalModal ... /> */}
			{/* <GoalEditModal ... /> */}
		</aside>
	)
}

function formatSeconds (s) {
	const m = Math.floor(s / 60)
	const sec = s % 60
	return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

export default RightPanel
