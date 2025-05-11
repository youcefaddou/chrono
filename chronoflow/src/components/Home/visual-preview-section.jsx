import React from 'react'

function VisualPreviewSection () {
	return (
		<section className="py-12 bg-gray-50">
			<h2 className="text-2xl font-bold text-center mb-8">Aperçu visuel</h2>
			<div className="flex flex-col md:flex-row justify-center items-center gap-8">
				<div className="w-full md:w-1/2 flex justify-center">
					{/* Remplace par un vrai mockup/screenshot plus tard */}
					<div className="bg-white rounded-xl shadow-lg p-6 w-64 h-40 flex flex-col justify-center items-center">
						<span className="text-rose-600 text-5xl animate-spin">⏲️</span>
						<p className="mt-4 text-gray-500 text-sm">Aperçu du timer en action</p>
					</div>
				</div>
				<div className="w-full md:w-1/2 flex justify-center">
					<div className="bg-white rounded-xl shadow-lg p-6 w-64 h-40 flex flex-col justify-center items-center">
						<span className="text-rose-600 text-5xl">🖥️</span>
						<p className="mt-4 text-gray-500 text-sm">Interface desktop & mobile</p>
					</div>
				</div>
			</div>
		</section>
	)
}

export default VisualPreviewSection
