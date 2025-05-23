import { GlobalTimerProvider } from '../../../components/Timer/GlobalTimerProvider'
import ProjectsPageContainer from '../../../components/dashboard/ProjectsPageContainer'

export default function ProjectsPage () {
	return (
		<GlobalTimerProvider>
			<ProjectsPageContainer />
		</GlobalTimerProvider>
	)
}
