import React from 'react'

function FAQSection () {
	return (
		<section className="py-12 bg-white">
			<h2 className="text-4xl font-bold text-center mb-15">FAQ rapide</h2>
			<div className="max-w-3xl mx-auto space-y-6">
				<div>
					<h3 className="font-semibold">ChronoFlow est-il gratuit ?</h3>
					<p className="text-gray-600 text-sm">Oui, vous pouvez commencer gratuitement et profiter des fonctionnalités de base sans engagement.</p>
				</div>
				<div>
					<h3 className="font-semibold">Mes données sont-elles sécurisées ?</h3>
					<p className="text-gray-600 text-sm">Vos données sont stockées en Europe et protégées selon les normes RGPD.</p>
				</div>
				<div>
					<h3 className="font-semibold">Puis-je connecter mon Google Calendar ?</h3>
					<p className="text-gray-600 text-sm">Oui, l’intégration Google Calendar est disponible pour synchroniser vos événements.</p>
				</div>
			</div>
		</section>
	)
}

export default FAQSection
