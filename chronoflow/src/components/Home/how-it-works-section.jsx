import React, { useEffect, useRef } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { animate, createScope } from 'animejs'

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

	const rootRef = useRef(null)
	const scope = useRef(null)
	useEffect(() => {
	const handleScroll = () => {
		if (!rootRef.current) return
		const rect = rootRef.current.getBoundingClientRect()
		const windowHeight = window.innerHeight || document.documentElement.clientHeight
		if (rect.top < windowHeight - 100) {
			scope.current = createScope({ root: rootRef }).add(() => {
				// Animation du titre
				animate('h2', {
					opacity: [0, 1],
					translateY: [80, 0],
					ease: 'out(4)',
					duration: 1000,
					delay: 400,
				})
				// Animation des étapes (ajout de la classe how-it-works-step et opacity-0)
				animate('.how-it-works-step', {
					opacity: [0, 1],
					translateY: [100, 0],
					ease: 'out(4)',
					duration: 1000,
					delay: (el, i) => 600 + i * 180,
				})
			})
			window.removeEventListener('scroll', handleScroll)
		}
	}
	window.addEventListener('scroll', handleScroll)
	handleScroll()
	return () => {
		window.removeEventListener('scroll', handleScroll)
		scope.current && scope.current.revert()
	}
}, [])

	return (
		<section ref={rootRef} className='py-12 bg-white'>
			<h2 className="text-4xl font-bold text-center mb-15">
				{t('howitworks.title')}
			</h2>
			<div className="max-w-3xl mx-auto flex flex-col md:flex-row justify-center items-center gap-8">
				{content.map((step, i) => (
					<div
						key={step.title}
						ref={refs[i]}
						className={`flex flex-col items-center how-it-works-step`}
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
