import React, { useState } from 'react'
import { useTranslation } from '../../hooks/useTranslation'

const previews = [
	{
		img: '/assets/images/screenchrono1.png',
		video: '/assets/videos/screenvid2.mp4', 
		title: { fr: 'Gestion du temps', en: 'Time Management' },
		desc: {
			fr: "Visualisez et contrôlez votre temps de travail grâce à l'interface intuitive du timer.",
			en: "Visualize and control your work time with the intuitive timer interface.",
		},
		alt: { fr: 'Aperçu ChronoFlow 1', en: 'ChronoFlow Preview 1' },
	},
	{
		img: '/assets/images/screenchrono3.png',
		video: '/assets/videos/demo3.mp4',
		title: { fr: 'Vue analytique', en: 'Analytics View' },
		desc: {
			fr: "Analysez vos statistiques et suivez vos progrès avec des graphiques clairs et dynamiques.",
			en: "Analyze your stats and track your progress with clear, dynamic charts.",
		},
		alt: { fr: 'Aperçu ChronoFlow 3', en: 'ChronoFlow Preview 3' },
	},
	{
		img: '/assets/images/screenchrono2.png',
		video: '/assets/videos/screenvid1.mp4', 
		title: { fr: 'Organisation des tâches', en: 'Task Organization' },
		desc: {
			fr: "Organisez vos tâches et priorisez vos journées pour une productivité optimale.",
			en: "Organize your tasks and prioritize your days for optimal productivity.",
		},
		alt: { fr: 'Aperçu ChronoFlow 2', en: 'ChronoFlow Preview 2' },
	},
]

function VisualPreviewSection () {
	const { i18n } = useTranslation()
	const lang = i18n.language.startsWith('en') ? 'en' : 'fr'

	const [selected, setSelected] = useState(null)
	const n = previews.length
	const radius = 180

	const [virtualIndex, setVirtualIndex] = useState(0)
	const [isTransitioning, setIsTransitioning] = useState(false)
	const [transitionStyle, setTransitionStyle] = useState('transform 0.8s cubic-bezier(.77,0,.18,1)')
	const [isMobile, setIsMobile] = useState(false)

	// Ajout d'une ref pour la vidéo
	const videoRef = React.useRef(null)

	// Réinitialise la vidéo à la fermeture du panel
	React.useEffect(() => {
		if (selected === null && videoRef.current) {
			videoRef.current.pause()
			videoRef.current.currentTime = 0
		}
	}, [selected])

	// Detect mobile (<= 768px)
	React.useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth <= 768)
		checkMobile()
		window.addEventListener('resize', checkMobile)
		return () => window.removeEventListener('resize', checkMobile)
	}, [])

	const carouselItems = [...previews, ...previews]
	const getAngle = (idx) => (360 / n) * (idx % n)

	const prev = () => {
		if (isTransitioning) return
		setIsTransitioning(true)
		setTransitionStyle('transform 0.5s cubic-bezier(.77,0,.18,1)')
		setVirtualIndex((prev) => prev - 1)
	}
	const next = () => {
		if (isTransitioning) return
		setIsTransitioning(true)
		setTransitionStyle('transform 0.5s cubic-bezier(.77,0,.18,1)')
		setVirtualIndex((prev) => prev + 1)
	}

	const handleTransitionEnd = () => {
		let idx = virtualIndex
		let changed = false
		if (idx >= n) {
			idx = idx - n
			changed = true
		} else if (idx < 0) {
			idx = idx + n
			changed = true
		}
		if (changed) {
			setTransitionStyle('none')
			setVirtualIndex(idx)
			setTimeout(() => {
				setTransitionStyle('transform 0.5s cubic-bezier(.77,0,.18,1)')
				setIsTransitioning(false)
			}, 20)
		} else {
			setIsTransitioning(false)
		}
	}

	const displayIndex = ((virtualIndex % n) + n) % n

	return (
		<section className="py-12 bg-gradient-to-b from-white-100 via-white to-blue-400">
			
			<div className="w-full max-w-3xl mx-auto relative flex flex-col items-center">
				{isMobile ? (
					// Carousel classique mobile
					<div className="w-full flex flex-col items-center">
						<div className="relative w-full flex items-center justify-center">
							<button
								className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-rose-100 text-rose-600 rounded-full shadow p-2 transition z-10"
								onClick={() => setVirtualIndex((i) => (i - 1 + n) % n)}
								aria-label={lang === 'en' ? 'Previous' : 'Précédent'}
								style={{ boxShadow: '0 2px 8px rgba(239,68,68,0.08)' }}
							>
								<svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
							</button>
							<div className="w-full flex flex-col items-center">
								<div
									className="bg-white rounded-xl shadow-lg p-4 w-full max-w-xs flex flex-col items-center"
									onClick={() => setSelected(displayIndex)}
									style={{ cursor: 'pointer' }}
								>
									<img
										src={previews[displayIndex].img}
										alt={previews[displayIndex].alt[lang]}
										className="w-full h-44 object-cover rounded-lg mb-2"
									/>
									<div className="font-semibold text-rose-700 text-lg">{previews[displayIndex].title[lang]}</div>
								</div>
							</div>
							<button
								className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-rose-100 text-rose-600 rounded-full shadow p-2 transition z-10"
								onClick={() => setVirtualIndex((i) => (i + 1) % n)}
								aria-label={lang === 'en' ? 'Next' : 'Suivant'}
								style={{ boxShadow: '0 2px 8px rgba(239,68,68,0.08)' }}
							>
								<svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
							</button>
						</div>
						<div className="flex justify-center gap-2 mt-4">
							{previews.map((_, idx) => (
								<button
									key={idx}
									className={`w-3 h-3 rounded-full transition ${displayIndex === idx ? 'bg-rose-600' : 'bg-white'}`}
									onClick={() => setVirtualIndex(idx)}
									aria-label={lang === 'en'
										? `Go to preview ${idx + 1}`
										: `Aller à l'aperçu ${idx + 1}`}
								/>
							))}
						</div>
					</div>
				) : (
					// Carousel 3D desktop
					<>
						<div className="relative h-[320px] w-full flex items-center justify-center select-none">
							<div
								className="carousel-3d"
								style={{
									width: 360,
									height: 320,
									position: 'relative',
									perspective: 1000,
									margin: '0 auto',
								}}
							>
								<div
									className="carousel-3d-inner"
									style={{
										width: '100%',
										height: '100%',
										position: 'absolute',
										transformStyle: 'preserve-3d',
										transition: transitionStyle,
										transform: `rotateY(${-virtualIndex * (360 / n)}deg) rotateX(25deg)`,
									}}
									onTransitionEnd={handleTransitionEnd}
								>
									{carouselItems.map((item, idx) => {
										const angle = getAngle(idx)
										if (idx >= n * 2) return null
										return (
											<div
												key={idx}
												style={{
													position: 'absolute',
													top: '50%',
													left: '50%',
													width: 220,
													height: 180,
													transform: `
														rotateY(${angle}deg)
														translateZ(${radius}px)
														translateY(-50%)
														translateX(-50%)
													`,
													boxShadow: displayIndex === (idx % n)
														? '0 8px 32px 0 rgba(239,68,68,0.18)'
														: '0 2px 8px 0 rgba(0,0,0,0.08)',
													zIndex: displayIndex === (idx % n) ? 2 : 1,
													cursor: 'pointer',
													opacity: displayIndex === (idx % n) ? 1 : 0.7,
													transition: 'box-shadow 0.5s, opacity 0.5s',
													background: '#fff',
													borderRadius: 16,
													display: 'flex',
													flexDirection: 'column',
													alignItems: 'center',
													justifyContent: 'center',
													border: displayIndex === (idx % n) ? '2px solid #ef4444' : 'none',
												}}
												onClick={() => setSelected(idx % n)}
											>
												<img
													src={item.img}
													alt={item.alt[lang]}
													style={{
														width: '100%',
														height: 110,
														objectFit: 'cover',
														borderRadius: 12,
														marginBottom: 10,
														boxShadow: displayIndex === (idx % n) ? '0 4px 16px #ef444455' : 'none',
													}}
												/>
												<div className="font-semibold text-rose-700 text-lg text-center">{item.title[lang]}</div>
											</div>
										)
									})}
								</div>
								<button
									className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-rose-100 text-rose-600 rounded-full shadow p-2 transition"
									onClick={prev}
									aria-label={lang === 'en' ? 'Previous' : 'Précédent'}
									style={{ boxShadow: '0 2px 8px rgba(239,68,68,0.08)' }}
								>
									<svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
								</button>
								<button
									className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-rose-100 text-rose-600 rounded-full shadow p-2 transition"
									onClick={next}
									aria-label={lang === 'en' ? 'Next' : 'Suivant'}
									style={{ boxShadow: '0 2px 8px rgba(239,68,68,0.08)' }}
								>
									<svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
								</button>
							</div>
						</div>
						<div className="flex justify-center gap-2 mt-4">
							{previews.map((_, idx) => (
								<button
									key={idx}
									className={`w-3 h-3 rounded-full transition ${displayIndex === idx ? 'bg-rose-600' : 'bg-white'}`}
									onClick={() => {
										if (isTransitioning) return
										setTransitionStyle('transform 0.5s cubic-bezier(.77,0,.18,1)')
										setVirtualIndex(idx)
									}}
									aria-label={lang === 'en'
										? `Go to preview ${idx + 1}`
										: `Aller à l'aperçu ${idx + 1}`}
								/>
							))}
						</div>
					</>
				)}
			</div>
			{/* Modal/Panel */}
			{selected !== null && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
					<div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-8 relative animate-fade-in modal-panel-responsive">
						<button
							className="absolute top-2 right-2 text-gray-500 hover:text-rose-600 text-2xl font-bold"
							onClick={() => setSelected(null)}
							aria-label={lang === 'en' ? 'Close' : 'Fermer'}
						>
							&times;
						</button>
						<div className="mb-4">
							<video
								ref={videoRef}
								src={previews[selected].video}
								autoPlay
								loop
								className="w-full h-64 sm:h-80 object-cover rounded-lg modal-video-responsive"
							/>
						</div>
						<h3 className="text-xl font-bold mb-2 text-rose-700 text-center">{previews[selected].title[lang]}</h3>
						<p className="text-gray-700 text-center">{previews[selected].desc[lang]}</p>
					</div>
				</div>
			)}
			<style>{`
				@media (max-width: 700px) {
					.carousel-3d, .carousel-3d-inner {
						transform: none !important;
						perspective: none !important;
						width: 100% !important;
						height: auto !important;
					}
					.carousel-3d-inner > div {
						position: static !important;
						transform: none !important;
						width: 100% !important;
						margin-bottom: 1.5rem;
					}
				}
				@media (max-width: 768px) {
					.modal-panel-responsive {
						max-width: 95vw !important;
						width: 95vw !important;
						padding: 1.25rem !important;
					}
					.modal-video-responsive {
						height: 180px !important;
						max-height: 40vw !important;
					}
				}
				@keyframes fade-in { from { opacity: 0; transform: scale(0.95);} to { opacity: 1; transform: scale(1);} }
				.animate-fade-in { animation: fade-in 0.2s; }
			`}</style>
		</section>
	)
}

export default VisualPreviewSection
