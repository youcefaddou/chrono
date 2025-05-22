import React from 'react'
import { DotsVerticalIcon, PlayIcon, StopIcon } from '@radix-ui/react-icons'
import ProjectMenu from './project-menu'

function ProjectCard ({ project, onMenuClick, showMenu, onCloseMenu, onPlay, onStop, isPlaying, menuBtnRef }) {
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
				<button
					className='p-2 rounded hover:bg-neutral-700 focus:outline-none'
					onClick={onMenuClick}
					aria-label='Menu projet'
					ref={menuBtnRef}
				>
					<DotsVerticalIcon />
				</button>
				<ProjectMenu anchorRef={menuBtnRef} open={showMenu} onClose={onCloseMenu}>
					<button className='block w-full text-left px-4 py-2 hover:bg-neutral-800'>Éditer le projet</button>
					<button className='block w-full text-left px-4 py-2 hover:bg-neutral-800'>Ajouter un membre</button>
					<button className='block w-full text-left px-4 py-2 hover:bg-neutral-800'>Voir dans les rapports</button>
					<button className='block w-full text-left px-4 py-2 hover:bg-neutral-800'>Archiver</button>
					<button className='block w-full text-left px-4 py-2 text-red-500 hover:bg-neutral-800'>Supprimer</button>
				</ProjectMenu>
			</div>
			<div className='flex flex-wrap gap-2 text-sm text-neutral-300'>
				<span className='font-semibold'>Client:</span> {project.client}
			</div>
			<div className='flex flex-wrap gap-2 text-sm'>
				<span className='font-semibold text-neutral-300'>Période:</span> {project.timeframe}
				<span className='font-semibold text-neutral-300'>Temps:</span> {project.total_seconds}
			</div>
			<div className='flex flex-wrap gap-2 text-sm'>
				<span className='font-semibold text-neutral-300'>Statut facturable:</span> {project.billable ? 'Oui' : 'Non'}
				{project.pinned && <span className='ml-2'>📌</span>}
			</div>
		</div>
	)
}

export default ProjectCard
