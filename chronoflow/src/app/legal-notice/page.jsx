import React from 'react'

export default function LegalNoticePage () {
	return (
		<div className="max-w-3xl mx-auto py-10 px-4">
			<h1 className="text-2xl font-bold mb-6">Mentions légales</h1>
			<div className="space-y-4 text-gray-700">
				<p>
					<strong>Éditeur :</strong><br />
					ChronoFlow, contact.chronoflow@gmail.com
				</p>
				<p>
					<strong>Responsable de la publication :</strong><br />
					ChronoFlow
				</p>
				<p>
					<strong>Hébergement :</strong><br />
					Supabase, https://supabase.com
				</p>
				<p>
					<strong>Propriété intellectuelle :</strong><br />
					Tous les contenus présents sur ce site sont la propriété exclusive de ChronoFlow.
				</p>
				<p>
					<strong>Contact :</strong><br />
					contact.chronoflow@gmail.com
				</p>
			</div>
		</div>
	)
}
