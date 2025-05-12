import React from 'react'

export default function PrivacyPolicyPage () {
	return (
		<div className="max-w-3xl mx-auto py-10 px-4">
			<h1 className="text-2xl font-bold mb-6">Politique de confidentialité</h1>
			<div className="space-y-4 text-gray-700">
				<p>
					<strong>Collecte des données :</strong><br />
					Nous collectons uniquement les données nécessaires à la fourniture du service ChronoFlow.
				</p>
				<p>
					<strong>Utilisation des données :</strong><br />
					Les données sont utilisées pour la gestion des comptes, l’amélioration du service et la sécurité.
				</p>
				<p>
					<strong>Partage des données :</strong><br />
					Les données ne sont jamais vendues. Elles peuvent être partagées avec des sous-traitants dans le respect du RGPD.
				</p>
				<p>
					<strong>Droits des utilisateurs :</strong><br />
					Vous pouvez accéder, rectifier ou supprimer vos données à tout moment en nous contactant.
				</p>
				<p>
					<strong>Contact :</strong><br />
					Pour toute question relative à la confidentialité, contactez-nous à contact.chronoflow@gmail.com.
				</p>
			</div>
		</div>
	)
}
