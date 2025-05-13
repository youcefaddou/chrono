import React from 'react'

function TestimonialsSection () {
	return (
		<section className="py-12 bg-gradient-to-b from-blue-50 via-white to-blue-200">
			<h2 className="text-2xl font-bold text-center mb-8">Ils utilisent ChronoFlow</h2>
			<div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
				<div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
					<span className="text-rose-600 text-3xl mb-2">⭐️⭐️⭐️⭐️⭐️</span>
					<p className="text-gray-700 text-center mb-2">“ChronoFlow m’aide à rester concentré et à mieux gérer mes journées.”</p>
					<span className="text-gray-500 text-sm">— Alice, Freelance</span>
				</div>
				<div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
					<span className="text-rose-600 text-3xl mb-2">⭐️⭐️⭐️⭐️⭐️</span>
					<p className="text-gray-700 text-center mb-2">“L’interface est super intuitive, je recommande à 100%.”</p>
					<span className="text-gray-500 text-sm">— Karim, Étudiant</span>
				</div>
				<div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
					<span className="text-rose-600 text-3xl mb-2">⭐️⭐️⭐️⭐️⭐️</span>
					<p className="text-gray-700 text-center mb-2">“Les stats visuelles sont top pour suivre mes progrès.”</p>
					<span className="text-gray-500 text-sm">— Sophie, Manager</span>
				</div>
			</div>
		</section>
	)
}

export default TestimonialsSection
