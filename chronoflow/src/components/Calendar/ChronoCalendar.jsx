import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import { fr, enUS } from 'date-fns/locale'
import { useTranslation } from '../../hooks/useTranslation'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import { useMemo, useState } from 'react'
import { format, parse, startOfWeek, getDay } from 'date-fns'

const locales = {
  fr: fr,
  en: enUS,
}

const DragAndDropCalendar = withDragAndDrop(Calendar)

const messages = {
  fr: {
    week: 'Semaine',
    work_week: 'Semaine ouvrée',
    day: 'Jour',
    month: 'Mois',
    previous: 'Précédent',
    next: 'Suivant',
    today: "Aujourd'hui",
    agenda: 'Agenda',
    date: 'Date',
    time: 'Heure',
    event: 'Événement',
    allDay: 'Toute la journée',
    noEventsInRange: 'Aucun événement',
    showMore: total => `+ ${total} de plus`
  },
  en: {} // anglais par défaut
}

export default function ChronoCalendar({ events: initialEvents, onSelectEvent, onSelectSlot }) {
  const { i18n } = useTranslation()
  const lang = i18n.language.startsWith('fr') ? 'fr' : 'en'

  const localizer = useMemo(() =>
    dateFnsLocalizer({
      format,
      parse,
      startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
      getDay,
      locales,
    }), []
  )

  const [events, setEvents] = useState(initialEvents || [])
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')

  // Drag & drop handlers
  const moveEvent = ({ event, start, end, isAllDay: droppedOnAllDaySlot }) => {
    const updatedEvent = { ...event, start, end, allDay: droppedOnAllDaySlot }
    setEvents(events =>
      events.map(e => (e.id === event.id ? updatedEvent : e))
    )
  }

  const resizeEvent = ({ event, start, end }) => {
    const updatedEvent = { ...event, start, end }
    setEvents(events =>
      events.map(e => (e.id === event.id ? updatedEvent : e))
    )
  }

  // Inline edition
  const handleDoubleClickEvent = event => {
    setEditingId(event.id)
    setEditTitle(event.title)
  }

  const handleEditChange = e => setEditTitle(e.target.value)

  const handleEditBlur = event => {
    setEvents(events =>
      events.map(ev =>
        ev.id === editingId ? { ...ev, title: editTitle } : ev
      )
    )
    setEditingId(null)
    setEditTitle('')
  }

  // Custom event rendering for inline edit and color
  const EventComponent = ({ event }) => {
    if (editingId === event.id) {
      return (
        <input
          autoFocus
          value={editTitle}
          onChange={handleEditChange}
          onBlur={handleEditBlur}
          onKeyDown={e => {
            if (e.key === 'Enter') handleEditBlur()
          }}
          className="rounded px-1 py-0.5 border border-blue-400 text-xs"
          style={{ background: '#fff' }}
        />
      )
    }
    return (
      <div
        style={{
          background: event.color || '#f43f5e',
          color: '#fff',
          borderRadius: 6,
          padding: '2px 6px',
          fontWeight: 500,
          fontSize: 13,
        }}
      >
        {event.title}
      </div>
    )
  }

  // Custom style for events (multi-calendar color)
  const eventPropGetter = event => ({
    style: {
      backgroundColor: event.color || '#f43f5e', // rose-500 par défaut
      borderRadius: '6px',
      color: '#fff',
      border: 'none',
      fontWeight: 500,
      fontSize: 13,
      boxShadow: '0 2px 8px #f43f5e22'
    }
  })

  return (
    <div style={{ background: '#f8fafc', borderRadius: 16, padding: 8 }}>
      <DragAndDropCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #f43f5e11' }}
        views={['month', 'week', 'day']}
        selectable
        messages={messages[lang]}
        culture={lang}
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        onEventDrop={moveEvent}
        onEventResize={resizeEvent}
        resizable
        components={{
          event: EventComponent
        }}
        onDoubleClickEvent={handleDoubleClickEvent}
        eventPropGetter={eventPropGetter}
      />
    </div>
  )
}
