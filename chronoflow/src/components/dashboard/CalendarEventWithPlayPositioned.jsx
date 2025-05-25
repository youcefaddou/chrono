import React from 'react'
import CalendarEventWithPlay from './CalendarEventWithPlay'

/**
 * Wrapper pour CalendarEventWithPlay qui gère le positionnement en cas de collision
 * Ce composant reçoit des props additionnelles pour le positionnement
 */
function CalendarEventWithPlayPositioned({ event, style, ...props }) {
	// Récupérer les données de positionnement depuis les props de l'événement
	const collisionData = event.collisionData || { width: 100, left: 0 }
	// Gérer les clics sur le conteneur pour éviter l'ouverture accidentelle de la modale
	const handleContainerClick = (e) => {
		// Vérifier si le clic est sur un bouton ou un élément interactif
		const target = e.target
		const isButton = target.tagName === 'BUTTON' || target.closest('button')
		const isInteractive = target.tagName === 'INPUT' || target.closest('input') || target.closest('[data-interactive]')
		const isSvg = target.tagName === 'svg' || target.closest('svg')
		
		// Si c'est un élément interactif (bouton, input, svg), empêcher la propagation
		if (isButton || isInteractive || isSvg) {
			e.stopPropagation()
			return
		}
		
		// Pour les clics sur le contenu de la tâche (texte, fond), permettre la propagation
		// pour que la modale de modification s'ouvre
		// Ne pas appeler e.stopPropagation() ici
	}
	
	// Styles pour gérer le positionnement et la collision
	const positionStyles = {
		position: 'absolute',
		width: `${collisionData.width}%`,
		left: `${collisionData.left}%`,
		top: 0,
		bottom: 0,
		// Bordure pour séparer les tâches qui se chevauchent
		borderRight: collisionData.width < 100 ? '1px solid rgba(255,255,255,0.3)' : 'none',
		// Léger padding pour éviter que les bordures se touchent
		paddingRight: collisionData.width < 100 ? '2px' : '0',
		boxSizing: 'border-box',
	}
	
	// Combiner les styles existants avec les styles de positionnement
	const combinedStyles = {
		...style,
		...positionStyles,
		// S'assurer que le conteneur parent utilise position relative
		...(collisionData.width < 100 && {
			fontSize: style?.fontSize ? Math.max(parseInt(style.fontSize) - 1, 10) + 'px' : '12px',
			padding: '2px',
		})
	}
	
	return (
		<div 
			style={combinedStyles}
			className={`collision-positioned-event ${collisionData.width < 100 ? 'overlapped' : ''}`}
			onClick={handleContainerClick}
		>
			<CalendarEventWithPlay 
				event={event} 
				{...props}
				// Passer un flag pour indiquer que la tâche est dans un contexte de collision
				isOverlapped={collisionData.width < 100}
			/>
		</div>
	)
}

export default CalendarEventWithPlayPositioned
