import React from 'react'
import { useTranslation } from '../../hooks/useTranslation'

function RightPanel () {
	const { t } = useTranslation()
	return (
		<aside className='w-64 bg-white border-l border-gray-200 px-4 py-6 flex flex-col gap-4'>
			<div>
				<div className='font-semibold mb-2'>{t('rightPanel.objectives')}</div>
				<button className='w-full bg-blue-50 text-blue-700 rounded px-3 py-2 text-sm mb-2'>+ {t('rightPanel.addObjective')}</button>
				<ul className='text-sm text-gray-600'>
					<li className='py-1'>{t('rightPanel.noObjectives')}</li>
				</ul>
			</div>
			<div>
				<div className='font-semibold mb-2'>{t('rightPanel.favorites')}</div>
				<button className='w-full bg-blue-50 text-blue-700 rounded px-3 py-2 text-sm mb-2'>+ {t('rightPanel.addFavorite')}</button>
				<ul className='text-sm text-gray-600'>
					<li className='py-1'>{t('rightPanel.noFavorites')}</li>
				</ul>
			</div>
		</aside>
	)
}

export default RightPanel
