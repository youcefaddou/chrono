import React from 'react'
import { DotsVerticalIcon, PlayIcon, StopIcon } from '@radix-ui/react-icons'
import ProjectMenu from './project-menu'

function ProjectCard ({
	project,
	onMenuClick,
	showMenu,
	onCloseMenu,
	onPlay,
	onStop,
	isPlaying,
	menuBtnRef,
	onFinish,
	onDelete,
}) {
	return (
		<div className='bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-3 shadow-sm flex flex-col gap-2 relative'>
			<div className='flex items-center justify-between gap-2'>
				<div className='flex items-center gap-2'>
					<button
						className={'p-2 rounded-full ' + (isPlaying ? 'bg-green-700' : 'bg-neutral-700 hover:bg-neutral-600')}
						onClick={isPlaying ? onStop : onPlay}
						aria-label={isPlaying ? 'Arrêter le timer' : 'Démarrer le timer'}
					>
						{isPlaying ? <StopIcon /> : <PlayIcon />}
					</button>
					<div className='font-bold text-base'>{project.name}</div>
				</div>
				<div className='flex items-center gap-2 ml-auto'>
					<button
						onClick={onFinish}
						disabled={project.is_finished}
						className={'px-3 py-1 rounded bg-green-700 text-white text-xs ' + (project.is_finished ? 'opacity-50 cursor-not-allowed' : '')}
					>
						Terminer
					</button>
					<button
						onClick={() => onDelete && onDelete(project)}
						className='px-3 py-1 rounded bg-rose-700 text-white text-xs'
					>
						Supprimer
					</button>
					{/* Fix: force icon color and z-index, and ensure it's not hidden by parent overflow */}
					<button
						className='p-2 rounded hover:bg-neutral-700 focus:outline-none z-20 relative text-white border border-neutral-700 bg-neutral-800'
						onClick={onMenuClick}
						aria-label='Menu projet'
						ref={menuBtnRef}
						type='button'
						style={{ minWidth: 32, minHeight: 32 }}
					>
						<DotsVerticalIcon width={24} height={24} className='text-white' style={{ filter: 'drop-shadow(0 0 2px #000)' }} />
					</button>
				</div>
				<ProjectMenu anchorRef={menuBtnRef} open={showMenu} onClose={onCloseMenu}>
					<button className='block w-full text-left px-4 py-2 hover:bg-neutral-800'>Éditer le projet</button>
					<button className='block w-full text-left px-4 py-2 hover:bg-neutral-800'>Archiver</button>
					<button className='block w-full text-left px-4 py-2 text-red-500 hover:bg-neutral-800'>Supprimer</button>
				</ProjectMenu>
			</div>
		</div>
	)
}

export default ProjectCard
