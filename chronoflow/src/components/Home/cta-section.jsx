import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../../hooks/useTranslation'

function CTASection () {
	const { t, i18n } = useTranslation()
	const lang = i18n.language.startsWith('en') ? 'en' : 'fr'

	return (
		<section className="py-12 text-center bg-white">
			<h2 className="text-4xl font-bold text-center mb-15">{t('home.cta.title')}</h2>
			<p className="mb-6 text-gray-600">{t('home.cta.subtitle')}</p>
			<Link
				to={lang === 'en' ? '/en/signup' : '/signup'}
				className="inline-block bg-rose-600 hover:bg-rose-700 text-white font-semibold px-8 py-3 rounded-lg shadow transition"
			>
				{t('home.cta.button')}
			</Link>
		</section>
	)
}

export default CTASection
