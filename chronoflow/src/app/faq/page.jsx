import React from 'react'

export default function FaqPage () {
	return (
		<div className="max-w-3xl mx-auto py-10 px-4">
			<h1 className="text-2xl font-bold mb-6">FAQ</h1>
			<div className="space-y-4">
				<div>
					<h2 className="font-semibold">Comment fonctionne ChronoFlow ?</h2>
					<p className="text-gray-700">ChronoFlow vous permet de gérer votre temps et vos tâches simplement, en toute sécurité, avec un respect total de votre vie privée.</p>
				</div>
				<div>
					<h2 className="font-semibold">Mes données sont-elles protégées ?</h2>
					<p className="text-gray-700">Oui, vos données sont stockées en Europe et protégées conformément au RGPD.</p>
				</div>
				<div>
					<h2 className="font-semibold">Comment contacter l’équipe?</h2>
					<p className="text-gray-700">Vous pouvez nous écrire via la page Contact ou par email à contact.chronoflow@gmail.com.</p>
				</div>
			</div>
		</div>
	)
}
