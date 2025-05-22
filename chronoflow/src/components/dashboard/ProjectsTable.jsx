import React from 'react'
import ProjectCard from './ProjectCard'

function ProjectsTable ({ projects, timer, onPlay, onStop, onMenuClick, showMenuIndex, onCloseMenu, isMobile, menuBtnRefs }) {
	if (isMobile) {
		return (
			<div className='flex flex-col gap-2 mt-2'>
				{projects.length === 0 && (
					<div className='text-center py-8 text-neutral-500'>Aucun projet</div>
				)}
				{projects.map((project, i) => (
					<ProjectCard
						key={project.id}
						project={project}
						onMenuClick={() => onMenuClick(i)}
						showMenu={showMenuIndex === i}
						onCloseMenu={onCloseMenu}
						onPlay={() => onPlay(project)}
						onStop={() => onStop(project)}
						isPlaying={timer.running && timer.task?.id === project.id}
						menuBtnRef={menuBtnRefs[i]}
					/>
				))}
			</div>
		)
	}
	// Table desktop
	return (
		<div className='overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-900 mt-2'>
			<table className='w-full table-fixed text-sm'>
				<thead>
					<tr className='bg-neutral-900'>
						<th className='px-2 py-2 text-left w-10'></th>
						<th className='px-4 py-2 text-left whitespace-nowrap w-80'>Projet</th>
						<th className='px-4 py-2 text-left whitespace-nowrap w-60'>Client</th>
						<th className='px-4 py-2 text-left whitespace-nowrap w-60'>Période</th>
						<th className='px-4 py-2 text-left whitespace-nowrap w-30'>Temps</th>
						<th className='px-4 py-2 text-left whitespace-nowrap w-40'>Facturable</th>
						<th className='px-4 py-2 text-left whitespace-nowrap w-50'>Équipe</th>
						<th className='px-4 py-2 text-left whitespace-nowrap'></th>
					</tr>
				</thead>
				<tbody>
					{projects.length === 0 && (
						<tr>
							<td colSpan={8} className='text-center py-8 text-neutral-500'>Aucun projet</td>
						</tr>
					)}
					{projects.map((project, i) => (
						<tr key={project.id} className='border-b border-neutral-800 hover:bg-neutral-800 group'>
							<td className='px-2 py-2'>
								<button
									className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-150 ${timer.running && timer.task?.id === project.id ? 'bg-green-700 text-white' : 'bg-neutral-800 text-white hover:bg-neutral-700'}`}
									aria-label={timer.running && timer.task?.id === project.id ? 'Arrêter le timer' : 'Démarrer le timer'}
									onClick={() => timer.running && timer.task?.id === project.id ? onStop(project) : onPlay(project)}
								>
									{timer.running && timer.task?.id === project.id ? (
										<svg width='18' height='18' fill='currentColor' viewBox='0 0 20 20'><rect x='6' y='5' width='2.5' height='10' rx='1'/><rect x='11.5' y='5' width='2.5' height='10' rx='1'/></svg>
									) : (
										<svg width='18' height='18' fill='currentColor' viewBox='0 0 20 20'><circle cx='10' cy='10' r='9' fill='none' stroke='currentColor' strokeWidth='2'/><polygon points='8,6 15,10 8,14' fill='currentColor'/></svg>
									)}
								</button>
							</td>
							<td className='px-4 py-2 break-words font-bold'>{project.name}</td>
							<td className='px-4 py-2 break-words'>{project.client || '-'}</td>
							<td className='px-4 py-2 break-words'>{project.timeframe || '-'}</td>
							<td className='px-4 py-2 break-words'>{project.total_seconds}</td>
							<td className='px-4 py-2 break-words'>{project.billable ? 'Oui' : 'Non'}</td>
							<td className='px-4 py-2 break-words'>{Array.isArray(project.members) ? project.members.join(', ') : (project.members || '-')}</td>
							<td className='px-4 py-2 break-words'>{project.pinned ? '📌' : ''}</td>
							<td className='px-4 py-2 text-right relative'>
								<button
									className='p-2 rounded hover:bg-neutral-700 focus:outline-none'
									onClick={() => onMenuClick(i)}
									ref={menuBtnRefs[i]}
								>
									{/* Menu contextuel */}
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

export default ProjectsTable
