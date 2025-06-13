import React, { useState, useRef } from 'react'
import { Dialog } from '@headlessui/react'
import { Transition } from '@headlessui/react'
import { PlusIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

// MiniCalendar component (adapted from AddTaskModal.jsx)
function MiniCalendar({ value, onChange, lang = 'fr' }) {
  const [month, setMonth] = useState(value ? value.getMonth() : new Date().getMonth())
  const [year, setYear] = useState(value ? value.getFullYear() : new Date().getFullYear())
  const today = new Date()
  const startOfMonth = new Date(year, month, 1)
  const endOfMonth = new Date(year, month + 1, 0)
  const startDay = (startOfMonth.getDay() + 6) % 7 // lundi = 0
  const daysInMonth = endOfMonth.getDate()
  const weeks = []
  let week = []
  for (let i = 0; i < startDay; i++) week.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(new Date(year, month, d))
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }
  const daysShort = lang === 'fr'
    ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return (
    <div className='bg-white rounded-lg shadow p-3 mt-2 z-50'>
      <div className='flex justify-between items-center mb-2'>
        <button
          onClick={() => {
            if (month === 0) {
              setMonth(11)
              setYear(y => y - 1)
            } else setMonth(m => m - 1)
          }}
          className='px-2 py-1 text-gray-500 hover:text-blue-700'
        >{'<'}</button>
        <span className='font-semibold text-sm text-neutral-900'>
          {new Date(year, month).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'long' })} {year}
        </span>
        <button
          onClick={() => {
            if (month === 11) {
              setMonth(0)
              setYear(y => y + 1)
            } else setMonth(m => m + 1)
          }}
          className='px-2 py-1 text-gray-500 hover:text-blue-700'
        >{'>'}</button>
      </div>
      <div className='grid grid-cols-7 gap-1 text-xs text-center'>
        {daysShort.map(d => (
          <span key={d} className='font-bold text-gray-400'>{d}</span>
        ))}
        {weeks.flat().map((d, i) =>
          d ? (
            <button
              key={i}
              onClick={() => onChange(d)}
              className={`rounded-full w-7 h-7 ${
                value && d.toDateString() === value.toDateString()
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-blue-100 text-gray-700'
              }`}
            >
              {d.getDate()}
            </button>
          ) : (
            <span key={i} />
          )
        )}
      </div>
    </div>
  )
}

function NewProjectModal({ open, onClose, onCreate, lang = 'fr', initialProject, isEdit }) {
  const [name, setName] = useState(initialProject?.name || '')
  const [nameError, setNameError] = useState('')
  const [periodError, setPeriodError] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  // Parse timeframe if present
  const initialStart = initialProject?.timeframe?.split(' - ')[0]
  const initialEnd = initialProject?.timeframe?.split(' - ')[1]
  const [startDate, setStartDate] = useState(initialStart ? new Date(initialStart) : null)
  const [endDate, setEndDate] = useState(initialEnd && initialEnd !== 'Pas de date de fin' && initialEnd !== 'No end date' ? new Date(initialEnd) : null)
  const [recurring, setRecurring] = useState(initialProject?.recurring || false)
  const [estimate, setEstimate] = useState(initialProject?.estimate || '')
  const [billable, setBillable] = useState(initialProject?.billable || false)
  const [fixedFee, setFixedFee] = useState(initialProject?.fixedFee || false)
  const [privacy, setPrivacy] = useState(initialProject?.privacy || false)
  const [access, setAccess] = useState(initialProject?.access || 'regular')
  const startRef = useRef()
  const endRef = useRef()

  const t = lang === 'en' ? {
    title: isEdit ? 'Edit project' : 'Create new project',
    name: 'Project name',
    nameRequired: 'Please enter a Project name',
    privacy: 'Private, visible only to project members',
    access: 'Access',
    regular: 'Regular member',
    advanced: 'ADVANCED OPTIONS',
    period: 'Period',
    start: 'Start date',
    end: 'End date',
    noEnd: 'No end date',
    recurring: 'Recurring',
    estimate: 'Time estimate',
    create: isEdit ? 'Edit project' : 'Create project',
  } : {
    title: isEdit ? 'Éditer un projet' : 'Créer un projet',
    name: 'Nom du projet',
    nameRequired: 'Veuillez entrer un nom de projet',
    privacy: 'Privé, visible uniquement par les membres du projet',
    access: 'Accès',
    regular: 'Membre régulier',
    advanced: 'OPTIONS AVANCÉES',
    period: 'Période',
    start: 'Date de début',
    end: 'Date de fin',
    noEnd: 'Pas de date de fin',
    recurring: 'Récurrent',
    estimate: 'Estimation du temps',
    create: isEdit ? 'Éditer le projet' : 'Créer le projet',
  }

  function handleCreate(e) {
    e.preventDefault()
    let hasError = false
    if (!/^.{2,}/.test(name.trim())) {
      setNameError(t.nameRequired)
      hasError = true
    } else {
      setNameError('')
    }
    if (startDate && endDate && endDate < startDate) {
      setPeriodError(lang === 'fr' ? 'La date de fin doit être après la date de début' : 'End date must be after start date')
      hasError = true
    } else {
      setPeriodError('')
    }
    if (!startDate) {
      setPeriodError(lang === 'fr' ? 'Veuillez choisir une date de début' : 'Please select a start date')
      hasError = true
    }
    if (hasError) return
    onCreate({
      name,
      timeframe: startDate ? (endDate ? `${startDate.toISOString().slice(0,10)} - ${endDate.toISOString().slice(0,10)}` : `${startDate.toISOString().slice(0,10)} - ${t.noEnd}`) : '',
      recurring,
      estimate,
      billable,
      fixedFee,
      privacy,
      access,
    })
    setName('')
    setStartDate(null)
    setEndDate(null)
    setRecurring(false)
    setEstimate('')
    setBillable(false)
    setFixedFee(false)
    setPrivacy(false)
    setAccess('regular')
    onClose()
  }

  function formatDate(date) {
    if (!date) return ''
    return date.toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA')
  }

  return (
    <Transition show={open} as={React.Fragment}>
      <Dialog as='div' className='fixed inset-0 z-50 flex items-center justify-center' onClose={onClose} static>
        <Transition.Child
          as={React.Fragment}
          enter='ease-out duration-200'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-150'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black/60 pointer-events-none' aria-hidden='true' />
        </Transition.Child>
        <Transition.Child
          as={React.Fragment}
          enter='ease-out duration-200'
          enterFrom='scale-95 opacity-0'
          enterTo='scale-100 opacity-100'
          leave='ease-in duration-150'
          leaveFrom='scale-100 opacity-100'
          leaveTo='scale-95 opacity-0'
        >
          <Dialog.Panel className='w-full max-w-md mx-auto rounded-xl bg-neutral-900 p-6 shadow-xl border border-neutral-700 text-white relative z-10'>
            <Dialog.Title className='text-lg font-bold mb-4'>{t.title}</Dialog.Title>
            <form onSubmit={handleCreate} className='flex flex-col gap-4'>
              <div className='mb-2' />
              <div>
                <label className='block text-sm font-medium mb-1'>{t.name}</label>
                <input
                  type='text'
                  className={'w-full rounded border px-3 py-2 bg-neutral-800 border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-600 ' + (nameError ? 'border-red-500' : '')}
                  value={name}
                  onChange={e => { setName(e.target.value); setNameError('') }}
                  placeholder={t.name}
                />
                {nameError && <div className='text-xs text-red-500 mt-1'>{nameError}</div>}
              </div>
              <div className='flex items-center gap-2'>
                <label className='text-sm'>{t.privacy}</label>
                <input type='checkbox' checked={privacy} onChange={e => setPrivacy(e.target.checked)} className='accent-primary-600' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>{t.period}</label>
                <div className='flex gap-2 items-center'>
                  <div className='relative w-full'>
                    <button
                      type='button'
                      ref={startRef}
                      className='w-full rounded border px-3 py-2 bg-neutral-800 border-neutral-700 text-left text-white'
                    >
                      {startDate ? formatDate(startDate) : t.start}
                    </button>
                  </div>
                  <span>-</span>
                  <div className='relative w-full'>
                    <button
                      type='button'
                      ref={endRef}
                      className='w-full rounded border px-3 py-2 bg-neutral-800 border-neutral-700 text-left text-white'
                      disabled={!startDate}
                    >
                      {endDate ? formatDate(endDate) : t.end}
                    </button>
                  </div>
                </div>
                {periodError && <div className='text-xs text-red-500 mt-1'>{periodError}</div>}
              </div>
              <div className='flex items-center gap-2'>
                <label className='text-sm'>{t.recurring}</label>
                <input type='checkbox' checked={recurring} onChange={e => setRecurring(e.target.checked)} className='accent-primary-600' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>{t.estimate}</label>
                <input type='text' className='w-full rounded border px-3 py-2 bg-neutral-800 border-neutral-700' value={estimate} onChange={e => setEstimate(e.target.value)} placeholder='ex: 20h' />
              </div>
              <button type='submit' className='mt-4 w-full py-2 rounded bg-rose-800 hover:bg-rose-500 font-semibold text-white transition-colors'>{t.create}</button>
            </form>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  )
}

export default NewProjectModal
