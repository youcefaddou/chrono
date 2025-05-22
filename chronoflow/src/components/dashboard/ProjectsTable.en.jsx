import React, { useEffect, useState } from 'react'
import ProjectCardEn from './ProjectCard.en'

// Helper to format seconds as hh:mm:ss
function formatSeconds (seconds) {
	if (!seconds || isNaN(seconds)) return '00:00:00'
	const h = Math.floor(seconds / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	const s = seconds % 60
	return [
		h.toString().padStart(2, '0'),
		m.toString().padStart(2, '0'),
		s.toString().padStart(2, '0'),
	].join(':')
}

function ProjectsTableEn ({
	projects,
	timer,
	onPlay,
	onStop,
	onMenuClick,
	showMenuIndex,
	onCloseMenu,
	isMobile,
	menuBtnRefs,
}) {
	// State for live timer display
	const [liveSeconds, setLiveSeconds] = useState(0)

	useEffect(() => {
		if (timer && timer.running && timer.task) {
			const start = timer.task.start_time
				? new Date(timer.task.start_time).getTime()
				: Date.now()
			const interval = setInterval(() => {
				setLiveSeconds(Math.floor((Date.now() - start) / 1000))
			}, 1000)
			return () => clearInterval(interval)
		} else {
			setLiveSeconds(0)
		}
	}, [timer && timer.running, timer && timer.task])

	if (isMobile) {
		return (
			<div className='flex flex-col gap-2 mt-2'>
				{projects.length === 0 && (
					<div className='text-center py-8 text-neutral-500'>No projects</div>
				)}
				{projects.map((project, i) => (
					<ProjectCardEn
						key={project.id}
						project={project}
						onMenuClick={() => onMenuClick(i)}
						showMenu={showMenuIndex === i}
						onCloseMenu={onCloseMenu}
						onPlay={() => onPlay(project)}
						onStop={() => onStop(project)}
						isPlaying={timer && timer.running && timer.task?.id === project.id}
						menuBtnRef={menuBtnRefs[i]}
					/>
				))}
			</div>
		)
	}
	// Desktop table
	return (
		<div className='overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-900 mt-2'>
			<table className='w-full table-fixed text-sm'>
				<thead>
					<tr className='bg-neutral-900'>
						<th className='px-2 py-2 text-left w-10'></th>
						<th className='px-4 py-2 text-left whitespace-nowrap w-80'>Project</th>
						<th className='px-4 py-2 text-left whitespace-nowrap w-60'>Client</th>
						<th className='px-4 py-2 text-left whitespace-nowrap w-60'>Period</th>
						<th className='px-4 py-2 text-left whitespace-nowrap w-30'>Time</th>
						<th className='px-4 py-2 text-left whitespace-nowrap w-40'>Billable</th>
						<th className='px-4 py-2 text-left whitespace-nowrap w-50'>Team</th>
						<th className='px-4 py-2 text-left whitespace-nowrap'></th>
					</tr>
				</thead>
				<tbody>
					{projects.length === 0 && (
						<tr>
							<td colSpan={8} className='text-center py-8 text-neutral-500'>No projects</td>
						</tr>
					)}
					{projects.map((project, i) => {
						const isPlaying = timer && timer.running && timer.task?.id === project.id
						let timeDisplay = formatSeconds(project.total_seconds)
						if (isPlaying && timer && timer.task && timer.task.start_time) {
							timeDisplay = formatSeconds(
								(project.total_seconds || 0) +
								liveSeconds
							)
						}
						return (
							<tr key={project.id} className='border-b border-neutral-800 hover:bg-neutral-800 group'>
								<td className='px-2 py-2'>
									<button
										className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-150 ${isPlaying ? 'bg-green-700 text-white' : 'bg-neutral-800 text-white hover:bg-neutral-700'}`}
										aria-label={isPlaying ? 'Stop timer' : 'Start timer'}
										onClick={() => isPlaying ? onStop(project) : onPlay(project)}
									>
										{isPlaying ? (
											<svg width='18' height='18' fill='currentColor' viewBox='0 0 20 20'><rect x='6' y='5' width='2.5' height='10' rx='1'/><rect x='11.5' y='5' width='2.5' height='10' rx='1'/></svg>
										) : (
											<svg width='18' height='18' fill='currentColor' viewBox='0 0 20 20'><circle cx='10' cy='10' r='9' fill='none' stroke='currentColor' strokeWidth='2'/><polygon points='8,6 15,10 8,14' fill='currentColor'/></svg>
										)}
									</button>
								</td>
								<td className='px-4 py-2 break-words font-bold'>{project.name}</td>
								<td className='px-4 py-2 break-words'>{project.client || '-'}</td>
								<td className='px-4 py-2 break-words'>{project.timeframe || '-'}</td>
								<td className='px-4 py-2 break-words'>{timeDisplay}</td>
								<td className='px-4 py-2 break-words'>{project.billable ? 'Yes' : 'No'}</td>
								<td className='px-4 py-2 break-words'>{Array.isArray(project.members) ? project.members.join(', ') : (project.members || '-')}</td>
								<td className='px-4 py-2 break-words'>{project.pinned ? '📌' : ''}</td>
								<td className='px-4 py-2 text-right relative'>
									<button
										className='p-2 rounded hover:bg-neutral-700 focus:outline-none'
										onClick={() => onMenuClick(i)}
										ref={menuBtnRefs[i]}
									>
										{/* Context menu */}
									</button>
								</td>
							</tr>
						)
					})}
				</tbody>
			</table>
		</div>
	)
}

export default ProjectsTableEn
