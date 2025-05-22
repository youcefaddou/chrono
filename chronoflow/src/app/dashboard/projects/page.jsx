import ProjectsPageContainer from '../../../components/dashboard/ProjectsPageContainer'
import { GlobalTimerProvider } from '../../../components/Timer/GlobalTimerProvider'

export default function ProjectsPage () {
	return (
		<GlobalTimerProvider>
			<ProjectsPageContainer />
		</GlobalTimerProvider>
	)
}
