import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { DotsVerticalIcon, PlusIcon, PlayIcon, StopIcon } from '@radix-ui/react-icons'
import { createPortal } from 'react-dom'
import Sidebar from './Sidebar'
import NewProjectModal from './NewProjectModal'
import { supabase } from '../../lib/supabase'
import { useGlobalTimer } from '../Timer/useGlobalTimer'
import ProjectMenu from './project-menu'

// Hook to detect if screen is below 820px
function useIsMobile () {
	const [isMobile, setIsMobile] = useState(
		typeof window !== 'undefined' ? window.innerWidth < 820 : false
	)
	React.useEffect(() => {
		function handleResize () {
			setIsMobile(window.innerWidth < 820)
		}
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])
	return isMobile
}

function formatSeconds (seconds) {
	if (!seconds || isNaN(seconds)) return '0h'
	const h = Math.floor(seconds / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	return h > 0 ? `${h}h${m > 0 ? ' ' + m + 'min' : ''}` : `${m}min`
}

function ProjectCard ({ project, onMenuClick, showMenu, onCloseMenu, onPlay, onStop, isPlaying, menuBtnRef }) {
	return (
		<div className='bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-3 shadow-sm flex flex-col gap-2 relative'>
			<div className='flex items-center justify-between gap-2'>
				<div className='flex items-center gap-2'>
					<button
						className={'p-2 rounded-full ' + (isPlaying ? 'bg-green-700' : 'bg-neutral-700 hover:bg-neutral-600')}
						onClick={isPlaying ? onStop : onPlay}
						aria-label={isPlaying ? 'Stop timer' : 'Start timer'}
					>
						{isPlaying ? <StopIcon /> : <PlayIcon />}
					</button>
					<div className='font-bold text-base'>{project.name}</div>
				</div>
				<button
					className='p-2 rounded hover:bg-neutral-700 focus:outline-none'
					onClick={onMenuClick}
					aria-label='Project menu'
					ref={menuBtnRef}
				>
					<DotsVerticalIcon />
				</button>
				<ProjectMenu anchorRef={menuBtnRef} open={showMenu} onClose={onCloseMenu}>
					<button className='block w-full text-left px-4 py-2 hover:bg-neutral-800'>Edit project</button>
					<button className='block w-full text-left px-4 py-2 hover:bg-neutral-800'>Add member</button>
					<button className='block w-full text-left px-4 py-2 hover:bg-neutral-800'>View in reports</button>
					<button className='block w-full text-left px-4 py-2 hover:bg-neutral-800'>Archive</button>
					<button className='block w-full text-left px-4 py-2 text-red-500 hover:bg-neutral-800'>Delete</button>
				</ProjectMenu>
			</div>
			<div className='flex flex-wrap gap-2 text-sm text-neutral-300'>
				<span className='font-semibold'>Client:</span> {project.client || '-'}
			</div>
			<div className='flex flex-wrap gap-2 text-sm'>
				<span className='font-semibold text-neutral-300'>Period:</span> {project.timeframe || '-'}
				<span className='font-semibold text-neutral-300'>Time:</span> {formatSeconds(project.total_seconds)}
			</div>
			<div className='flex flex-wrap gap-2 text-sm'>
				<span className='font-semibold text-neutral-300'>Billable status:</span> {project.billable ? 'Yes' : 'No'}
				{project.pinned && <span className='ml-2'>📌</span>}
			</div>
		</div>
	)
}

function ProjectsPageEn () {
	const [filter, setFilter] = useState('all')
	const [filters, setFilters] = useState({
		client: '',
		member: '',
		billable: '',
		name: '',
		template: '',
	})
	const [showMenuIndex, setShowMenuIndex] = useState(null)
	const [filtersOpen, setFiltersOpen] = useState(false)
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
	const [modalOpen, setModalOpen] = useState(false)
	const [newProjectLang, setNewProjectLang] = useState('en')
	const [projects, setProjects] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [userId, setUserId] = useState(null)
	const [createError, setCreateError] = useState('')
	const [editProject, setEditProject] = useState(null)
	const [showEditModal, setShowEditModal] = useState(false)
	const [confirmDelete, setConfirmDelete] = useState({ open: false, project: null })

	const navigate = useNavigate()
	const isMobile = useIsMobile()
	const timer = useGlobalTimer() || { running: false, task: null, start: () => {}, stop: () => {}, getElapsedSeconds: () => 0 }
	const menuBtnRefs = useRef([])

	useEffect(() => {
		if (projects.length !== menuBtnRefs.current.length) {
			menuBtnRefs.current = projects.map((_, i) => menuBtnRefs.current[i] || React.createRef())
		}
	}, [projects])

	React.useEffect(() => {
		async function fetchUserId () {
			const { data, error } = await supabase.auth.getUser()
			if (data && data.user) setUserId(data.user.id)
		}
		fetchUserId()
	}, [])

	const fetchProjects = useCallback(async () => {
		setLoading(true)
		setError('')
		if (!userId) {
			setProjects([])
			setLoading(false)
			return
		}
		const { data, error } = await supabase
			.from('projects')
			.select('*')
			.eq('user_id', userId)
			.order('created_at', { ascending: false })
		if (error) setError(error.message)
		if (data) setProjects(data)
		setLoading(false)
	}, [userId])

	useEffect(() => {
		fetchProjects()
	}, [fetchProjects])

	async function handleCreateProject (project, isEdit, initialProject) {
		if (!userId) {
			setCreateError('User not authenticated. Please log in again.')
			return
		}
		// Parse estimate and fixed_fee to numeric if present
		const parseNumber = val => {
			if (typeof val === 'string') {
				const match = val.match(/\d+(?:[.,]\d+)?/)
				return match ? parseFloat(match[0].replace(',', '.')) : undefined
			}
			return typeof val === 'number' ? val : undefined
		}
		// Only send fields that exist in the DB
		const payload = {
			name: project.name,
			client: project.client,
			timeframe: project.timeframe,
			recurring: project.recurring,
			estimate: parseNumber(project.estimate),
			fixed_fee: parseNumber(project.fixedFee),
			privacy: project.privacy,
			members: project.members,
			user_id: userId,
		}
		// Remove undefined keys (in case some fields are not present)
		Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key])

		if (isEdit && initialProject && initialProject.id) {
			const { error } = await supabase
				.from('projects')
				.update(payload)
				.eq('id', initialProject.id)
			if (error) {
				setCreateError('Error updating project: ' + error.message)
				return
			}
			await fetchProjects()
			setShowEditModal(false)
		} else {
			const { error } = await supabase
				.from('projects')
				.insert([payload])
			if (error) {
				setCreateError('Error creating project: ' + error.message)
				return
			}
			await fetchProjects()
			setModalOpen(false)
		}
		setCreateError('')
	}

	async function handlePlay(project) {
		if (!timer) return
		if (timer.running && timer.task?.id !== project.id) {
			await handleStop(timer.task)
		}
		timer.start({ id: project.id, name: project.name, client: project.client }, true)
	}

	async function handleStop(project) {
		if (!timer || !timer.running || timer.task?.id !== project.id) return
		const elapsed = timer.getElapsedSeconds ? timer.getElapsedSeconds() : 0
		timer.stop()
		const current = typeof project.total_seconds === 'number' ? project.total_seconds : 0
		const newTotal = current + elapsed
		await supabase.from('projects').update({ total_seconds: newTotal }).eq('id', project.id)
		setProjects(ps => ps.map(p => p.id === project.id ? { ...p, total_seconds: newTotal } : p))
	}

	function handleEditProject (project) {
		setEditProject(project)
		setShowEditModal(true)
		setShowMenuIndex(null)
	}

	function handleAddMember (project) {
		setShowMenuIndex(null)
	}

	function handleViewReports (project) {
		navigate(`/en/dashboard/reports?project=${project.id}`)
		setShowMenuIndex(null)
	}

	async function handleArchiveProject (project) {
		await supabase.from('projects').update({ archived: true }).eq('id', project.id)
		setProjects(ps => ps.filter(p => p.id !== project.id))
		setShowMenuIndex(null)
	}

	async function handleDeleteProject (project) {
		setConfirmDelete({ open: true, project })
		setShowMenuIndex(null)
	}

	async function confirmDeleteProject () {
		const project = confirmDelete.project
		if (!project) return
		await supabase.from('projects').delete().eq('id', project.id)
		setProjects(ps => ps.filter(p => p.id !== project.id))
		setConfirmDelete({ open: false, project: null })
	}

	function cancelDeleteProject () {
		setConfirmDelete({ open: false, project: null })
	}

	return (
		<div className='flex min-h-[calc(100vh-56px)] bg-gray-900 text-white'>
			<Sidebar
				className='z-30'
				collapsed={sidebarCollapsed}
				onToggle={() => setSidebarCollapsed(v => !v)}
			/>
				<div
					className={
						'flex-1 flex flex-col w-full pt-2 pb-4 px-0 sm:pt-4 sm:pb-8 sm:px-0 transition-all duration-200 ' +
						(sidebarCollapsed ? 'ml-16' : 'ml-56')
					}
				> 
				<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between px-2 sm:px-6 py-2 sm:py-4 border-b border-neutral-800 gap-2 sm:gap-6'>
					<div className='flex items-center gap-4'>
						<h1 className='text-2xl font-bold'>Projects</h1>
						<span
							className={
								'ml-2 px-3 py-1 rounded-full font-mono text-base flex items-center gap-2 ' +
								(timer.running
									? 'bg-green-700 text-white'
									: 'bg-neutral-700 text-neutral-300')
							}
						>
							<svg width='18' height='18' fill='currentColor' viewBox='0 0 20 20' className='inline-block mr-1'>
								<rect x='6' y='5' width='2.5' height='10' rx='1'/>
								<rect x='11.5' y='5' width='2.5' height='10' rx='1'/>
							</svg>
							{formatSeconds(timer.getElapsedSeconds ? timer.getElapsedSeconds() : 0)}
							{timer.task?.name && (
								<span className='ml-2 font-semibold'>{timer.task.name}</span>
							)}
						</span>
					</div>
					<button
						className='flex items-center gap-2 px-4 py-2 bg-rose-800 hover:bg-rose-500 rounded text-white font-medium transition-colors w-full sm:w-auto justify-center'
						onClick={() => { setModalOpen(true); setNewProjectLang('en') }}
					>
						<PlusIcon />
						New project
					</button>
				</div>
				<div className='flex flex-col gap-4 px-2 sm:px-6 py-2 sm:py-4'>
					<div className='block md:hidden'>
						<button
							onClick={() => setFiltersOpen(!filtersOpen)}
							className='mb-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded text-white font-medium w-full flex items-center justify-between'
							aria-expanded={filtersOpen}
						>
							<span className='flex items-center gap-2'>
								Filters
								<svg className='inline ml-1' width='16' height='16' fill='currentColor' viewBox='0 0 20 20'><path d='M5.23 7.21a1 1 0 0 1 1.42 0L10 10.59l3.35-3.38a1 1 0 1 1 1.42 1.42l-4.06 4.06a1 1 0 0 1-1.42 0L5.23 8.63a1 1 0 0 1 0-1.42z'/></svg>
							</span>
							<span className={'transition-transform duration-200 ' + (filtersOpen ? 'rotate-180' : '')}>
								<svg width='18' height='18' fill='currentColor' viewBox='0 0 20 20'><path d='M5.23 7.21a1 1 0 0 1 1.42 0L10 10.59l3.35-3.38a1 1 0 1 1 1.42 1.42l-4.06 4.06a1 1 0 0 1-1.42 0L5.23 8.63a1 1 0 0 1 0-1.42z'/></svg>
							</span>
						</button>
						{filtersOpen && (
							<div className='flex flex-col gap-2 p-4 bg-neutral-800 rounded shadow-lg border border-neutral-700 mb-2'>
								<select
									className='bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm w-full'
									value={filter}
									onChange={e => setFilter(e.target.value)}
								>
									<option value='all'>Show all except archived</option>
									<option value='archived'>Archived</option>
									<option value='active'>Active</option>
								</select>
								<input placeholder='Client' className='bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm w-full' value={filters.client} onChange={e => setFilters(f => ({ ...f, client: e.target.value }))} />
								<input placeholder='Member' className='bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm w-full' value={filters.member} onChange={e => setFilters(f => ({ ...f, member: e.target.value }))} />
								<input placeholder='Billable' className='bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm w-full' value={filters.billable} onChange={e => setFilters(f => ({ ...f, billable: e.target.value }))} />
								<input placeholder='Project name' className='bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm w-full' value={filters.name} onChange={e => setFilters(f => ({ ...f, name: e.target.value }))} />
								<input placeholder='Template' className='bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm w-full' value={filters.template} onChange={e => setFilters(f => ({ ...f, template: e.target.value }))} />
							</div>
						)}
					</div>
					<div className='hidden md:flex flex-row flex-wrap items-center gap-2 md:gap-4'>
						<select
							className='bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm w-full md:w-auto'
							value={filter}
							onChange={e => setFilter(e.target.value)}
						>
							<option value='all'>Show all except archived</option>
							<option value='archived'>Archived</option>
							<option value='active'>Active</option>
						</select>
						<span className='font-semibold text-sm'>Filters</span>
						<input placeholder='Client' className='bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm w-full md:w-auto' value={filters.client} onChange={e => setFilters(f => ({ ...f, client: e.target.value }))} />
						<input placeholder='Member' className='bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm w-full md:w-auto' value={filters.member} onChange={e => setFilters(f => ({ ...f, member: e.target.value }))} />
						<input placeholder='Billable' className='bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm w-full md:w-auto' value={filters.billable} onChange={e => setFilters(f => ({ ...f, billable: e.target.value }))} />
						<input placeholder='Project name' className='bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm w-full md:w-auto' value={filters.name} onChange={e => setFilters(f => ({ ...f, name: e.target.value }))} />
						<input placeholder='Template' className='bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm w-full md:w-auto' value={filters.template} onChange={e => setFilters(f => ({ ...f, template: e.target.value }))} />
					</div>
					{loading ? (
						<div className='text-center py-8 text-neutral-500'>Loading...</div>
					) : error ? (
						<div className='text-center py-8 text-red-500'>{error}</div>
					) : isMobile ? (
						<div className='flex flex-col gap-2 mt-2'>
							{projects.length === 0 && (
								<div className='text-center py-8 text-neutral-500'>No projects</div>
							)}
							{projects.map((project, i) => (
								<ProjectCard
									key={project.id}
									project={project}
									onMenuClick={() => setShowMenuIndex(i === showMenuIndex ? null : i)}
									showMenu={showMenuIndex === i}
									onCloseMenu={() => setShowMenuIndex(null)}
									onPlay={() => handlePlay(project)}
									onStop={() => handleStop(project)}
									isPlaying={timer.running && timer.task?.id === project.id}
									menuBtnRef={menuBtnRefs.current[i]}
								/>
							))}
						</div>
					) : (
						<div className='overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-900 mt-2'>
							<table className='w-full table-fixed text-sm'>
								<thead>
									<tr className='bg-neutral-900'>
										<th className='px-2 py-2 text-left w-10'></th>{/* Timer button column */}
										<th className='px-4 py-2 text-left whitespace-nowrap w-80'>Project</th>
										<th className='px-4 py-2 text-left whitespace-nowrap w-60'>Client</th>
										<th className='px-4 py-2 text-left whitespace-nowrap w-60'>Period</th>
										<th className='px-4 py-2 text-left whitespace-nowrap w-30'>Time</th>
										<th className='px-4 py-2 text-left whitespace-nowrap w-40'>Billable status</th>
										<th className='px-4 py-2 text-left whitespace-nowrap w-60'>Team</th>
										<th className='px-4 py-2 text-left whitespace-nowrap'></th>
									</tr>
								</thead>
								<tbody>
									{projects.length === 0 && (
										<tr>
											<td colSpan={8} className='text-center py-8 text-neutral-500'>No projects</td>
										</tr>
									)}
									{projects.map((project, i) => (
										<tr key={project.id} className='border-b border-neutral-800 hover:bg-neutral-800 group'>
											<td className='px-2 py-2'>
												<button
													className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-150 ${timer.running && timer.task?.id === project.id ? 'bg-green-700 text-white' : 'bg-neutral-800 text-white hover:bg-neutral-700'}`}
													aria-label={timer.running && timer.task?.id === project.id ? 'Stop timer' : 'Start timer'}
													onClick={() => timer.running && timer.task?.id === project.id ? handleStop(project) : handlePlay(project)}
												>
													{timer.running && timer.task?.id === project.id ? (
														<svg width='18' height='18' fill='currentColor' viewBox='0 0 20 20'><rect x='6' y='5' width='2.5' height='10' rx='1'/><rect x='11.5' y='5' width='2.5' height='10' rx='1'/></svg>
													) : (
														<svg width='18' height='18' fill='currentColor' viewBox='0 0 20 20'><circle cx='10' cy='10' r='9' fill='none' stroke='currentColor' strokeWidth='2'/><polygon points='8,6 15,10 8,14' fill='currentColor'/></svg>
													)}
												</button>
											</td>
											<td className='px-4 py-2 break-words'>{project.name}</td>
											<td className='px-4 py-2 break-words'>{project.client || '-'}</td>
											<td className='px-4 py-2 break-words'>{project.timeframe || '-'}</td>
											<td className='px-4 py-2 break-words'>{formatSeconds(project.total_seconds)}</td>
											<td className='px-4 py-2 break-words'>{project.billable ? 'Yes' : 'No'}</td>
											<td className='px-4 py-2 break-words'>{Array.isArray(project.members) ? project.members.join(', ') : (project.members || '-')}</td>
											<td className='px-4 py-2 break-words'>{project.pinned ? '📌' : ''}</td>
											<td className='px-4 py-2 text-right relative'>
												<div className='flex justify-end items-center w-full'>
													<button
														className='p-2 rounded hover:bg-neutral-700 focus:outline-none'
														onClick={() => setShowMenuIndex(i === showMenuIndex ? null : i)}
														ref={menuBtnRefs.current[i]}
													>
														<DotsVerticalIcon />
													</button>
													<ProjectMenu anchorRef={menuBtnRefs.current[i]} open={showMenuIndex === i} onClose={() => setShowMenuIndex(null)}>
														<button className='block w-full text-left px-4 py-2 hover:bg-neutral-800' onClick={() => handleEditProject(project)}>Edit project</button>
														<button className='block w-full text-left px-4 py-2 hover:bg-neutral-800' onClick={() => handleAddMember(project)}>Add member</button>
														<button className='block w-full text-left px-4 py-2 hover:bg-neutral-800' onClick={() => handleViewReports(project)}>View in reports</button>
														<button className='block w-full text-left px-4 py-2 hover:bg-neutral-800' onClick={() => handleArchiveProject(project)}>Archive</button>
														<button className='block w-full text-left px-4 py-2 text-red-500 hover:bg-neutral-800' onClick={() => handleDeleteProject(project)}>Delete</button>
													</ProjectMenu>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
					{createError && (
						<div className='text-red-500 text-sm mt-2'>{createError}</div>
					)}
				</div>
				<NewProjectModal
					open={modalOpen}
					onClose={() => setModalOpen(false)}
					onCreate={project => handleCreateProject(project, false)}
					lang={newProjectLang}
				/>
				{showEditModal && editProject && (
					<NewProjectModal
						open={showEditModal}
						onClose={() => setShowEditModal(false)}
						onCreate={project => handleCreateProject(project, true, editProject)}
						lang='en'
						initialProject={editProject}
						isEdit
					/>
				)}
				{confirmDelete.open && (
					<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
						<div className='bg-white text-black rounded-xl shadow-xl max-w-md w-full p-6 relative animate-fade-in'>
							<h2 className='text-xl font-bold mb-4'>Delete project</h2>
							<p>Do you really want to delete the project <span className='font-semibold'>{confirmDelete.project?.name}</span>? This action cannot be undone.</p>
							<div className='flex gap-4 mt-6 justify-end'>
								<button className='px-4 py-2 rounded bg-neutral-200 hover:bg-neutral-300' onClick={cancelDeleteProject}>Cancel</button>
								<button className='px-4 py-2 rounded bg-rose-600 text-white hover:bg-rose-700' onClick={confirmDeleteProject}>Delete</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default ProjectsPageEn
