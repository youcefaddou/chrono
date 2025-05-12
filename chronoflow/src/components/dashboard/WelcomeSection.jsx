import { useTranslation } from 'react-i18next'

function WelcomeSection ({ user }) {
	const { t } = useTranslation()
	return (
		<div>
			<h1 className='text-3xl font-bold mb-1 text-blue-700'>
				{t('dashboard.welcome')}{user ? `, ${user.email}` : ''}!
			</h1>
			<p className='text-gray-500'>{t('dashboard.subtitle')}</p>
		</div>
	)
}

export default WelcomeSection
