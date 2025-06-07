import React, { useEffect, useRef } from 'react'
import { animate, createScope } from 'animejs'
import { useTranslation } from '../../hooks/useTranslation'

function FeaturesSection () {
	const { t } = useTranslation()
	const rootRef = useRef(null)
	const scope = useRef(null)

	useEffect(() => {
		const handleScroll = () => {
			if (!rootRef.current) return
			const rect = rootRef.current.getBoundingClientRect()
			const windowHeight = window.innerHeight || document.documentElement.clientHeight
			if (rect.top < windowHeight - 100) {
				scope.current = createScope({ root: rootRef }).add(() => {
					// Animation du titre avec délai modéré et amplitude accrue
					animate('h2', {
						opacity: [0, 1],
						translateY: [80, 0],
						ease: 'out(4)',
						duration: 1000,
						delay: 400,
					})
					// Animation des blocs de fonctionnalités
					animate('.feature-block', {
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
			<h2 className='text-4xl font-bold text-center mb-15'>{t('features.title')}</h2>
			<div className='max-w-4xl mx-auto grid grid-cols-2 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 sm:gap-6 gap-12 gap-x-40'>
				<div className='flex flex-col items-center feature-block opacity-0'>
					<video
						src='/assets/videos/chronometer.mp4'
						alt='ChronoFlow - Chronomètre'
						className='w-40 h-40 object-contain mb-2'
						autoPlay
						loop
						muted
						playsInline
					/>
					<h3 className='font-semibold mt-2'>{t('features.timerTitle')}</h3>
					<p className='text-gray-600 text-sm text-center'>{t('features.timerDesc')}</p>
				</div>
				<div className='flex flex-col items-center feature-block opacity-0'>
					<img src='/assets/images/todo.gif' alt='todo list' className='w-40 h-40 object-contain mb-2' />
					<h3 className='font-semibold mt-2'>{t('features.tasksTitle')}</h3>
					<p className='text-gray-600 text-sm text-center'>{t('features.tasksDesc')}</p>
				</div>
				<div className='flex flex-col items-center feature-block opacity-0'>
					<img src='/assets/images/calendar.gif' alt='google calendar' className='w-40 h-40 object-contain mb-2' />
					<h3 className='font-semibold mt-2'>{t('features.calendarTitle')}</h3>
					<p className='text-gray-600 text-sm text-center'>{t('features.calendarDesc')}</p>
				</div>
				<div className='flex flex-col items-center feature-block opacity-0'>
					<img src='/assets/images/cadenas.gif' alt='cadenas' className='w-40 h-40 object-contain mb-2' />
					<h3 className='font-semibold mt-2'>{t('features.securityTitle')}</h3>
					<p className='text-gray-600 text-sm text-center'>{t('features.securityDesc')}</p>
				</div>
			</div>
		</section>
	)
}

export default FeaturesSection
