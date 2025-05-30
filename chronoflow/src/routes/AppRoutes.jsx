import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
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
import SettingsPage from '../app/dashboard/settings/page'
import EnglishSettingsPage from '../app/en/dashboard/settings/page'

function ProtectedRoute ({ children }) {
	const [isLoading, setIsLoading] = useState(true)
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const location = useLocation()

	useEffect(() => {
		let ignore = false
		fetch('http://localhost:3001/api/me', { credentials: 'include' })
			.then(res => {
				if (!ignore) setIsAuthenticated(res.ok)
			})
			.catch(() => {
				if (!ignore) setIsAuthenticated(false)
			})
			.finally(() => {
				if (!ignore) setIsLoading(false)
			})
		return () => { ignore = true }
	}, [location.pathname])

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-gray-500 text-lg">Loading...</div>
			</div>
		)
	}
	if (!isAuthenticated) {
		return <Navigate to="/login" replace />
	}
	return children
}

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
			<Route
				path="/dashboard"
				element={
					<ProtectedRoute>
						<DashboardPage />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/dashboard/settings"
				element={
					<ProtectedRoute>
						<SettingsPage />
					</ProtectedRoute>
				}
			/>

			{/* EN routes */}
			<Route path="/en" element={<HomePage />} />
			<Route path="/en/signup" element={<SignupPageEn />} />
			<Route path="/en/login" element={<LoginPageEn />} />
			<Route path="/en/privacy-policy" element={<PrivacyPolicyPageEn />} />
			<Route path="/en/legal-notice" element={<LegalNoticePageEn />} />
			<Route path="/en/terms" element={<TermsPageEn />} />
			<Route
				path="/en/dashboard"
				element={
					<ProtectedRoute>
						<DashboardPage />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/en/dashboard/settings"
				element={
					<ProtectedRoute>
						<EnglishSettingsPage />
					</ProtectedRoute>
				}
			/>
			{/* Optionally add FAQ/contact in English if you have those pages */}
			{/* <Route path="/en/faq" element={<FaqPageEn />} /> */}
			{/* <Route path="/en/contact" element={<ContactPageEn />} /> */}
		</Routes>
	)
}
