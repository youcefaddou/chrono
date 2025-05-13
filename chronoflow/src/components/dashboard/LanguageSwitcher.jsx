import { useTranslation } from 'react-i18next'
import i18n from '../../lib/i18n'

function LanguageSwitcher () {
	const { i18n: i18next } = useTranslation()
	const isFr = i18next.language === 'fr'
	return (
		<button
			onClick={ () => i18n.changeLanguage(isFr ? 'en' : 'fr') }
			className='mt-4 md:mt-0 px-4 py-2 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 border border-blue-200 flex items-center gap-2'
		>
			<span>{isFr ? '🇬🇧' : '🇫🇷'}</span>
			{ isFr ? 'English' : 'Français' }
		</button>
	)
}

export default LanguageSwitcher
