import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { fr, enUS } from 'date-fns/locale'
import { useTranslation } from '../../hooks/useTranslation'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useMemo } from 'react'
import { format, parse, startOfWeek, getDay } from 'date-fns'

const locales = {
  fr: fr,
  en: enUS,
}

export default function ChronoCalendar({ events, onSelectEvent, onSelectSlot }) {
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

  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 600, background: '#fff' }}
      views={['month', 'week', 'day']}
      selectable
      onSelectEvent={onSelectEvent}
      onSelectSlot={onSelectSlot}
      // Personnalisation à venir
    />
  )
}
