import { useState } from 'react'
import { useTranslation } from '../../hooks/useTranslation'

function FAQSection () {
	const { t, i18n } = useTranslation()
	const lang = i18n.language.startsWith('en') ? 'en' : 'fr'
	const [openItems, setOpenItems] = useState({})

	const faqData = [
		{
			id: 1,
			question: t('home.faq.question1'),
			answer: t('home.faq.answer1')
		},
		{
			id: 2,
			question: t('home.faq.question2'),
			answer: t('home.faq.answer2')
		},
		{
			id: 3,
			question: t('home.faq.question3'),
			answer: t('home.faq.answer3')
		}
	]

	const toggleItem = (id) => {
		setOpenItems(prev => ({
			...prev,
			[id]: !prev[id]
		}))
	}

	return (
		<section className="py-16 bg-gradient-to-b from-gray-50 to-white">
			<div className="container mx-auto px-4">				<div className="text-center mb-12">
					<h2 className="text-4xl font-bold text-gray-800 mb-4">{t('home.faq.title')}</h2>
					<p className="text-lg text-gray-600 max-w-2xl mx-auto">
						{t('home.faq.subtitle')}
					</p>
				</div>
				
				<div className="max-w-4xl mx-auto">
					<div className="space-y-4">
						{faqData.map((item) => (
							<div 
								key={item.id} 
								className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg"
							>
								<button
									className="w-full px-6 py-5 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
									onClick={() => toggleItem(item.id)}
									aria-expanded={openItems[item.id] || false}
								>
									<h3 className="text-lg font-semibold text-gray-800 pr-4">
										{item.question}
									</h3>
									<div className="flex-shrink-0">
										<svg
											className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
												openItems[item.id] ? 'rotate-180' : ''
											}`}
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M19 9l-7 7-7-7"
											/>
										</svg>
									</div>
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
					</div>					<div className="text-center mt-10">
						<p className="text-gray-600 mb-4">
							{t('home.faq.moreQuestions')}
						</p>
						<a 
							href={lang === 'en' ? '/en/contact' : '/contact'} 
							className="inline-flex items-center px-6 py-3  bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors duration-200"
						>
							{t('home.faq.contactUs')}
						</a>
					</div>
				</div>
			</div>
		</section>
	)
}

export default FAQSection
