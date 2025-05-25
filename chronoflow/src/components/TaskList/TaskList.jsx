import React, { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import { useTranslation } from '../../hooks/useTranslation'
import { useGlobalTimer } from '../Timer/useGlobalTimer'
import AddTaskModal from '../dashboard/AddTaskModal'
import './TaskList.css'

export default function TaskList({ user }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language.startsWith('en') ? 'en' : 'fr'
  const locale = lang === 'fr' ? fr : enUS
  const timer = useGlobalTimer()
  
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [sortField, setSortField] = useState('start')
  const [sortDirection, setSortDirection] = useState('asc')

  // Fetch tasks from Supabase
  const fetchTasks = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('start', { ascending: true })
      
      if (error) {
        setErrorMessage('Erreur lors du chargement des tâches: ' + error.message)
        setTasks([])
      } else {
        setTasks(data || [])
        setErrorMessage('')
      }
    } catch (err) {
      setErrorMessage('Erreur de connexion: ' + err.message)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Handle task updates
  const handleUpdateTask = async (task) => {
    if (!user) return
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: task.title,
          description: task.desc || '',
          start: task.start,
          end: task.end,
          color: task.color || 'blue',
          is_finished: !!task.is_finished,
          duration_seconds: task.duration_seconds || 0,
        })
        .eq('id', task.id)
      
      if (error) {
        setErrorMessage('Erreur lors de la modification: ' + error.message)
        return
      }
      
      await fetchTasks()
      setEditTask(null)
      setErrorMessage('')
    } catch (err) {
      setErrorMessage('Erreur lors de la modification: ' + err.message)
    }
  }

  // Handle task deletion
  const handleDeleteTask = async (task) => {
    if (!user) return
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id)
      
      if (error) {
        setErrorMessage('Erreur lors de la suppression: ' + error.message)
        return
      }
      
      await fetchTasks()
      setEditTask(null)
      setErrorMessage('')
    } catch (err) {
      setErrorMessage('Erreur lors de la suppression: ' + err.message)
    }
  }

  // Toggle task completion
  const handleToggleComplete = async (task, event) => {
    event.stopPropagation() // Prevent row click
    await handleUpdateTask({
      ...task,
      is_finished: !task.is_finished
    })
  }

  // Handle start/stop timer
  const handleTimerAction = (task, event) => {
    event.stopPropagation() // Prevent row click
    if (timer.isRunning && timer.activeTask?.id === task.id) {
      timer.stopTimer()
    } else {
      timer.startTimer(task)
    }
  }
  // Handle row click to edit task (only for content areas, not buttons)
  const handleRowClick = (task, event) => {
    // Check if the click came from a button or interactive element
    if (event.target.closest('button') || event.target.closest('.status-checkbox') || event.target.closest('.timer-button')) {
      return
    }
    
    setEditTask({
      ...task,
      desc: task.description
    })
  }

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Sort tasks
  const sortedTasks = [...tasks].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]
    
    if (sortField === 'start' || sortField === 'end') {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return '0h 0m'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  // Format date and time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return format(date, 'dd/MM/yyyy HH:mm', { locale })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return format(date, 'HH:mm', { locale })
  }

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h2 className="task-list-title">
          {t('tasks.list', 'Liste des tâches')} ({tasks.length})
        </h2>
        <button 
          onClick={fetchTasks}
          className="refresh-button"
          disabled={loading}
          title={t('common.refresh', 'Actualiser')}
        >
          🔄
        </button>
      </div>

      {loading && (
        <div className="loading-message">
          {t('common.loading', 'Chargement...')}
        </div>
      )}

      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}      {!loading && tasks.length === 0 ? (
        <div className="empty-message">
          {t('tasks.empty', 'Aucune tâche trouvée')}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="task-table-container">
            <table className="task-table">
              <thead>
                <tr>
                  <th className="col-status">
                    <span>{t('tasks.status', 'Statut')}</span>
                  </th>
                  <th 
                    className="col-title sortable"
                    onClick={() => handleSort('title')}
                  >
                    <span>
                      {t('tasks.title', 'Titre')}
                      {sortField === 'title' && (
                        <span className="sort-indicator">
                          {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                        </span>
                      )}
                    </span>
                  </th>
                  <th 
                    className="col-start sortable"
                    onClick={() => handleSort('start')}
                  >
                    <span>
                      {t('tasks.start', 'Début')}
                      {sortField === 'start' && (
                        <span className="sort-indicator">
                          {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                        </span>
                      )}
                    </span>
                  </th>
                  <th 
                    className="col-end sortable"
                    onClick={() => handleSort('end')}
                  >
                    <span>
                      {t('tasks.end', 'Fin')}
                      {sortField === 'end' && (
                        <span className="sort-indicator">
                          {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                        </span>
                      )}
                    </span>
                  </th>
                  <th 
                    className="col-duration sortable"
                    onClick={() => handleSort('duration_seconds')}
                  >
                    <span>
                      {t('tasks.duration', 'Durée')}
                      {sortField === 'duration_seconds' && (
                        <span className="sort-indicator">
                          {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                        </span>
                      )}
                    </span>
                  </th>
                  <th className="col-actions">
                    <span>{t('tasks.actions', 'Actions')}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedTasks.map((task) => (
                  <tr 
                    key={task.id}
                    className={`task-row ${task.is_finished ? 'completed' : ''}`}
                    onClick={(e) => handleRowClick(task, e)}
                  >
                    <td className="col-status">
                      <button
                        className={`status-checkbox ${task.is_finished ? 'checked' : ''}`}
                        onClick={(e) => handleToggleComplete(task, e)}
                        title={task.is_finished ? t('tasks.markIncomplete', 'Marquer comme non terminé') : t('tasks.markComplete', 'Marquer comme terminé')}
                      >
                        {task.is_finished ? '✓' : ''}
                      </button>
                    </td>
                    <td className="col-title">
                      <div className="task-title-container">
                        <div 
                          className="task-color-indicator"
                          style={{ backgroundColor: task.color || '#2563eb' }}
                        ></div>
                        <span className="task-title" title={task.title}>
                          {task.title}
                        </span>
                      </div>
                      {task.description && (
                        <div className="task-description" title={task.description}>
                          {task.description}
                        </div>
                      )}
                    </td>
                    <td className="col-start">
                      <span className="datetime-full">
                        {formatDateTime(task.start)}
                      </span>
                      <span className="time-only">
                        {formatTime(task.start)}
                      </span>
                    </td>
                    <td className="col-end">
                      <span className="datetime-full">
                        {formatDateTime(task.end)}
                      </span>
                      <span className="time-only">
                        {formatTime(task.end)}
                      </span>
                    </td>
                    <td className="col-duration">
                      {formatDuration(task.duration_seconds)}
                    </td>
                    <td className="col-actions">
                      <button
                        className={`timer-button ${timer.isRunning && timer.activeTask?.id === task.id ? 'active' : ''}`}
                        onClick={(e) => handleTimerAction(task, e)}
                        title={
                          timer.isRunning && timer.activeTask?.id === task.id
                            ? t('timer.stop', 'Arrêter')
                            : t('timer.start', 'Démarrer')
                        }
                      >
                        {timer.isRunning && timer.activeTask?.id === task.id ? '⏸️' : '▶️'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="task-mobile-container">
            {sortedTasks.map((task) => (
              <div 
                key={task.id}
                className={`task-mobile-card ${task.is_finished ? 'completed' : ''}`}
                onClick={(e) => handleRowClick(task, e)}
              >
                <div className="task-mobile-header">
                  <div className="task-mobile-title">
                    <div 
                      className="task-color-indicator"
                      style={{ backgroundColor: task.color || '#2563eb' }}
                    ></div>
                    <div>
                      <div className="task-title">{task.title}</div>
                      {task.description && (
                        <div className="task-description">{task.description}</div>
                      )}
                    </div>
                  </div>
                  <div className="task-mobile-actions">
                    <button
                      className={`status-checkbox ${task.is_finished ? 'checked' : ''}`}
                      onClick={(e) => handleToggleComplete(task, e)}
                      title={task.is_finished ? t('tasks.markIncomplete', 'Marquer comme non terminé') : t('tasks.markComplete', 'Marquer comme terminé')}
                    >
                      {task.is_finished ? '✓' : ''}
                    </button>
                    <button
                      className={`timer-button ${timer.isRunning && timer.activeTask?.id === task.id ? 'active' : ''}`}
                      onClick={(e) => handleTimerAction(task, e)}
                      title={
                        timer.isRunning && timer.activeTask?.id === task.id
                          ? t('timer.stop', 'Arrêter')
                          : t('timer.start', 'Démarrer')
                      }
                    >
                      {timer.isRunning && timer.activeTask?.id === task.id ? '⏸️' : '▶️'}
                    </button>
                  </div>
                </div>
                <div className="task-mobile-details">
                  <div className="task-mobile-detail">
                    <div className="task-mobile-detail-label">{t('tasks.start', 'Début')}</div>
                    <div>{formatTime(task.start)}</div>
                  </div>
                  <div className="task-mobile-detail">
                    <div className="task-mobile-detail-label">{t('tasks.end', 'Fin')}</div>
                    <div>{formatTime(task.end)}</div>
                  </div>
                  <div className="task-mobile-detail">
                    <div className="task-mobile-detail-label">{t('tasks.duration', 'Durée')}</div>
                    <div>{formatDuration(task.duration_seconds)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {editTask && (
        <AddTaskModal
          open={!!editTask}
          initialStart={new Date(editTask.start)}
          initialEnd={new Date(editTask.end)}
          initialTitle={editTask.title}
          initialDesc={editTask.desc}
          initialColor={editTask.color}
          onClose={() => setEditTask(null)}
          onSave={(task) => handleUpdateTask({ ...editTask, ...task })}
          showDelete
          onDelete={() => handleDeleteTask(editTask)}
        />
      )}
    </div>
  )
}
