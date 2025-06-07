'use client'

import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

const faqData = [
	{
		id: 1,
		category: 'General',
		question: 'Is ChronoFlow available in French?',
		answer: 'Yes, you can click on the flag to enjoy the features in French. The interface automatically adapts to your preferred language for an optimal user experience.'
	},
	{
		id: 2,
		category: 'Security',
		question: 'Is my data secure?',
		answer: 'Your data is stored in Europe and protected according to GDPR standards. We use end-to-end encryption and secure servers to ensure the confidentiality of your information. All your data is backed up daily.'
	},
	{
		id: 3,
		category: 'Integrations',
		question: 'Can I connect my Google Calendar?',
		answer: 'Yes, Google Calendar integration is available to synchronize your events. You can import your appointments and automatically sync your schedule. Synchronization is bidirectional and real-time.'
	},
	{
		id: 4,
		category: 'Features',
		question: 'How does time tracking work in ChronoFlow?',
		answer: 'ChronoFlow offers an integrated stopwatch that allows you to precisely measure the time spent on each task. You can start, pause and stop the timer with one click, with a detailed history of all your work sessions.'
	},
	{
		id: 5,
		category: 'Pricing',
		question: 'Is there a free version of ChronoFlow?',
		answer: 'Yes, ChronoFlow offers a free version with essential features: task management, basic stopwatch and simple statistics. To access advanced features like integrations and detailed reports, you can subscribe to our premium offer.'
	},
	{
		id: 6,
		category: 'Accessibility',
		question: 'Can I use ChronoFlow on mobile and tablet?',
		answer: 'Absolutely! ChronoFlow is fully responsive and adapts perfectly to all screens. You can access all your features from your smartphone or tablet via your web browser, with an interface optimized for touch devices.'
	},
	{
		id: 7,
		category: 'Data',
		question: 'How can I export my productivity data?',
		answer: 'ChronoFlow allows you to export your statistics and time reports in several formats: PDF for presentations, CSV for analysis in Excel, and JSON for technical integrations. You will find all these options in the "Reports" section of your dashboard.'
	},
	{
		id: 8,
		category: 'Collaboration',
		question: 'Can I share my projects with my team?',
		answer: 'Yes, ChronoFlow offers comprehensive collaboration features. You can invite team members, share projects, assign tasks and track collective progress. Each member has their own workspace while having access to shared projects.'
	},
	{
		id: 9,
		category: 'Support',
		question: 'What type of support do you offer?',
		answer: 'We offer several levels of support: online documentation, video tutorials, email support (24h response), and for premium accounts, priority support with live chat. Our English-speaking team is available Monday to Friday from 9am to 6pm EST.'
	},
	{
		id: 10,
		category: 'Features',
		question: 'Can I create custom reports?',
		answer: 'Yes, ChronoFlow offers an advanced report generator that allows you to create personalized dashboards according to your needs. You can filter by period, project, client or task type, and schedule automatic email sending of reports.'
	},
	{
		id: 11,
		category: 'Account',
		question: 'How can I upgrade or cancel my subscription?',
		answer: 'You can manage your subscription directly from your user profile. Plan changes are effective immediately and you can cancel at any time without fees. In case of cancellation, you retain access to premium features until the end of your billing period.'
	},
	{
		id: 12,
		category: 'Integrations',
		question: 'What other applications can I connect to ChronoFlow?',
		answer: 'ChronoFlow integrates with many popular tools: Google Calendar, Outlook, Slack, Trello, Asana, Notion, and many others. We regularly add new integrations based on user requests. A REST API is also available for custom integrations.'
	}
]

const categories = ['All', 'General', 'Features', 'Security', 'Integrations', 'Pricing', 'Accessibility', 'Data', 'Collaboration', 'Support', 'Account']

export default function FAQPage() {
	const [openItems, setOpenItems] = useState({})
	const [selectedCategory, setSelectedCategory] = useState('All')

	const toggleItem = (id) => {
		setOpenItems(prev => ({
			...prev,
			[id]: !prev[id]
		}))
	}

	const filteredFAQ = selectedCategory === 'All' 
		? faqData 
		: faqData.filter(item => item.category === selectedCategory)

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
			{/* Header */}
			<div className="bg-white shadow-sm border-b">
				<div className="container mx-auto px-4 py-8">
					<div className="text-center">
						<h1 className="text-4xl font-bold text-gray-900 mb-4">
							ChronoFlow Help Center
						</h1>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Quickly find answers to all your questions about using ChronoFlow
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
							Can't find your answer?
						</h3>
						<p className="text-gray-600 mb-6">
							Our support team is here to help you. Contact us and we'll get back to you quickly.
						</p>						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<a 
								href="/contact" 
								className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
							>
								Contact us
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
