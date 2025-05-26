import React from 'react'
import CalendarEventWithPlay from './CalendarEventWithPlay'

// Wrapper pour CalendarEventWithPlay qui gère le positionnement en cas de collision
function CalendarEventWithPlayPositioned({ event = {}, style, isListMode, ...props }) {
	// En mode agenda/liste, ne pas appliquer de positionnement absolu ni de wrapper
	if (isListMode) {
		return (
			<CalendarEventWithPlay
				event={event}
				isListMode={true}
				{...props}
			/>
		)
	}

	const collisionData = event.collisionData || { width: 100, left: 0 }

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
		}),
	}

	return (
		<div
			style={combinedStyles}
			className={`collision-positioned-event ${collisionData.width < 100 ? 'overlapped' : ''}`}
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
