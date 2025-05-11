import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../../hooks/useTranslation'
import './Footer.css'

export default function Footer() {
	const { t } = useTranslation()
	const year = new Date().getFullYear()

	return (
		<footer className="footer-main w-full border-t border-neutral-200 mt-8 bg-white">
			<div className="max-w-7xl mx-auto px-4 py-10 flex flex-col gap-10">
				<div className="flex flex-col sm:flex-row sm:gap-10 md:gap-0">
					<div className="flex flex-col gap-2 sm:w-1/2 md:w-1/3 mb-8 sm:mb-0 items-center sm:items-start text-center sm:text-left">
						<span className="font-bold text-2xl text-black tracking-tight">ChronoFlow</span>
						<span className="text-neutral-500 text-sm mt-2">
							© {year} {t('footer.rights')}
						</span>
					</div>
					<div className="flex flex-col sm:flex-row flex-1 gap-8">
						<ul className="footer-list flex flex-col gap-2 min-w-[120px] sm:w-1/2 md:w-1/3 items-center sm:items-start text-center sm:text-left">
							<li className="font-semibold text-neutral-700 mb-1">{t('footer.product')}</li>
							<li>
								<Link to="/product" className="footer-link">{t('footer.product')}</Link>
							</li>
							<li>
								<Link to="/pricing" className="footer-link">{t('footer.pricing')}</Link>
							</li>
							<li>
								<Link to="/ressources" className="footer-link">{t('footer.resources')}</Link>
							</li>
						</ul>
						<ul className="footer-list flex flex-col gap-2 min-w-[120px] sm:w-1/2 md:w-1/3 items-center sm:items-start text-center sm:text-left">
							<li className="font-semibold text-neutral-700 mb-1">{t('footer.help')}</li>
							<li>
								<Link to="/faq" className="footer-link">{t('footer.faq')}</Link>
							</li>
							<li>
								<Link to="/contact" className="footer-link">{t('footer.contact')}</Link>
							</li>
						</ul>
						<ul className="footer-list flex flex-col gap-2 min-w-[120px] sm:w-1/2 md:w-1/3 items-center sm:items-start text-center sm:text-left">
							<li className="font-semibold text-neutral-700 mb-1">{t('footer.legal')}</li>
							<li>
								<Link to="/legal-notice" className="footer-link">{t('footer.legalNotice')}</Link>
							</li>
							<li>
								<Link to="/privacy-policy" className="footer-link">{t('footer.privacyPolicy')}</Link>
							</li>
							<li>
								<Link to="/terms" className="footer-link">{t('footer.terms')}</Link>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</footer>
	)
}
