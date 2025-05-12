import React from 'react'

export default function ContactPage () {
	return (
		<div className="max-w-2xl mx-auto py-10 px-4">
			<h1 className="text-2xl font-bold mb-6">Contact</h1>
			<p className="mb-4 text-gray-700">
				Pour toute question, suggestion ou demande d’assistance, contactez-nous :
			</p>
			<ul className="mb-4 text-gray-700">
				<li>Email : <a href="mailto:contact@chronoflow.fr" className="text-rose-600 underline">contact.chronoflow@gmail.com</a></li>
				<li>Adresse : 50 rue d’Hauteville, 75010 Paris, France</li>
			</ul>
			<p className="text-gray-700">Nous répondons sous 48h ouvrées.</p>
		</div>
	)
}
