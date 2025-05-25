/**
 * Utilitaires pour la détection de collision entre tâches et leur positionnement
 */

/**
 * Vérifie si deux tâches se chevauchent dans le temps
 * @param {Object} event1 - Première tâche avec start et end
 * @param {Object} event2 - Deuxième tâche avec start et end
 * @returns {boolean} true si les tâches se chevauchent
 */
export function eventsOverlap(event1, event2) {
	const start1 = new Date(event1.start).getTime()
	const end1 = new Date(event1.end).getTime()
	const start2 = new Date(event2.start).getTime()
	const end2 = new Date(event2.end).getTime()
	
	// Deux événements se chevauchent si :
	// - start1 < end2 ET start2 < end1
	return start1 < end2 && start2 < end1
}

/**
 * Vérifie si deux tâches sont sur le même jour
 * @param {Object} event1 - Première tâche
 * @param {Object} event2 - Deuxième tâche
 * @returns {boolean} true si les tâches sont sur le même jour
 */
export function eventsOnSameDay(event1, event2) {
	const date1 = new Date(event1.start)
	const date2 = new Date(event2.start)
	
	return date1.getFullYear() === date2.getFullYear() &&
		   date1.getMonth() === date2.getMonth() &&
		   date1.getDate() === date2.getDate()
}

/**
 * Groupe les tâches qui se chevauchent en clusters
 * @param {Array} events - Liste des tâches
 * @returns {Array} Tableau de clusters, chaque cluster contient les tâches qui se chevauchent
 */
export function groupOverlappingEvents(events) {
	const clusters = []
	const processed = new Set()
	
	events.forEach(event => {
		if (processed.has(event.id)) return
		
		// Créer un nouveau cluster avec cette tâche
		const cluster = [event]
		processed.add(event.id)
		
		// Trouver toutes les tâches qui se chevauchent avec ce cluster
		let foundOverlap = true
		while (foundOverlap) {
			foundOverlap = false
			
			events.forEach(otherEvent => {
				if (processed.has(otherEvent.id)) return
				
				// Vérifier si cette tâche se chevauche avec n'importe quelle tâche du cluster
				const overlapsWithCluster = cluster.some(clusterEvent => 
					eventsOnSameDay(clusterEvent, otherEvent) && 
					eventsOverlap(clusterEvent, otherEvent)
				)
				
				if (overlapsWithCluster) {
					cluster.push(otherEvent)
					processed.add(otherEvent.id)
					foundOverlap = true
				}
			})
		}
		
		clusters.push(cluster)
	})
	
	return clusters
}

/**
 * Calcule la position et la largeur pour chaque tâche dans un cluster
 * @param {Array} cluster - Cluster de tâches qui se chevauchent
 * @returns {Object} Map avec l'id de la tâche comme clé et {width, left} comme valeur
 */
export function calculateEventPositions(cluster) {
	if (cluster.length <= 1) {
		return cluster.reduce((acc, event) => {
			acc[event.id] = { width: 100, left: 0 }
			return acc
		}, {})
	}
	
	// Trier les tâches par heure de début
	const sortedEvents = [...cluster].sort((a, b) => 
		new Date(a.start).getTime() - new Date(b.start).getTime()
	)
	
	// Calculer les positions
	const positions = {}
	const columns = []
	
	sortedEvents.forEach(event => {
		// Trouver la première colonne disponible
		let columnIndex = 0
		
		while (columnIndex < columns.length) {
			const columnEvents = columns[columnIndex]
			const hasConflict = columnEvents.some(colEvent => 
				eventsOverlap(event, colEvent)
			)
			
			if (!hasConflict) {
				break
			}
			columnIndex++
		}
		
		// Si aucune colonne disponible, créer une nouvelle
		if (columnIndex >= columns.length) {
			columns.push([])
		}
		
		columns[columnIndex].push(event)
		
		// Calculer la largeur et la position
		const totalColumns = Math.max(columns.length, 1)
		const width = Math.floor(100 / totalColumns)
		const left = columnIndex * width
		
		positions[event.id] = { width, left }
	})
	
	// Réajuster les largeurs pour utiliser toute la largeur disponible
	const totalColumns = columns.length
	Object.keys(positions).forEach(eventId => {
		positions[eventId].width = Math.floor(100 / totalColumns)
	})
	
	return positions
}

/**
 * Calcule toutes les positions pour une liste de tâches
 * @param {Array} events - Liste de toutes les tâches
 * @returns {Object} Map avec l'id de la tâche comme clé et {width, left} comme valeur
 */
export function calculateAllEventPositions(events) {
	const clusters = groupOverlappingEvents(events)
	let allPositions = {}
	
	clusters.forEach(cluster => {
		const clusterPositions = calculateEventPositions(cluster)
		allPositions = { ...allPositions, ...clusterPositions }
	})
	
	return allPositions
}
