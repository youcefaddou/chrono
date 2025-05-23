import React, { useRef, useEffect } from 'react'

function FocusZoneModal ({
	seconds,
	running,
	isPaused,
	onStartPause,
	onStop,
	onClose,
	lang = 'fr',
}) {
	const modalRef = useRef(null)
	const canvasRef = useRef(null)

	// DEMANDE LE FULLSCREEN DIRECTEMENT À L'OUVERTURE DE LA MODALE
	useEffect(() => {
		if (
			modalRef.current &&
			document.fullscreenEnabled &&
			!document.fullscreenElement
		) {
			modalRef.current.requestFullscreen().catch(() => {})
		}
		return () => {
			if (document.fullscreenElement) {
				document.exitFullscreen().catch(() => {})
			}
		}
	}, [])

	// Fermer la modale ET le fullscreen (croix ou ESC)
	const handleClose = () => {
		if (document.fullscreenElement) {
			document.exitFullscreen()
				.catch(() => {})
				.finally(() => {
					onClose && onClose()
				})
		} else {
			onClose && onClose()
		}
	}

	// Bulles animées sur le canvas (fond bleu foncé)
	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return
		const ctx = canvas.getContext('2d')
		let animationFrameId
		const bubbles = Array.from({ length: 18 }, () => ({
			x: Math.random() * window.innerWidth,
			y: window.innerHeight + Math.random() * 100,
			r: 8 + Math.random() * 12,
			speed: 0.5 + Math.random() * 1.2,
			alpha: 0.15 + Math.random() * 0.15,
		}))

		function draw () {
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			for (let b of bubbles) {
				ctx.beginPath()
				ctx.arc(b.x, b.y, b.r, 0, 2 * Math.PI)
				ctx.fillStyle = `rgba(59,130,246,${b.alpha})`
				ctx.fill()
				b.y -= b.speed
				if (b.y + b.r < 0) {
					b.x = Math.random() * window.innerWidth
					b.y = window.innerHeight + Math.random() * 100
					b.r = 8 + Math.random() * 12
					b.speed = 0.5 + Math.random() * 1.2
					b.alpha = 0.15 + Math.random() * 0.15
				}
			}
			animationFrameId = requestAnimationFrame(draw)
		}
		draw()
		return () => {
			cancelAnimationFrame(animationFrameId)
			ctx.clearRect(0, 0, canvas.width, canvas.height)
		}
	}, [])

	// Ajuste la taille du canvas au resize
	useEffect(() => {
		function resizeCanvas () {
			if (canvasRef.current) {
				canvasRef.current.width = window.innerWidth
				canvasRef.current.height = window.innerHeight
			}
		}
		resizeCanvas()
		window.addEventListener('resize', resizeCanvas)
		return () => window.removeEventListener('resize', resizeCanvas)
	}, [])

	// Fermer la modale avec Escape OU la croix : même logique, tout ferme d'un coup
	useEffect(() => {
		function handleKeyDown (e) {
			if (e.key === 'Escape' || e.key === 'Esc') {
				handleClose()
			}
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [])

	const isFr = lang === 'fr'

	return (
		<div
			ref={modalRef}
			className='fixed inset-0 z-50 flex items-center justify-center'
			style={{
				background: 'rgba(59,130,246,0.85)',
				pointerEvents: 'auto',
			}}
		>
			<canvas
				ref={canvasRef}
				width={window.innerWidth}
				height={window.innerHeight}
				className='fixed inset-0 w-full h-full pointer-events-none'
				style={{ zIndex: 1 }}
			/>
			<button
				onClick={handleClose}
				aria-label={isFr ? 'Fermer' : 'Close'}
				className='absolute top-4 right-4 text-blue-700 text-3xl font-bold hover:text-rose-400 transition z-20'
				style={{
					background: 'rgba(255,255,255,0.7)',
					borderRadius: '50%',
					width: 44,
					height: 44,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				&#10005;
			</button>
			<div className='flex flex-col items-center justify-center w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 relative z-10'>
				<h2 className='text-2xl font-bold text-blue-700 mb-6 text-center'>
					{isFr ? 'Entre dans la zone' : 'Get in the zone'}
				</h2>
				<div className='flex flex-col items-center mb-6'>
					<span className='text-5xl font-mono text-blue-700 mb-4'>
						{String(Math.floor(seconds / 60)).padStart(2, '0')}:
						{String(seconds % 60).padStart(2, '0')}
					</span>
					<div className='flex gap-3'>
						<button
							onClick={onStartPause}
							className={`px-6 py-2 rounded-full text-lg font-semibold transition ${
								!running || isPaused
									? 'bg-blue-600 text-white hover:bg-blue-700'
									: 'bg-yellow-100 text-blue-700 hover:bg-yellow-200'
							}`}
						>
							{isFr
								? (!running || isPaused ? 'Démarrer' : 'Pause')
								: (!running || isPaused ? 'Start' : 'Pause')}
						</button>
						<button
							onClick={onStop}
							disabled={!running && seconds === 0}
							className={`px-6 py-2 rounded-full text-lg font-semibold ${running || seconds > 0 ? 'bg-rose-100 text-blue-700 hover:bg-rose-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
						>
							{isFr ? 'Réinitialiser' : 'Reset'}
						</button>
					</div>
				</div>
				<p className='text-gray-500 text-center'>
					{isFr
						? 'Reste concentré et évite les distractions. Tu es dans la zone !'
						: 'Stay focused and avoid distractions. You are in the zone!'}
				</p>
			</div>
		</div>
	)
}

export default FocusZoneModal
