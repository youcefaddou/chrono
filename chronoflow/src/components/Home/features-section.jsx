import React from 'react'
import { useTranslation } from '../../hooks/useTranslation'

function FeaturesSection () {
	const { t } = useTranslation()

	return (
		<section className="py-12 bg-blue-100">
			<h2 className="text-2xl font-bold text-center mb-8">{t('features.title')}</h2>
			<div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
				<div className="flex flex-col items-center">
					<video
						src="/assets/videos/chronometer.mp4"
						alt="ChronoFlow - Chronomètre"
						className="w-40 h-40 object-contain mb-2"
						autoPlay
						loop
						muted
						playsInline
					/>
					<h3 className="font-semibold mt-2">{t('features.timerTitle')}</h3>
					<p className="text-gray-600 text-sm text-center">{t('features.timerDesc')}</p>
				</div>
				<div className="flex flex-col items-center">
					<img src="/assets/images/todo.gif" alt="todo list" className="w-40 h-40 object-contain mb-2" />
					<h3 className="font-semibold mt-2">{t('features.tasksTitle')}</h3>
					<p className="text-gray-600 text-sm text-center">{t('features.tasksDesc')}</p>
				</div>
				<div className="flex flex-col items-center">
					<img src="/assets/images/stats.gif" alt="statistiques" className="w-40 h-40 object-contain mb-2" />
					<h3 className="font-semibold mt-2">{t('features.statsTitle')}</h3>
					<p className="text-gray-600 text-sm text-center">{t('features.statsDesc')}</p>
				</div>
				<div className="flex flex-col items-center">
					<img src="/assets/images/calendar.gif" alt="google calendar" className="w-40 h-40 object-contain mb-2" />
					<h3 className="font-semibold mt-2">{t('features.calendarTitle')}</h3>
					<p className="text-gray-600 text-sm text-center">{t('features.calendarDesc')}</p>
				</div>
				<div className="flex flex-col items-center">
					<img src="/assets/images/cadenas.gif" alt="cadenas" className="w-40 h-40 object-contain mb-2" />
					<h3 className="font-semibold mt-2">{t('features.securityTitle')}</h3>
					<p className="text-gray-600 text-sm text-center">{t('features.securityDesc')}</p>
				</div>
			</div>
		</section>
	)
}

export default FeaturesSection
