import React from 'react'
import ProjectCardEn from './ProjectCard.en'

function ProjectsListEn({
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
  handleAddMember,
  handleViewReports,
  handleArchiveProject,
  confirmDelete,
  cancelDelete,
  onConfirmDelete,
}) {
  return (
    <div className='mt-4'>
      {projects.length === 0 && (
        <div className='text-center p-8 text-neutral-400'>No projects found</div>
      )}

      {projects.map((project, index) => {
        const isCurrentlyPlaying = projectTimer.isRunning && projectTimer.activeProjectId === project.id

        return (
          <ProjectCardEn
            key={project.id}
            project={project}
            menuBtnRef={(el) => (menuBtnRefs.current[project.id] = el)}
            onMenuClick={() => onMenuClick(index)}
            showMenu={showMenuIndex === index}
            onCloseMenu={onCloseMenu}
            onPlay={() => onPlay(project.id)}
            onStop={onStop}
            isPlaying={isCurrentlyPlaying}
            elapsedSeconds={isCurrentlyPlaying ? projectTimer.elapsedTime : null}
            onDelete={() => handleAskDelete(project.id)}
            onEdit={() => handleEdit(project)}
            onAddMember={() => handleAddMember(project)}
            onViewReports={() => handleViewReports(project)}
            onArchive={() => handleArchiveProject(project)}
            confirmDelete={confirmDelete}
            cancelDelete={cancelDelete}
            onConfirmDelete={() => onConfirmDelete(project.id)}
          />
        )
      })}
    </div>
  )
}

export default ProjectsListEn
