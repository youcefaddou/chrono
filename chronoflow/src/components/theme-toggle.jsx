'use client'

import { useTheme } from '../context/theme-context'
import { useTranslation } from 'react-i18next'

export default function ThemeToggle () {
	const { theme, toggleTheme } = useTheme()
	const { t } = useTranslation()

	return (
		<button
			onClick={toggleTheme}
			className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 w-full sm:w-48 rounded"
		>
			{theme === 'light' ? t('themeToggle.darkMode') : t('themeToggle.lightMode')}
		</button>
	)
}
