import React, { useMemo, useCallback } from 'react'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import { navigate as NavigationActions } from 'react-big-calendar/lib/utils/constants'
import CalendarEventWithPlay from './CalendarEventWithPlay'
import '../Timer/timer-styles.css'
import './CustomAgendaView.css'

/**
 * Vue agenda personnalisée simplifiée avec affichage corrigé
 */
function CustomAgendaView({ 
  events = [], 
  date, 
  length = 7, 
  localizer, 
  messages = {}, 
  lang = 'fr',
  accessors,
  getters,
  selected,
  onSelectEvent,
  onDoubleClickEvent,
  onSelectSlot,
  handleEventEdit,
  showPastTasks = true // Nouvelle prop pour contrôler l'affichage des tâches passées
}) {
  const locale = lang === 'fr' ? fr : enUS
  
  // Calculer la plage de dates à afficher (mémorisé)
  const { start, end } = useMemo(() => {
    const startDate = date
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + length - 1)
    return { start: startDate, end: endDate }
  }, [date, length])
  
  // Mémorisation de la fonction d'édition pour éviter des re-renders inutiles
  const handleEditClick = useCallback((event) => {
    if (handleEventEdit) {
      handleEventEdit(event)
    }
  }, [handleEventEdit])

  // Filtrer les événements dans la plage de dates (mémorisé)
  const eventsInRange = useMemo(() => {
    return events
      .filter(event => {
        // S'assurer que l'événement a des dates valides
        if (!event?.start || !event?.end) return false
        
        // Convertir en objets Date pour la comparaison
        const eventStart = new Date(event.start)
        const eventEnd = new Date(event.end)
        
        if (showPastTasks) {
          // Si on montre les tâches passées, on affiche tout
          return true;
        } else {
          // Sinon, uniquement celles qui chevauchent la période actuelle
          return (eventStart <= end && eventEnd >= start);
        }
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  }, [events, start, end, showPastTasks])
  
  // Fonction pour créer une nouvelle tâche (mémorisée)
  const handleAddTask = useCallback(() => {
    if (onSelectSlot) {
      const now = new Date()
      const taskStart = new Date(now)
      taskStart.setHours(9, 0, 0, 0)
      const taskEnd = new Date(now)
      taskEnd.setHours(10, 0, 0, 0)
      
      onSelectSlot({
        start: taskStart,
        end: taskEnd,
        slots: [taskStart, taskEnd],
        action: 'click'
      })
    }
  }, [onSelectSlot])
  
  // Message à afficher s'il n'y a pas d'événements
  if (eventsInRange.length === 0) {
    return (
      <div className="custom-agenda-view">
        <div className="custom-agenda-empty">
          {messages.noEventsInRange || 'Aucun événement dans cette période'}
        </div>
        <div className="custom-agenda-add-button-container">
          <button className="custom-agenda-add-button" onClick={handleAddTask}>
            {messages.createEvent || 'Ajouter une tâche'}
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="custom-agenda-view">
      <table className="custom-agenda-table">
        <thead>
          <tr>
            <th className="custom-agenda-header-date">
              {messages.date || 'Date'}
            </th>
            <th className="custom-agenda-header-time">
              {messages.time || 'Heure'}
            </th>
            <th className="custom-agenda-header-event">
              {messages.event || 'Événement'}
            </th>
          </tr>
        </thead>
        <tbody>
          {eventsInRange.map((event, idx) => {
            // Pré-calculs des données nécessaires au rendu
            const startDate = new Date(event.start)
            const endDate = new Date(event.end)
            const dateStr = format(startDate, 'EEE dd MMM yyyy', { locale })
            const timeStr = `${format(startDate, 'HH:mm', { locale })} - ${format(endDate, 'HH:mm', { locale })}`
            const eventColor = event.color || '#3b82f6'
            
            // Préparation des données pour éviter les calculs dans les composants enfants
            const enhancedEvent = {
              ...event,
              formattedStartTime: format(startDate, 'HH:mm', { locale }),
              formattedEndTime: format(endDate, 'HH:mm', { locale }),
              onEdit: () => handleEditClick(event)
            }

            return (
              <tr 
                key={event.id || idx} 
                className="custom-agenda-row"
                style={{ borderLeft: `4px solid ${eventColor}` }}
              >
                <td className="custom-agenda-date-cell">
                  {dateStr}
                </td>
                <td className="custom-agenda-time-cell">
                  {timeStr}
                </td>
                <td className="custom-agenda-event-cell">
                  <CalendarEventWithPlay
                    event={enhancedEvent}
                    isListMode={true}
                    disablePolling={true}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      
      <div className="custom-agenda-add-button-container">
        <button className="custom-agenda-add-button" onClick={handleAddTask}>
          + {messages.createEvent || 'Ajouter une tâche'}
        </button>
      </div>
    </div>
  )
}

// Méthodes statiques nécessaires pour react-big-calendar
CustomAgendaView.range = (start, { length = 7 }) => {
  const end = new Date(start)
  end.setDate(end.getDate() + length - 1)
  return { start, end }
}

CustomAgendaView.navigate = (date, action, { length = 7 }) => {
  switch (action) {
    case NavigationActions.PREVIOUS: {
      const prevDate = new Date(date);
      prevDate.setDate(prevDate.getDate() - length);
      return prevDate;
    }
    case NavigationActions.NEXT: {
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + length);
      return nextDate;
    }
    default:
      return date;
  }
}

CustomAgendaView.title = (start, { length = 7, localizer }) => {
  const end = new Date(start)
  end.setDate(end.getDate() + length - 1)
  return localizer.format({ start, end }, 'agendaHeaderFormat')
}

export default CustomAgendaView
