import React from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import './hero-section.css'

function HeroSection () {
	const { t } = useTranslation()

	return (
		<section className="py-10 px-4 sm:py-16 sm:px-6 md:py-24 md:px-8 text-center bg-white">
			<h1
				className="hero-title text-3xl sm:text-4xl md:text-5xl font-extrabold text-rose-800 mb-4 leading-tight"
			>
				{t('hero.title')}
			</h1>
			<p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
				{t('hero.subtitle')}
			</p>
		</section>
	)
}

export default HeroSection
