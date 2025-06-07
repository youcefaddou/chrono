'use client'

import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

const faqData = [
	{
		id: 1,
		category: 'Général',
		question: 'ChronoFlow est-il disponible en anglais ?',
		answer: 'Oui, vous pouvez cliquer sur le drapeau et profiter des fonctionnalités en anglais. L\'interface s\'adapte automatiquement à votre langue préférée pour une expérience utilisateur optimale.'
	},
	{
		id: 2,
		category: 'Sécurité',
		question: 'Mes données sont-elles sécurisées ?',
		answer: 'Vos données sont stockées en Europe et protégées selon les normes RGPD. Nous utilisons un chiffrement de bout en bout et des serveurs sécurisés pour garantir la confidentialité de vos informations. Toutes vos données sont sauvegardées quotidiennement.'
	},
	{
		id: 3,
		category: 'Intégrations',
		question: 'Puis-je connecter mon Google Calendar ?',
		answer: 'Oui, l\'intégration Google Calendar est disponible pour synchroniser vos événements. Vous pouvez importer vos rendez-vous et synchroniser automatiquement votre planning. La synchronisation est bidirectionnelle et en temps réel.'
	},
	{
		id: 4,
		category: 'Fonctionnalités',
		question: 'Comment fonctionne le suivi du temps dans ChronoFlow ?',
		answer: 'ChronoFlow propose un chronomètre intégré qui vous permet de mesurer précisément le temps passé sur chaque tâche. Vous pouvez démarrer, mettre en pause et arrêter le timer en un clic, avec un historique détaillé de toutes vos sessions de travail.'
	},
	{
		id: 5,
		category: 'Tarification',
		question: 'Y a-t-il une version gratuite de ChronoFlow ?',
		answer: 'Oui, ChronoFlow propose une version gratuite avec les fonctionnalités essentielles : gestion des tâches, chronomètre de base et statistiques simples. Pour accéder aux fonctionnalités avancées comme les intégrations et les rapports détaillés, vous pouvez souscrire à notre offre premium.'
	},
	{
		id: 6,
		category: 'Accessibilité',
		question: 'Puis-je utiliser ChronoFlow sur mobile et tablette ?',
		answer: 'Absolument ! ChronoFlow est entièrement responsive et s\'adapte parfaitement à tous les écrans. Vous pouvez accéder à toutes vos fonctionnalités depuis votre smartphone ou tablette via votre navigateur web, avec une interface optimisée pour les appareils tactiles.'
	},
	{
		id: 7,
		category: 'Données',
		question: 'Comment puis-je exporter mes données de productivité ?',
		answer: 'ChronoFlow vous permet d\'exporter vos statistiques et rapports de temps en plusieurs formats : PDF pour les présentations, CSV pour l\'analyse dans Excel, et JSON pour les intégrations techniques. Vous retrouverez toutes ces options dans la section "Rapports" de votre dashboard.'
	},
	{
		id: 8,
		category: 'Collaboration',
		question: 'Puis-je partager mes projets avec mon équipe ?',
		answer: 'Oui, ChronoFlow offre des fonctionnalités de collaboration complètes. Vous pouvez inviter des membres d\'équipe, partager des projets, assigner des tâches et suivre la progression collective. Chaque membre a son propre espace de travail tout en ayant accès aux projets partagés.'
	},
	{
		id: 9,
		category: 'Support',
		question: 'Quel type de support proposez-vous ?',
		answer: 'Nous offrons plusieurs niveaux de support : documentation en ligne, tutoriels vidéo, support email (réponse sous 24h), et pour les comptes premium, un support prioritaire avec chat en direct. Notre équipe francophone est disponible du lundi au vendredi de 9h à 18h.'
	},
	{
		id: 10,
		category: 'Fonctionnalités',
		question: 'Puis-je créer des rapports personnalisés ?',
		answer: 'Oui, ChronoFlow propose un générateur de rapports avancé qui vous permet de créer des tableaux de bord personnalisés selon vos besoins. Vous pouvez filtrer par période, projet, client ou type de tâche, et programmer l\'envoi automatique de rapports par email.'
	},
	{
		id: 11,
		category: 'Compte',
		question: 'Comment puis-je mettre à niveau ou annuler mon abonnement ?',
		answer: 'Vous pouvez gérer votre abonnement directement depuis votre profil utilisateur. Les changements de plan sont effectifs immédiatement et vous pouvez annuler à tout moment sans frais. En cas d\'annulation, vous conservez l\'accès aux fonctionnalités premium jusqu\'à la fin de votre période de facturation.'
	},
	{
		id: 12,
		category: 'Intégrations',
		question: 'Quelles autres applications puis-je connecter à ChronoFlow ?',
		answer: 'ChronoFlow s\'intègre avec de nombreux outils populaires : Google Calendar, Outlook, Slack, Trello, Asana, Notion, et bien d\'autres. Nous ajoutons régulièrement de nouvelles intégrations basées sur les demandes de nos utilisateurs. Une API REST est également disponible pour les intégrations personnalisées.'
	}
]

const categories = ['Tous', 'Général', 'Fonctionnalités', 'Sécurité', 'Intégrations', 'Tarification', 'Accessibilité', 'Données', 'Collaboration', 'Support', 'Compte']

export default function FAQPage() {
	const [openItems, setOpenItems] = useState({})
	const [selectedCategory, setSelectedCategory] = useState('Tous')

	const toggleItem = (id) => {
		setOpenItems(prev => ({
			...prev,
			[id]: !prev[id]
		}))
	}

	const filteredFAQ = selectedCategory === 'Tous' 
		? faqData 
		: faqData.filter(item => item.category === selectedCategory)

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
			{/* Header */}
			<div className="bg-white shadow-sm border-b">
				<div className="container mx-auto px-4 py-8">
					<div className="text-center">
						<h1 className="text-4xl font-bold text-gray-900 mb-4">
							Centre d'aide ChronoFlow
						</h1>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Trouvez rapidement les réponses à toutes vos questions sur l'utilisation de ChronoFlow
						</p>
					</div>
				</div>
			</div>

			{/* Category Filter */}
			<div className="container mx-auto px-4 py-8">
				<div className="flex flex-wrap justify-center gap-3 mb-8">
					{categories.map((category) => (
						<button
							key={category}
							onClick={() => setSelectedCategory(category)}
							className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
								selectedCategory === category
									? 'bg-blue-600 text-white shadow-lg'
									: 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
							}`}
						>
							{category}
						</button>
					))}
				</div>

				{/* FAQ Content */}
				<div className="max-w-4xl mx-auto">
					<div className="space-y-4">
						{filteredFAQ.map((item) => (
							<div 
								key={item.id} 
								className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg"
							>
								<button
									className="w-full px-6 py-5 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
									onClick={() => toggleItem(item.id)}
									aria-expanded={openItems[item.id] || false}
								>
									<div className="flex items-center">
										<span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mr-4">
											{item.category}
										</span>
										<h3 className="text-lg font-semibold text-gray-800">
											{item.question}
										</h3>
									</div>
									<ChevronDownIcon
										className={`w-5 h-5 text-gray-500 transition-transform duration-300 flex-shrink-0 ${
											openItems[item.id] ? 'rotate-180' : ''
										}`}
									/>
								</button>
								
								<div
									className={`overflow-hidden transition-all duration-300 ease-in-out ${
										openItems[item.id] 
											? 'max-h-96 opacity-100' 
											: 'max-h-0 opacity-0'
									}`}
								>
									<div className="px-6 pb-5">
										<div className="pt-2 border-t border-gray-100">
											<p className="text-gray-600 leading-relaxed mt-3">
												{item.answer}
											</p>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Contact Section */}
					<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mt-12 text-center">
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							Vous ne trouvez pas votre réponse ?
						</h3>
						<p className="text-gray-600 mb-6">
							Notre équipe support est là pour vous aider. Contactez-nous et nous vous répondrons rapidement.
						</p>						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<a 
								href="/contact" 
								className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
							>
								Nous contacter
							</a>
							<a 
								href="mailto:contact.chronoflow@gmail.com" 
								className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors duration-200"
							>
								contact.chronoflow@gmail.com
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
