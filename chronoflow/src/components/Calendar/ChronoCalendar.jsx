import { useTranslation } from '../../hooks/useTranslation'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useMemo, useState } from 'react'



export default function ChronoCalendar({ events: initialEvents, onSelectEvent, onSelectSlot }) {
  const { i18n } = useTranslation()
  const lang = i18n.language.startsWith('fr') ? 'fr' : 'en'

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
      <FullCalendar
        plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
        initialView="dayGridMonth"
        events={events}
        eventColor="#f43f5e"
        editable={true}
        selectable={true}
        eventClassNames={event => event.className}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        locale={lang}
        dayMaxEvents={true}
        slotDuration="00:15:00"
        eventDrop={moveEvent}
        eventResize={resizeEvent}
        select={onSelectSlot}
        eventClick={onSelectEvent}
        customButtons={{
          addEvent: {
            text: 'Ajouter un événement',
            click: () => alert('Ajouter un événement')
          }
        }}
        footerToolbar={{
          center: 'addEvent'
        }}
        eventContent={EventComponent}
        eventDidMount={info => {
          info.el.style.backgroundColor = info.event.color || '#f43f5e'
          info.el.style.borderRadius = '6px'
          info.el.style.color = '#fff'
          info.el.style.border = 'none'
          info.el.style.fontWeight = 500
          info.el.style.fontSize = '13px'
          info.el.style.boxShadow = '0 2px 8px #f43f5e22'
        }}
      />
    </div>
  )
}
