import { GlobalTimerProvider } from '../../../../components/Timer/GlobalTimerProvider'
import ProjectsPageContainerEn from '../../../../components/dashboard/ProjectsPageContainer.en'

export default function ProjectsPageEn () {
	return (
		<GlobalTimerProvider>
			<ProjectsPageContainerEn />
		</GlobalTimerProvider>
	)
}
