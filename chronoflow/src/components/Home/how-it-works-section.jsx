import React, { useRef } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import '../../components/Home/how-it-works-section.css'

const steps = (t) => [
	{
		icon: '▶️',
		title: t('howitworks.step1Title'),
		desc: t('howitworks.step1Desc'),
	},
	{
		icon: '➕',
		title: t('howitworks.step2Title'),
		desc: t('howitworks.step2Desc'),
	},
	{
		icon: '📈',
		title: t('howitworks.step3Title'),
		desc: t('howitworks.step3Desc'),
	},
]

function HowItWorksSection () {
	const { t } = useTranslation()
	const refs = [useRef(null), useRef(null), useRef(null)]

	const content = steps(t)

	return (
		<section className="py-12 bg-gray-300">
			<h2 className="text-2xl font-bold text-center mb-8">
				{t('howitworks.title')}
			</h2>
			<div className="max-w-3xl mx-auto flex flex-col md:flex-row justify-center items-center gap-8">
				{content.map((step, i) => (
					<div
						key={step.title}
						ref={refs[i]}
						className="flex flex-col items-center how-it-works-step"
					>
						<span className="text-rose-600 text-4xl mb-2">{step.icon}</span>
						<h3 className="font-semibold">{step.title}</h3>
						<p className="text-gray-600 text-sm text-center">{step.desc}</p>
					</div>
				))}
			</div>
		</section>
	)
}

export default HowItWorksSection
