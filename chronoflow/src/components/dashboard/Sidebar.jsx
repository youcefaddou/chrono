import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation, NavLink } from 'react-router-dom'
import { useState } from 'react'

function Sidebar ({ user, onSmartTimerClick, collapsed, onToggle }) {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const location = useLocation()
	const [isHovered, setIsHovered] = useState(false)
	const isCollapsed = collapsed && !isHovered

	// Determine language prefix for routing
	const isEn = location.pathname.startsWith('/en')
	const dashPrefix = isEn ? '/en/dashboard' : '/dashboard'

	return (
		<aside
			className={
				`transition-all duration-200 bg-gray-900 text-white flex flex-col min-h-screen px-2 py-4 z-40
				${isCollapsed ? 'w-16' : 'w-56 px-4'} fixed md:static left-0 top-0 h-full shadow-lg md:z-30`
			}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* Mobile chevron toggle (always visible on mobile, centered vertically) */}
			<button
				className='md:hidden fixed left-0 top-1/2 -translate-y-1/2 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-gray-900 border border-gray-800 shadow-lg transition hover:bg-gray-800 focus:outline-none'
				onClick={onToggle}
				aria-label={isCollapsed ? t('sidebar.open') || 'Ouvrir le menu' : t('sidebar.close') || 'Fermer le menu'}
				style={{ transform: 'translateY(-50%)', left: isCollapsed ? '0.5rem' : '13.5rem', transition: 'left 0.3s' }}
			>
				<svg
					width='28'
					height='28'
					fill='none'
					viewBox='0 0 24 24'
					className={'transition-transform duration-300 ease-in-out transform ' + (isCollapsed ? 'rotate-180' : 'rotate-0')}
					aria-hidden='true'
				>
					<path d='M9 6l6 6-6 6' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'/>
				</svg>
			</button>
			<button
				className='mb-6 flex items-center justify-center w-10 h-10 rounded hover:bg-gray-800 focus:outline-none self-end md:self-start transition-transform duration-300 ease-in-out'
				onClick={onToggle}
				aria-label={isCollapsed ? t('sidebar.open') || 'Ouvrir le menu' : t('sidebar.close') || 'Fermer le menu'}
			>
				{/* Chevron icon for toggle, rotates left/right with smooth animation */}
				<svg
					width='24'
					height='24'
					fill='none'
					viewBox='0 0 24 24'
					className={'transition-transform duration-300 ease-in-out transform ' + (isCollapsed ? 'rotate-180' : 'rotate-0')}
					aria-hidden='true'
				>
					<path d='M9 6l6 6-6 6' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/>
				</svg>
			</button>
			<div className={'mb-8 flex items-center gap-2 min-h-[32px] transition-all duration-300 ease-in-out ' + (isCollapsed ? 'justify-center' : 'justify-start')}
				style={{ minWidth: isCollapsed ? undefined : 160 }}
			>
				<span className={'text-2xl font-bold whitespace-nowrap transition-all duration-300 ease-in-out ' + (isCollapsed ? 'sr-only' : '')}>{t('sidebar.workspace')}</span>
			</div>
			<nav className='flex-1'>
				<ul className='space-y-2'>
					<li className={'font-semibold text-blue-400 ' + (isCollapsed ? 'sr-only' : '')}>{t('sidebar.track')}</li>
					<li
						className='pl-2 py-1 hover:bg-gray-800 rounded cursor-pointer flex items-center gap-2'
						onClick={() => {
							onSmartTimerClick && onSmartTimerClick()
							navigate(dashPrefix)
						}}
					>
						<span role='img' aria-label='Timer'>⏱️</span>
						{!isCollapsed && t('sidebar.smartTimer')}
					</li>
					<li className={'font-semibold text-blue-400 mt-4 ' + (isCollapsed ? 'sr-only' : '')}>{t('sidebar.analyze')}</li>
					<li>
						<NavLink
							to={dashPrefix + '/reports'}
							className={({ isActive }) =>
								'flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 transition-colors' +
								(isActive ? ' bg-gray-800 font-bold text-yellow-400' : ' text-white')
							}
						>
							<span role='img' aria-label='Reports'>📊</span>
							{!isCollapsed && t('sidebar.reports')}
						</NavLink>
					</li>
					<li className={'font-semibold text-blue-400 mt-4 ' + (isCollapsed ? 'sr-only' : '')}>{t('sidebar.manage')}</li>
					<li>
						<NavLink
							to={dashPrefix + '/projects'}
							className={({ isActive }) =>
								'flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 transition-colors' +
								(isActive ? ' bg-gray-800 font-bold text-yellow-400' : ' text-white')
							}
						>
							<span className='text-yellow-400'>
								<svg width='18' height='18' fill='currentColor' viewBox='0 0 20 20'><path d='M4 4h12v2H4V4zm0 4h12v10H4V8zm2 2v6h8v-6H6z'/></svg>
							</span>
							{!isCollapsed && t('sidebar.projects')}
						</NavLink>
					</li>
					<li>
						<NavLink
							to={dashPrefix + '/clients'}
							className={({ isActive }) =>
								'flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 transition-colors' +
								(isActive ? ' bg-gray-800 font-bold text-yellow-400' : ' text-white')
							}
						>
							<span role='img' aria-label='Clients'>👥</span>
							{!isCollapsed && t('sidebar.clients')}
						</NavLink>
					</li>
					<li>
						<NavLink
							to={dashPrefix + '/members'}
							className={({ isActive }) =>
								'flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 transition-colors' +
								(isActive ? ' bg-gray-800 font-bold text-yellow-400' : ' text-white')
							}
						>
							<span role='img' aria-label='Members'>💼</span>
							{!isCollapsed && t('sidebar.members')}
						</NavLink>
					</li>
					<li>
						<NavLink
							to={dashPrefix + '/invoices'}
							className={({ isActive }) =>
								'flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 transition-colors' +
								(isActive ? ' bg-gray-800 font-bold text-yellow-400' : ' text-white')
							}
						>
							<span role='img' aria-label='Invoices'>🧾</span>
							{!isCollapsed && t('sidebar.invoices')}
						</NavLink>
					</li>
					<li>
						<NavLink
							to={dashPrefix + '/integrations'}
							className={({ isActive }) =>
								'flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 transition-colors' +
								(isActive ? ' bg-gray-800 font-bold text-yellow-400' : ' text-white')
							}
						>
							<span role='img' aria-label='Integrations'>🔌</span>
							{!isCollapsed && t('sidebar.integrations')}
						</NavLink>
					</li>
				</ul>
			</nav>
			<div className={'mt-auto pt-6 border-t border-gray-800 ' + (isCollapsed ? 'flex flex-col items-center' : '')}>
				<div className={'text-xs text-gray-400 mb-2 ' + (isCollapsed ? 'sr-only' : '')}>{user?.email}</div>
				<div className='flex flex-col gap-1'>
					<NavLink to={dashPrefix + '/subscription'} className={'text-left text-xs hover:underline ' + (isCollapsed ? 'sr-only' : '')}>{t('sidebar.subscription')}</NavLink>
					<NavLink to={dashPrefix + '/organization'} className={'text-left text-xs hover:underline ' + (isCollapsed ? 'sr-only' : '')}>{t('sidebar.organization')}</NavLink>
					<NavLink to={dashPrefix + '/settings'} className={'text-left text-xs hover:underline ' + (isCollapsed ? 'sr-only' : '')}>{t('sidebar.settings')}</NavLink>
				</div>
			</div>
		</aside>
	)
}

export default Sidebar
