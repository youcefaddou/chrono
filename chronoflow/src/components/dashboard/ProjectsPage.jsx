import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { DotsVerticalIcon, PlusIcon, PlayIcon, StopIcon } from '@radix-ui/react-icons'
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

// Fonction utilitaire pour formater les secondes en h/min
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
				<span className='font-semibold text-neutral-300'>Temps:</span> {formatSeconds(project.total_seconds)}
			</div>
			<div className='flex flex-wrap gap-2 text-sm'>
				<span className='font-semibold text-neutral-300'>Statut facturable:</span> {project.billable ? 'Oui' : 'Non'}
				{project.pinned && <span className='ml-2'>📌</span>}
			</div>
		</div>
	)
}

function ProjectsPage () {
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
	const [newProjectLang, setNewProjectLang] = useState('fr')
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

	const fetchProjects = React.useCallback(async () => {
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

	React.useEffect(() => {
		fetchProjects()
	}, [fetchProjects])

	async function handleCreateProject (project, isEdit, initialProject) {
		if (!userId) {
			setCreateError('Utilisateur non authentifié. Veuillez vous reconnecter.')
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
		// On ne garde que les champs existants en base
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
		if (isEdit && initialProject && initialProject.id) {
			const { error } = await supabase
				.from('projects')
				.update(payload)
				.eq('id', initialProject.id)
			if (error) {
				setCreateError('Erreur lors de la modification du projet : ' + error.message)
				return
			}
			await fetchProjects()
			setShowEditModal(false)
		} else {
			const { error } = await supabase
				.from('projects')
				.insert([payload])
			if (error) {
				setCreateError('Erreur lors de la création du projet : ' + error.message)
				return
			}
			await fetchProjects()
			setModalOpen(false)
		}
		setCreateError('')
	}

	async function handlePlay(project) {
		if (!timer) return
		// Si un autre projet est en cours, on stoppe d'abord
		if (timer.running && timer.task?.id !== project.id) {
			await handleStop(timer.task)
		}
		timer.start({ id: project.id, name: project.name, client: project.client }, true)
	}

	async function handleStop(project) {
		if (!timer || !timer.running || timer.task?.id !== project.id) return
		const elapsed = timer.getElapsedSeconds ? timer.getElapsedSeconds() : 0
		timer.stop()
		// Met à jour le temps total dans Supabase
		const current = typeof project.total_seconds === 'number' ? project.total_seconds : 0
		const newTotal = current + elapsed
		await supabase.from('projects').update({ total_seconds: newTotal }).eq('id', project.id)
		// Met à jour localement
		setProjects(ps => ps.map(p => p.id === project.id ? { ...p, total_seconds: newTotal } : p))
	}

	function handleEditProject (project) {
		setEditProject(project)
		setShowEditModal(true)
		setShowMenuIndex(null)
	}

	function handleAddMember (project) {
		alert('Fonctionnalité à venir : Ajouter un membre au projet "' + project.name + '"')
		setShowMenuIndex(null)
	}

	function handleViewReports (project) {
		navigate(`/dashboard/reports?project=${project.id}`)
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

	// Filtrage local des projets
	const filteredProjects = projects.filter(project => {
		if (filter === 'archived' && !project.archived) return false
		if (filter === 'active' && project.archived) return false
		if (filters.client && project.client && !project.client.toLowerCase().includes(filters.client.toLowerCase())) return false
		if (filters.member && project.members && !project.members.some(m => m.toLowerCase().includes(filters.member.toLowerCase()))) return false
		if (filters.billable) {
			const billableStr = project.billable === true ? 'oui' : project.billable === false ? 'non' : ''
			if (!billableStr.includes(filters.billable.toLowerCase())) return false
		}
		if (filters.name && project.name && !project.name.toLowerCase().includes(filters.name.toLowerCase())) return false
		if (filters.template && project.template && !project.template.toLowerCase().includes(filters.template.toLowerCase())) return false
		return true
	})

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
						<h1 className='text-2xl font-bold'>Projets</h1>
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
						onClick={() => { setModalOpen(true); setNewProjectLang('fr') }}
					>
						<PlusIcon />
						Nouveau projet
					</button>
				</div>
				<div className='flex flex-col gap-4 px-2 sm:px-6 py-2 sm:py-4'>
					{/* Filtres : menu déroulant mobile, inline desktop */}
					<div className='block md:hidden'>
						<button
							onClick={() => setFiltersOpen(!filtersOpen)}
							className='mb-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded text-white font-medium w-full flex items-center justify-between'
							aria-expanded={filtersOpen}
						>
							<span className='flex items-center gap-2'>
								Filtres
								<svg className='inline ml-1' width='16' height='16' fill='currentColor' viewBox='0 0 20 20'><path d='M5.23 7.21a1 1 0 0 1 1.42 0L10 10.59l3.35-3.38a1 1 0 1 1 1.42 1.42l-4.06 4.06a1 1 0 0 1-1.42 0L5.23 8.63a1 1 0 0 1 0-1.42z'/></svg>
							</span>
							<span className={'transition-transform duration-200 ' + (filtersOpen ? 'rotate-180' : '')}>
								{/* Chevron Down from Radix UI */}
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
									<option value='all'>Afficher tout, sauf archivés</option>
									<option value='archived'>Archivés</option>
									<option value='active'>Actifs</option>
								</select>
								<input placeholder='Client' className='bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm w-full' value={filters.client} onChange={e => setFilters(f => ({ ...f, client: e.target.value }))} />
								<input placeholder='Membre' className='bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm w-full' value={filters.member} onChange={e => setFilters(f => ({ ...f, member: e.target.value }))} />
								<input placeholder='Facturable' className='bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm w-full' value={filters.billable} onChange={e => setFilters(f => ({ ...f, billable: e.target.value }))} />
								<input placeholder='Nom du projet' className='bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm w-full' value={filters.name} onChange={e => setFilters(f => ({ ...f, name: e.target.value }))} />
								<input placeholder='Modèle' className='bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm w-full' value={filters.template} onChange={e => setFilters(f => ({ ...f, template: e.target.value }))} />
							</div>
						)}
					</div>
					<div className='hidden md:flex flex-row flex-wrap items-center gap-2 md:gap-4'>
						<select
							className='bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm w-full md:w-auto'
							value={filter}
							onChange={e => setFilter(e.target.value)}
						>
							<option value='all'>Afficher tout, sauf archivés</option>
							<option value='archived'>Archivés</option>
							<option value='active'>Actifs</option>
						</select>
						<span className='font-semibold text-sm'>Filtres</span>
						<input placeholder='Client' className='bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm w-full md:w-auto' value={filters.client} onChange={e => setFilters(f => ({ ...f, client: e.target.value }))} />
						<input placeholder='Membre' className='bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm w-full md:w-auto' value={filters.member} onChange={e => setFilters(f => ({ ...f, member: e.target.value }))} />
						<input placeholder='Facturable' className='bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm w-full md:w-auto' value={filters.billable} onChange={e => setFilters(f => ({ ...f, billable: e.target.value }))} />
						<input placeholder='Nom du projet' className='bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm w-full md:w-auto' value={filters.name} onChange={e => setFilters(f => ({ ...f, name: e.target.value }))} />
						<input placeholder='Modèle' className='bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm w-full md:w-auto' value={filters.template} onChange={e => setFilters(f => ({ ...f, template: e.target.value }))} />
					</div>
					{/* Vue mobile : cartes, vue desktop : tableau */}
					{loading ? (
						<div className='text-center py-8 text-neutral-500'>Chargement...</div>
					) : error ? (
						<div className='text-center py-8 text-red-500'>{error}</div>
					) : isMobile ? (
						<div className='flex flex-col gap-2 mt-2'>
							{projects.length === 0 && (
								<div className='text-center py-8 text-neutral-500'>Aucun projet</div>
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
										<th className='px-4 py-2 text-left whitespace-nowrap w-80'>Projet</th>
										<th className='px-4 py-2 text-left whitespace-nowrap w-60'>Client</th>
										<th className='px-4 py-2 text-left whitespace-nowrap w-60'>Période</th>
										<th className='px-4 py-2 text-left whitespace-nowrap w-30'>Temps</th>
										<th className='px-4 py-2 text-left whitespace-nowrap w-40'>Facturable</th>
										<th className='px-4 py-2 text-left whitespace-nowrap w-60'>Équipe</th>
										<th className='px-4 py-2 text-left whitespace-nowrap'></th>
									</tr>
								</thead>
								<tbody>
									{filteredProjects.length === 0 && (
										<tr>
											<td colSpan={8} className='text-center py-8 text-neutral-500'>Aucun projet</td>
										</tr>
									)}
									{filteredProjects.map((project, i) => (
										<tr key={project.id} className='border-b border-neutral-800 hover:bg-neutral-800 group'>
											<td className='px-2 py-2'>
												<button
													className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-150 ${timer.running && timer.task?.id === project.id ? 'bg-green-700 text-white' : 'bg-neutral-800 text-white hover:bg-neutral-700'}`}
													aria-label={timer.running && timer.task?.id === project.id ? 'Arrêter le timer' : 'Démarrer le timer'}
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
											<td className='px-4 py-2 break-words'>{project.billable ? 'Oui' : 'Non'}</td>
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
														<button className='block w-full text-left px-4 py-2 hover:bg-neutral-800' onClick={() => handleEditProject(project)}>Éditer le projet</button>
														<button className='block w-full text-left px-4 py-2 hover:bg-neutral-800' onClick={() => handleAddMember(project)}>Ajouter un membre</button>
														<button className='block w-full text-left px-4 py-2 hover:bg-neutral-800' onClick={() => handleViewReports(project)}>Voir dans les rapports</button>
														<button className='block w-full text-left px-4 py-2 hover:bg-neutral-800' onClick={() => handleArchiveProject(project)}>Archiver</button>
														<button className='block w-full text-left px-4 py-2 text-red-500 hover:bg-neutral-800' onClick={() => handleDeleteProject(project)}>Supprimer</button>
													</ProjectMenu>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
				{confirmDelete.open && (
					<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
						<div className='bg-white text-black rounded-xl shadow-xl max-w-md w-full p-6 relative animate-fade-in'>
							<h2 className='text-xl font-bold mb-4'>Supprimer le projet</h2>
							<p>Voulez-vous vraiment supprimer le projet <span className='font-semibold'>{confirmDelete.project?.name}</span> ? Cette action est irréversible.</p>
							<div className='flex gap-4 mt-6 justify-end'>
								<button className='px-4 py-2 rounded bg-neutral-200 hover:bg-neutral-300' onClick={cancelDeleteProject}>Annuler</button>
								<button className='px-4 py-2 rounded bg-rose-600 text-white hover:bg-rose-700' onClick={confirmDeleteProject}>Supprimer</button>
							</div>
						</div>
					</div>
				)}
				<NewProjectModal
					open={modalOpen}
					onClose={() => setModalOpen(false)}
					onCreate={project => handleCreateProject(project, false)}
					lang={newProjectLang}
				/>
				<NewProjectModal
					open={showEditModal}
					onClose={() => setShowEditModal(false)}
					onCreate={project => handleCreateProject(project, true, editProject)}
					lang='fr'
					initialProject={editProject}
					isEdit
				/>
				{createError && (
					<div className='text-red-500 text-sm mt-2'>{createError}</div>
				)}
			</div>
		</div>
	)
}

export default ProjectsPage
