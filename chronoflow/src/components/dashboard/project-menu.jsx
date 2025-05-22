import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * ProjectMenu
 * Menu contextuel qui s'affiche sous le bouton anchorRef, aligné à droite.
 * Gère collisions droite/bas écran.
 * @param {Object} props
 * @param {React.RefObject} props.anchorRef - Ref du bouton déclencheur
 * @param {boolean} props.open - Affiche ou non le menu
 * @param {function} props.onClose - Callback fermeture
 * @param {React.ReactNode} props.children - Contenu du menu
 */
function ProjectMenu ({ anchorRef, open, onClose, children }) {
	const menuRef = useRef(null)
	const [pos, setPos] = useState({ top: 0, left: 0 })
	const [ready, setReady] = useState(false)

	useEffect(() => {
		if (!open) return
		if (!anchorRef || !anchorRef.current) {
			console.warn('ProjectMenu: anchorRef.current is null, menu not shown')
			setReady(false)
			return
		}
		const rect = anchorRef.current.getBoundingClientRect()
		console.log('ProjectMenu anchorRef.current:', anchorRef.current)
		console.log('ProjectMenu rect:', rect)
		// Si le bouton n'est pas dans le DOM (rect tout à 0), retry après 50ms
		if (rect.width === 0 && rect.height === 0 && rect.top === 0 && rect.left === 0) {
			setReady(false)
			setTimeout(() => setReady(true), 50)
			return
		}
		let menuWidth = 192 // fallback w-48
		let menuHeight = 200
		if (menuRef.current) {
			const menuRect = menuRef.current.getBoundingClientRect()
			menuWidth = menuRect.width
			menuHeight = menuRect.height
		}
		// Bord gauche du menu = bord droit du bouton (menu collé à droite du bouton)
		let left = rect.right
		let top = rect.bottom + 4
		const viewportWidth = window.innerWidth
		const viewportHeight = window.innerHeight
		// Collision droite
		if (left + menuWidth > viewportWidth - 8) {
			left = viewportWidth - menuWidth - 8
		}
		// Collision gauche
		if (left < 8) left = 8
		// Collision bas
		if (top + menuHeight > viewportHeight - 8) {
			top = rect.top - menuHeight - 4
			if (top < 8) top = 8
		}
		setPos({ top, left })
		setReady(true)
	}, [open, children, anchorRef])

	// Fermeture au clic extérieur ou touche Escape
	useEffect(() => {
		if (!open) return
		function handleClick (e) {
			if (
				menuRef.current &&
				!menuRef.current.contains(e.target) &&
				anchorRef?.current && !anchorRef.current.contains(e.target)
			) {
				onClose?.()
			}
		}
		function handleKey (e) {
			if (e.key === 'Escape') onClose?.()
		}
		document.addEventListener('mousedown', handleClick)
		document.addEventListener('keydown', handleKey)
		return () => {
			document.removeEventListener('mousedown', handleClick)
			document.removeEventListener('keydown', handleKey)
		}
	}, [open, onClose, anchorRef])

	// Focus premier élément interactif à l'ouverture
	useEffect(() => {
		if (open && menuRef.current) {
			const first = menuRef.current.querySelector('button, [tabindex]:not([tabindex="-1"])')
			if (first) first.focus()
		}
	}, [open])

	if (!open || !ready || !anchorRef?.current) return null
	return createPortal(
		<div
			ref={menuRef}
			className='fixed z-50 w-48 bg-neutral-900 border border-neutral-700 rounded shadow-lg text-white focus:outline-none animate-fade-in'
			style={{ top: pos.top, left: pos.left }}
			role='menu'
			aria-modal='true'
			tabIndex={-1}
		>
			{children}
		</div>,
		document.body
	)
}

export default ProjectMenu
