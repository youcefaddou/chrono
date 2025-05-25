import React, { useEffect, useState } from 'react'
import { DotsVerticalIcon } from '@radix-ui/react-icons'
import ProjectMenu from './Projects/project-menu'

function formatTimer (seconds) {
	if (!Number.isFinite(seconds) || seconds < 0) return '00:00:00'
	const h = Math.floor(seconds / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	const s = seconds % 60
	return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

function ProjectsTableEn ({
	projects,
	projectTimer,
	onPlay,
	onStop,
	onFinish,
	handleAskDelete,
	onMenuClick,
	showMenuIndex,
	onCloseMenu,
	isMobile,
	menuBtnRefs,
	lang = 'en',
	handleEdit,
	handleArchiveProject,
	confirmDelete,
	cancelDelete,
	onConfirmDelete,
}) {
	const isFr = lang === 'fr'
	const [liveSeconds, setLiveSeconds] = useState(0)

	const isTimerRunning = projectTimer && projectTimer.isRunning
	const activeProjectId = projectTimer && projectTimer.activeProjectId

	useEffect(() => {
		if (isTimerRunning && activeProjectId) {
			const interval = setInterval(() => setLiveSeconds(s => s + 1), 1000)
			return () => clearInterval(interval)
		} else {
			setLiveSeconds(0)
		}
	}, [isTimerRunning, activeProjectId])

	const getLiveTime = project => {
		if (!projectTimer) return formatTimer(project.total_seconds)
		const isPlaying = projectTimer.isRunning && projectTimer.activeProjectId === project.id
		let total = project.total_seconds
		if (isPlaying) {
			const elapsed = projectTimer.getElapsed()
			if (!Number.isFinite(elapsed) || elapsed < 0) return '00:00:00'
			total = (project.total_seconds || 0) + elapsed
		}
		return formatTimer(total)
	}

	const isPlayingProject = project =>
		projectTimer && projectTimer.isRunning && projectTimer.activeProjectId === project.id

	const playPauseBtnClass = isPlaying =>
		`flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-150
		${isPlaying ? 'bg-yellow-500 text-white' : 'bg-green-700 text-white hover:bg-green-800'}`

	if (isMobile) {
		return (
			<>
				<div className='flex flex-col gap-2 mt-2'>
					{projects.length === 0 && (
						<div className='text-center py-8 text-neutral-500'>
							{isFr ? 'Aucun projet' : 'No projects'}
						</div>
					)}
					{projects.map((project, i) => (
						<div key={project.id} className='rounded-lg border border-neutral-800 bg-neutral-900 p-4 flex flex-col gap-2'>
							<div className='font-bold'>{project.name}</div>
							<div>Période : {project.timeframe || '-'}</div>
							<div>Temps : {getLiveTime(project)}</div>
							<div>Terminé : {project.is_finished ? (isFr ? 'Oui' : 'Yes') : (isFr ? 'Non' : 'No')}</div>
							<div className='flex gap-2 mt-2'>
								<button
									onClick={() => isPlayingProject(project) ? onStop(project) : onPlay(project)}
									disabled={project.is_finished}
									className={playPauseBtnClass(isPlayingProject(project)) + (project.is_finished ? ' opacity-50 cursor-not-allowed' : '')}
									aria-label={isPlayingProject(project) ? (isFr ? 'Pause' : 'Pause') : (isFr ? 'Démarrer' : 'Play')}
								>
									{isPlayingProject(project) ? (
										<svg width='18' height='18' fill='currentColor' viewBox='0 0 20 20'>
											<rect x='6' y='5' width='2.5' height='10' rx='1'/>
											<rect x='11.5' y='5' width='2.5' height='10' rx='1'/>
										</svg>
									) : (
										<svg width='18' height='18' fill='currentColor' viewBox='0 0 20 20'>
											<polygon points='6,4 16,10 6,16' fill='currentColor'/>
										</svg>
									)}
								</button>
								<button
									onClick={() => onFinish(project)}
									disabled={project.is_finished}
									className={`px-3 py-1 rounded bg-green-700 text-white ${project.is_finished ? 'opacity-50 cursor-not-allowed' : ''}`}
								>
									{isFr ? 'Terminer' : 'Finish'}
								</button>
								<button
									ref={menuBtnRefs && menuBtnRefs[i]}
									onClick={() => onMenuClick(i)}
									aria-label='Menu projet'
									className='p-2 rounded hover:bg-neutral-700 focus:outline-none z-20 relative text-white border border-neutral-700 bg-neutral-800'
									style={{ minWidth: 32, minHeight: 32 }}
									type='button'
								>
									<DotsVerticalIcon width={22} height={22} className='text-white' />
								</button>
								{showMenuIndex === i && (
									<ProjectMenu anchorRef={menuBtnRefs && menuBtnRefs[i]} open={showMenuIndex === i} onClose={onCloseMenu}>
										<button className='block w-full text-left px-4 py-2 hover:bg-neutral-800' onClick={() => { onCloseMenu(); handleEdit(project) }}>{isFr ? 'Éditer le projet' : 'Edit project'}</button>
										<button className='block w-full text-left px-4 py-2 hover:bg-neutral-800' onClick={() => { onCloseMenu(); handleArchiveProject(project) }}>{isFr ? 'Archiver' : 'Archive'}</button>
											<button
												className='block w-full text-left px-4 py-2 text-red-500 hover:bg-neutral-800'
												onClick={() => {
													onCloseMenu()
													if (typeof handleAskDelete === 'function') {
														handleAskDelete(project)
													} else {
														console.warn('[ProjectsTableEn] handleAskDelete is not a function', handleAskDelete)
													}
												}}
											>
												{isFr ? 'Supprimer' : 'Delete'}
											</button>
									</ProjectMenu>
								)}
							</div>
						</div>
					))}
				</div>
				{confirmDelete && confirmDelete.open && (
					<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'>
						<div className='bg-white rounded-xl shadow-xl max-w-xs w-full p-6 relative flex flex-col items-center'>
							<div className='font-bold text-lg text-rose-700 mb-2'>{isFr ? 'Supprimer le projet ?' : 'Delete project?'}</div>
							<div className='text-gray-700 mb-4 text-center'>
								{isFr
									? <>Voulez-vous vraiment supprimer <b>{confirmDelete.project?.name}</b> ? Cette action est irréversible.</>
									: <>Are you sure you want to delete <b>{confirmDelete.project?.name}</b>? This action cannot be undone.</>
								}
							</div>
							<div className='flex gap-2'>
								<button
									onClick={cancelDelete}
									className='px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold'
								>
									{isFr ? 'Annuler' : 'Cancel'}
								</button>
								<button
									onClick={onConfirmDelete}
									className='px-4 py-2 rounded bg-rose-700 text-white font-semibold'
								>
									{isFr ? 'Supprimer' : 'Delete'}
								</button>
							</div>
						</div>
					</div>
				)}
			</>
		)
	}
	// Desktop table
	return (
		<>
			<div className='overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-900 mt-2 py-2'>
				<table className='w-full table-fixed text-sm'>
					<thead>
						<tr className='bg-neutral-900'>
							<th className='px-8 py-2 text-left w-10'></th>
							<th className='px-4 py-2 text-left whitespace-nowrap w-60'>{isFr ? 'Projet' : 'Project'}</th>
							<th className='px-4 py-2 text-left whitespace-nowrap w-60'>{isFr ? 'Période' : 'Period'}</th>
							<th className='px-4 py-2 text-left whitespace-nowrap w-30'>{isFr ? 'Temps' : 'Time'}</th>
							<th className='px-4 py-2 text-left whitespace-nowrap w-20'>{isFr ? 'Terminé' : 'Finished'}</th>
							<th className='px-4 py-2 text-left whitespace-nowrap'></th>
						</tr>
					</thead>
					<tbody>
						{projects.length === 0 && (
							<tr>
								<td colSpan={9} className='text-center py-8 text-neutral-500'>
									{isFr ? 'Aucun projet' : 'No projects'}
								</td>
							</tr>
						)}
						{projects.map((project, i) => (
							<tr key={project.id} className='border-b border-neutral-800 hover:bg-neutral-800 group'>
								<td className='px-2 py-2'>
									<button
										className={playPauseBtnClass(isPlayingProject(project)) + (project.is_finished ? ' opacity-50 cursor-not-allowed' : '')}
										aria-label={isPlayingProject(project) ? (isFr ? 'Pause' : 'Pause') : (isFr ? 'Démarrer' : 'Play')}
										onClick={() => isPlayingProject(project) ? onStop(project) : onPlay(project)}
										disabled={project.is_finished}
									>
										{isPlayingProject(project) ? (
											<svg width='18' height='18' fill='currentColor' viewBox='0 0 20 20'>
												<rect x='6' y='5' width='2.5' height='10' rx='1'/>
												<rect x='11.5' y='5' width='2.5' height='10' rx='1'/>
											</svg>
										) : (
											<svg width='18' height='18' fill='currentColor' viewBox='0 0 20 20'>
												<polygon points='6,4 16,10 6,16' fill='currentColor'/>
											</svg>
										)}
									</button>
								</td>
								<td className='px-4 py-2 break-words font-bold'>{project.name}</td>
								<td className='px-4 py-2 break-words'>{project.timeframe || '-'}</td>
								<td className='px-4 py-2 break-words'>{getLiveTime(project)}</td>
								<td className='px-4 py-2 break-words'>
									{project.is_finished ? (isFr ? 'Oui' : 'Yes') : (isFr ? 'Non' : 'No')}
								</td>
								<td className='px-4 py-2 text-right relative flex gap-2'>
									<button
										onClick={() => onFinish(project)}
										disabled={project.is_finished}
										className={`px-3 py-1 rounded bg-green-700 text-white ${project.is_finished ? 'opacity-50 cursor-not-allowed' : ''}`}
									>
										{isFr ? 'Terminer' : 'Finish'}
									</button>
									<button
										ref={menuBtnRefs && menuBtnRefs[i]}
										onClick={() => onMenuClick(i)}
										aria-label='Menu projet'
										className='p-2 rounded hover:bg-neutral-700 focus:outline-none z-20 relative text-white border border-neutral-700 bg-neutral-800'
										style={{ minWidth: 32, minHeight: 32 }}
										type='button'
									>
										<DotsVerticalIcon width={22} height={22} className='text-white' />
									</button>
									{showMenuIndex === i && (
										<ProjectMenu anchorRef={menuBtnRefs && menuBtnRefs[i]} open={showMenuIndex === i} onClose={onCloseMenu}>
											<button className='block w-full text-left px-4 py-2 hover:bg-neutral-800' onClick={() => { onCloseMenu(); handleEdit(project) }}>{isFr ? 'Éditer le projet' : 'Edit project'}</button>
											<button className='block w-full text-left px-4 py-2 hover:bg-neutral-800' onClick={() => { onCloseMenu(); handleArchiveProject(project) }}>{isFr ? 'Archiver' : 'Archive'}</button>
												<button
													className='block w-full text-left px-4 py-2 text-red-500 hover:bg-neutral-800'
													onClick={() => {
														onCloseMenu()
														if (typeof handleAskDelete === 'function') {
															handleAskDelete(project)
														} else {
															console.warn('[ProjectsTableEn] handleAskDelete is not a function', handleAskDelete)
														}
													}}
												>
													{isFr ? 'Supprimer' : 'Delete'}
												</button>
										</ProjectMenu>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			{confirmDelete && confirmDelete.open && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'>
					<div className='bg-white rounded-xl shadow-xl max-w-xs w-full p-6 relative flex flex-col items-center'>
						<div className='font-bold text-lg text-rose-700 mb-2'>{isFr ? 'Supprimer le projet ?' : 'Delete project?'}</div>
						<div className='text-gray-700 mb-4 text-center'>
							{isFr
								? <>Voulez-vous vraiment supprimer <b>{confirmDelete.project?.name}</b> ? Cette action est irréversible.</>
								: <>Are you sure you want to delete <b>{confirmDelete.project?.name}</b>? This action cannot be undone.</>
							}
						</div>
						<div className='flex gap-2'>
							<button
								onClick={cancelDelete}
								className='px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold'
							>
								{isFr ? 'Annuler' : 'Cancel'}
							</button>
							<button
								onClick={onConfirmDelete}
								className='px-4 py-2 rounded bg-rose-700 text-white font-semibold'
							>
								{isFr ? 'Supprimer' : 'Delete'}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	)
}

export default ProjectsTableEn
