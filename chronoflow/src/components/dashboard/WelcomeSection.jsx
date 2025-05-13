import { useTranslation } from '../../hooks/useTranslation'

function WelcomeSection ({ user }) {
	const { t, i18n } = useTranslation()
	const lang = i18n.language.startsWith('en') ? 'en' : 'fr'

	return (
		<div>
			<div className="flex items-center justify-between mb-2">
				<h1 className='text-3xl font-bold mb-1 text-blue-700'>
					{t('dashboard.welcome')}{user ? `, ${user.email}` : ''}!
				</h1>
			</div>
			<p className='text-gray-500'>{t('dashboard.subtitle')}</p>
		</div>
	)
}

export default WelcomeSection
