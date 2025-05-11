import { Routes, Route } from 'react-router-dom'
import PrivacyPolicyPage from '../app/privacy-policy/page'
import PrivacyPolicyPageEn from '../app/privacy-policy/page.en'
import LegalNoticePage from '../app/legal-notice/page'
import LegalNoticePageEn from '../app/legal-notice/page.en'
import TermsPage from '../app/terms/page'
import TermsPageEn from '../app/terms/page.en'
import FaqPage from '../app/faq/page'
import ContactPage from '../app/contact/page'
// Ajoute d'autres pages si besoin

export default function AppRoutes () {
	return (
		<Routes>
			<Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
			<Route path="/privacy-policy/en" element={<PrivacyPolicyPageEn />} />
			<Route path="/legal-notice" element={<LegalNoticePage />} />
			<Route path="/legal-notice/en" element={<LegalNoticePageEn />} />
			<Route path="/terms" element={<TermsPage />} />
			<Route path="/terms/en" element={<TermsPageEn />} />
			<Route path="/faq" element={<FaqPage />} />
			<Route path="/contact" element={<ContactPage />} />
			{/* Ajoute ici les routes pour product, pricing, ressources si tu crées ces pages */}
			{/* <Route path="/product" element={<ProductPage />} /> */}
			{/* <Route path="/pricing" element={<PricingPage />} /> */}
			{/* <Route path="/ressources" element={<RessourcesPage />} /> */}
		</Routes>
	)
}
