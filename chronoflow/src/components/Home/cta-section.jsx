import React from 'react'
import { Link } from 'react-router-dom'

function CTASection () {
	return (
		<section className="py-12 text-center">
			<h2 className="text-2xl font-bold mb-4">Prêt à booster votre productivité ?</h2>
			<p className="mb-6 text-gray-600">Essayez ChronoFlow gratuitement dès aujourd’hui.</p>
			<Link
				to="/signup"
				className="inline-block bg-rose-600 hover:bg-rose-700 text-white font-semibold px-8 py-3 rounded-lg shadow transition"
			>
				Créer un compte
			</Link>
		</section>
	)
}

export default CTASection
