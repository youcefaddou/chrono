import { useRef, useEffect } from 'react'
import { animate } from 'animejs'

const testimonials = [
	{
		text: '"ChronoFlow m\'aide à rester concentré et à mieux gérer mes journées."',
		name: 'Alice, Freelance',
	},
	{
		text: '"L\'interface est super intuitive, je recommande à 100%."',
		name: 'Karim, Étudiant',
	},
	{
		text: '"Les statistiques sont top pour suivre mes progrès."',
		name: 'Sophie, Manager',
	},
]

function TestimonialsSection() {
	const sectionRef = useRef(null)
	const containerRefs = useRef([])

	useEffect(() => {
		let hasAnimated = false

		const observer = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting && !hasAnimated) {
				hasAnimated = true
				animateTestimonials()
			}
		}, { threshold: 0.3 })
		const animateTestimonials = () => {
			// Récupérer tous les containers valides
			const containers = containerRefs.current.filter(el => el)
			
			containers.forEach((container, index) => {
				// Animation du container : slide-in depuis la gauche + fade-in
				animate(container, {
					translateX: [-100, 0],
					opacity: [0, 1],
					duration: 800,
					delay: index * 250,
					ease: 'outExpo',
					complete: () => {
						// Une fois le container animé, animer les étoiles
						animateStars(container)
					}
				})
			})
		}
		const animateStars = (container) => {
			const stars = container.querySelectorAll('.testimonial-star')
			
			stars.forEach((star, starIndex) => {
				animate(star, {
					opacity: [0, 1],
					scale: [0.3, 1],
					rotate: [0, 360],
					duration: 400,
					delay: starIndex * 400,
					ease: 'outBack'
				})
			})
		}

		if (sectionRef.current) {
			observer.observe(sectionRef.current)
		}

		return () => observer.disconnect()
	}, [])

	return (
		<section ref={sectionRef} className="py-16 bg-gray-50">
			<div className="container mx-auto px-4">
				<h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
					Ils utilisent ChronoFlow
				</h2>
				
				<div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
					{testimonials.map((testimonial, index) => (
						<div
							key={index}
							ref={el => (containerRefs.current[index] = el)}
							className="bg-white rounded-xl shadow-lg p-8 text-center transform transition-all duration-300 hover:scale-105"
							style={{ opacity: 0, transform: 'translateX(-100px)' }}
						>
							{/* Étoiles */}
							<div className="flex justify-center mb-4 space-x-1">
								{[...Array(5)].map((_, starIndex) => (
									<span
										key={starIndex}
										className="testimonial-star text-2xl text-yellow-400"
										style={{ 
											opacity: 0, 
											transform: 'scale(0.3)',
											display: 'inline-block'
										}}
									>
										⭐
									</span>
								))}
							</div>
							<p className="text-gray-700 text-lg italic mb-6 leading-relaxed">
								{testimonial.text}
							</p>
							<div className="text-gray-500 font-medium">
								{testimonial.name}
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}

export default TestimonialsSection
