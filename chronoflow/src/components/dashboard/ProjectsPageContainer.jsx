import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import NewProjectModal from './NewProjectModal'
import { supabase } from '../../lib/supabase'
import { useProjectTimer } from '../../hooks/useProjectTimer'
import ProjectsTable from './ProjectsTable'
import ProjectsTableEn from './ProjectsTable.en'
import { PlusIcon } from '@radix-ui/react-icons'

function formatTimer (seconds) {
	if (!seconds || isNaN(seconds)) return '00:00:00'
	const h = Math.floor(seconds / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	const s = seconds % 60
	return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

function ProjectsPageContainer () {
	const [filter, setFilter] = useState('all')
	const [filters, setFilters] = useState({ client: '', member: '', billable: '', name: '', template: '' })
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
	const isMobile = useMemo(() => {
		if (typeof window === 'undefined') return false
		return window.innerWidth < 820
	}, [])
	const projectTimer = useProjectTimer()
	const menuBtnRefs = useRef([])

	useEffect(() => {
		if (projects.length !== menuBtnRefs.current.length) {
			menuBtnRefs.current = projects.map((_, i) => menuBtnRefs.current[i] || React.createRef())
		}
	}, [projects])

	useEffect(() => {
		async function fetchUserId () {
			const { data } = await supabase.auth.getUser()
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

	useEffect(() => {
		fetchProjects()
	}, [fetchProjects])

	async function handleCreateProject (project, isEdit, initialProject) {
		if (!userId) {
			setCreateError('Utilisateur non authentifié. Veuillez vous reconnecter.')
			return
		}
		const parseNumber = val => {
			if (typeof val === 'string') {
				const match = val.match(/\d+(?:[.,]\d+)?/)
				return match ? parseFloat(match[0].replace(',', '.')) : undefined
			}
			return typeof val === 'number' ? val : undefined
		}
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

	async function handlePlay (project) {
		projectTimer.start(project.id)
	}

	async function handleStop (project) {
		const elapsed = projectTimer.getElapsed()
		projectTimer.stop()
		const current = typeof project.total_seconds === 'number' ? project.total_seconds : 0
		const newTotal = current + elapsed
		await supabase.from('projects').update({ total_seconds: newTotal }).eq('id', project.id)
		setProjects(ps => ps.map(p => p.id === project.id ? { ...p, total_seconds: newTotal } : p))
	}

	async function handleFinish (project) {
		await supabase.from('projects').update({ is_finished: true }).eq('id', project.id)
		setProjects(ps => ps.map(p => p.id === project.id ? { ...p, is_finished: true } : p))
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

	async function handleDelete (project) {
		await supabase.from('projects').delete().eq('id', project.id)
		setProjects(ps => ps.filter(p => p.id !== project.id))
	}

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
					'flex-1 flex flex-col w-full pt-4 pb-4' +
					(sidebarCollapsed ? 'sm:ml-10' : 'sm:ml-30') +
					' max-w-full sm:max-w-6xl md:max-w-7xl lg:max-w-[96vw] xl:max-w-[90vw] 2xl:max-w-[1500px] mx-auto'
				}
			>
					<div
					className='flex flex-wrap items-center gap-x-4 gap-y-2
						justify-between xl:justify-between
						lg:justify-start
						px-2 sm:px-6 py-2 sm:py-4 border-b border-neutral-800'
				>
					<div className='flex items-center gap-4 flex-shrink-0 min-w-0'>
						<h1 className='text-2xl font-bold truncate'>
							{newProjectLang === 'en' ? 'Projects' : 'Projets'}
						</h1>
						<span className={'ml-2 px-3 py-1 rounded-full font-mono text-base flex items-center gap-2 ' + (projectTimer.isRunning ? 'bg-green-700 text-white' : 'bg-rose-900 text-neutral-300')}>
							<svg width='18' height='18' fill='currentColor' viewBox='0 0 20 20' className='inline-block mr-1'>
								<rect x='6' y='5' width='2.5' height='10' rx='1'/>
								<rect x='11.5' y='5' width='2.5' height='10' rx='1'/>
							</svg>
							{formatTimer(projectTimer.getElapsed())}
							{projectTimer.isRunning && (
								<span className='ml-2 font-semibold truncate'>
									{projects.find(p => p.id === projectTimer.activeProjectId)?.name}
								</span>
							)}
						</span>
					</div>
					<div className='flex-shrink-0'>
						<button
							className='flex items-center gap-2 px-4 py-2 bg-rose-800 hover:bg-rose-500 rounded text-white font-medium transition-colors w-full sm:w-auto justify-center'
							onClick={() => {
								setModalOpen(true)
								setNewProjectLang(newProjectLang === 'en' ? 'en' : 'fr')
							}}
						>
							<PlusIcon />
							{newProjectLang === 'en' ? 'New project' : 'Nouveau projet'}
						</button>
					</div>
				</div>
				<div className='flex flex-col gap-4 py-2 sm:py-4'>
					{newProjectLang === 'en' ? (
						<ProjectsTableEn
							projects={filteredProjects}
							projectTimer={projectTimer}
							onPlay={handlePlay}
							onStop={handleStop}
							onFinish={handleFinish}
							onDelete={handleDelete}
							onMenuClick={i => setShowMenuIndex(i === showMenuIndex ? null : i)}
							showMenuIndex={showMenuIndex}
							onCloseMenu={() => setShowMenuIndex(null)}
							isMobile={isMobile}
							menuBtnRefs={menuBtnRefs.current}
							lang={newProjectLang}
							handleEdit={handleEditProject}
							handleAddMember={handleAddMember}
							handleViewReports={handleViewReports}
							handleArchiveProject={handleArchiveProject}
						/>
					) : (
						<ProjectsTable
							projects={filteredProjects}
							projectTimer={projectTimer}
							onPlay={handlePlay}
							onStop={handleStop}
							onFinish={handleFinish}
							handleAskDelete={handleDeleteProject}
							onMenuClick={i => setShowMenuIndex(i === showMenuIndex ? null : i)}
							showMenuIndex={showMenuIndex}
							onCloseMenu={() => setShowMenuIndex(null)}
							isMobile={isMobile}
							menuBtnRefs={menuBtnRefs.current}
							lang={newProjectLang}
							handleEdit={handleEditProject}
							handleAddMember={handleAddMember}
							handleViewReports={handleViewReports}
							handleArchiveProject={handleArchiveProject}
							confirmDelete={confirmDelete}
							cancelDelete={cancelDeleteProject}
							onConfirmDelete={confirmDeleteProject}
						/>
					)}
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
							lang='fr'
							initialProject={editProject}
							isEdit
						/>
					)}
					{createError && (
						<div className='text-red-500 text-sm mt-2'>{createError}</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default ProjectsPageContainer
