import { useTranslation } from 'react-i18next'
import flagFr from '../../assets/france.png'
import flagEn from '../../assets/eng.png'

function Sidebar ({ user, onSmartTimerClick }) {
	const { t, i18n } = useTranslation()
	const currentFlag = i18n.language.startsWith("en") ? flagEn : flagFr
	const nextLang = i18n.language.startsWith("en") ? "fr" : "en"
	const handleLangSwitch = () => i18n.changeLanguage(nextLang)
	return (
		<aside className='w-56 bg-gray-900 text-white flex flex-col min-h-screen px-4 py-6'>
			<div className='mb-8 flex items-center gap-2'>
				<span className='text-2xl font-bold'>{t('sidebar.workspace')}</span>
			</div>
			<nav className='flex-1'>
				<ul className='space-y-2'>
					<li className='font-semibold text-blue-400'>{t('sidebar.track')}</li>
					<li
						className='pl-2 py-1 hover:bg-gray-800 rounded cursor-pointer'
						onClick={onSmartTimerClick}
					>
						{t('sidebar.smartTimer')}
					</li>
					<li className='font-semibold text-blue-400 mt-4'>{t('sidebar.analyze')}</li>
					<li className='pl-2 py-1 hover:bg-gray-800 rounded cursor-pointer'>📊 {t('sidebar.reports')}</li>
					<li className='font-semibold text-blue-400 mt-4'>{t('sidebar.manage')}</li>
					<li className='pl-2 py-1 hover:bg-gray-800 rounded cursor-pointer'>📁 {t('sidebar.projects')}</li>
					<li className='pl-2 py-1 hover:bg-gray-800 rounded cursor-pointer'>👥 {t('sidebar.clients')}</li>
					<li className='pl-2 py-1 hover:bg-gray-800 rounded cursor-pointer'>💼 {t('sidebar.members')}</li>
					<li className='pl-2 py-1 hover:bg-gray-800 rounded cursor-pointer'>🧾 {t('sidebar.invoices')}</li>
					<li className='pl-2 py-1 hover:bg-gray-800 rounded cursor-pointer'>🔌 {t('sidebar.integrations')}</li>
				</ul>
			</nav>
			<div className='mt-auto pt-6 border-t border-gray-800'>
				<div className='text-xs text-gray-400 mb-2'>{user?.email}</div>
				<div className='flex flex-col gap-1'>
					<button className='text-left text-xs hover:underline'>{t('sidebar.subscription')}</button>
					<button className='text-left text-xs hover:underline'>{t('sidebar.organization')}</button>
					<button className='text-left text-xs hover:underline'>{t('sidebar.settings')}</button>
				</div>
			</div>
		</aside>
	)
}

export default Sidebar
