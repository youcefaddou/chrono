import { useTranslation } from 'react-i18next'
import i18n from '../../lib/i18n'

function LanguageSwitcher () {
	const { i18n: i18next } = useTranslation()
	return (
		<button
			onClick={ () => i18n.changeLanguage(i18next.language === 'fr' ? 'en' : 'fr') }
			className='mt-4 md:mt-0 px-4 py-2 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 border border-blue-200'
		>
			{ i18next.language === 'fr' ? 'English' : 'Français' }
		</button>
	)
}

export default LanguageSwitcher
