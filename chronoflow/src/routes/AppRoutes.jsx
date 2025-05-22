import { Routes, Route } from 'react-router-dom'
import PrivacyPolicyPage from '../app/privacy-policy/page'
import PrivacyPolicyPageEn from '../app/privacy-policy/page.en'
import LegalNoticePage from '../app/legal-notice/page'
import LegalNoticePageEn from '../app/legal-notice/page.en'
import TermsPage from '../app/terms/page'
import TermsPageEn from '../app/terms/page.en'
import FaqPage from '../app/faq/page'
import ContactPage from '../app/contact/page'
import HomePage from '../app/home/page'
import SignupPage from '../app/(auth)/signup/page'
import SignupPageEn from '../app/(auth)/signup/page.en'
import LoginPage from '../app/(auth)/login/page'
import LoginPageEn from '../app/(auth)/login/page.en'
import DashboardPage from '../app/dashboard/page'
import ProjectsPageContainer from '../components/dashboard/ProjectsPageContainer'
import ProjectsPageContainerEn from '../components/dashboard/ProjectsPageContainer.en'
// Ajoute d'autres pages si besoin

export default function AppRoutes () {
	return (
		<Routes>
			{/* FR routes */}
			<Route path="/" element={<HomePage />} />
			<Route path="/signup" element={<SignupPage />} />
			<Route path="/login" element={<LoginPage />} />
			<Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
			<Route path="/legal-notice" element={<LegalNoticePage />} />
			<Route path="/terms" element={<TermsPage />} />
			<Route path="/faq" element={<FaqPage />} />
			<Route path="/contact" element={<ContactPage />} />
			<Route path="/dashboard" element={<DashboardPage />} />
			<Route path="/dashboard/projects" element={<ProjectsPageContainer />} />

			{/* EN routes */}
			<Route path="/en" element={<HomePage />} />
			<Route path="/en/signup" element={<SignupPageEn />} />
			<Route path="/en/login" element={<LoginPageEn />} />
			<Route path="/en/privacy-policy" element={<PrivacyPolicyPageEn />} />
			<Route path="/en/legal-notice" element={<LegalNoticePageEn />} />
			<Route path="/en/terms" element={<TermsPageEn />} />
			<Route path="/en/dashboard" element={<DashboardPage />} />
			<Route path="/en/dashboard/projects" element={<ProjectsPageContainerEn />} />
			{/* Optionally add FAQ/contact in English if you have those pages */}
			{/* <Route path="/en/faq" element={<FaqPageEn />} /> */}
			{/* <Route path="/en/contact" element={<ContactPageEn />} /> */}
		</Routes>
	)
}
