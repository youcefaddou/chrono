import React, { useState, useEffect } from 'react'
import { DotsVerticalIcon, PlayIcon, StopIcon } from '@radix-ui/react-icons'
import ProjectMenu from './project-menu'

function ProjectCardEn({
  project,
  onMenuClick,
  showMenu,
  onCloseMenu,
  onPlay,
  onStop,
  isPlaying,
  menuBtnRef,
  onEdit,
  onArchive,
  onDelete,
  liveTime,
  elapsedSeconds, // New prop to receive elapsed time from parent
}) {
  // Format seconds into HH:MM:SS
  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '00:00:00'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return [hours, minutes, secs]
      .map(v => v < 10 ? '0' + v : v)
      .join(':')
  }
  
  // Display either the elapsed time (if running) or the total time
  const displayTime = isPlaying && typeof elapsedSeconds === 'number' ? 
    formatTime(elapsedSeconds) : 
    formatTime(parseInt(project.total_seconds || 0))

  return (
    <div className='bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-3 shadow-sm flex flex-col gap-2 relative'>
      <div className='flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <button
            className={'p-2 rounded-full ' + (isPlaying ? 'bg-green-700' : 'bg-neutral-700 hover:bg-neutral-600')}
            onClick={isPlaying ? onStop : () => {
              console.log('[ProjectCardEn] Play button clicked for project:', project.id)
              onPlay && onPlay(project.id)
            }}
            aria-label={isPlaying ? 'Stop timer' : 'Start timer'}
          >
            {isPlaying ? <StopIcon /> : <PlayIcon />}
          </button>
          <div className='font-bold text-base'>{project.name}</div>
        </div>
        <div className='flex items-center gap-2 ml-auto'>
          <button
            onClick={() => { console.log('[ProjectCardEn] Menu button clicked'); onMenuClick && onMenuClick(); }}
            className='p-2 rounded hover:bg-neutral-700 focus:outline-none z-20 relative text-white border border-neutral-700 bg-neutral-800'
            aria-label='Project menu'
            ref={menuBtnRef}
            type='button'
            style={{ minWidth: 32, minHeight: 32 }}
          >
            <DotsVerticalIcon width={24} height={24} className='text-white' style={{ filter: 'drop-shadow(0 0 2px #000)' }} />
          </button>
        </div>
        <ProjectMenu anchorRef={menuBtnRef} open={showMenu} onClose={onCloseMenu}>
          <button className='block w-full text-left px-4 py-2 hover:bg-neutral-800' onClick={() => { onCloseMenu(); onEdit && onEdit(project) }}>Edit project</button>
          <button className='block w-full text-left px-4 py-2 hover:bg-neutral-800' onClick={() => { onCloseMenu(); onArchive && onArchive(project) }}>Archive</button>
          <button className='block w-full text-left px-4 py-2 text-red-500 hover:bg-neutral-800' onClick={() => { onCloseMenu(); onDelete && onDelete(project) }}>Delete</button>
        </ProjectMenu>
      </div>
      <div className='flex flex-wrap gap-2 text-sm'>
        <span className='font-semibold text-neutral-300'>Period:</span> {project.timeframe}
        <span className='font-semibold text-neutral-300'>Time:</span> {displayTime}
      </div>
    </div>
  )
}

export default ProjectCardEn
