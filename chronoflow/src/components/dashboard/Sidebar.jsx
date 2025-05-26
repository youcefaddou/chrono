import { useTranslation } from 'react-i18next'
import { useLocation, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Sidebar ({ user }) {
	const { t } = useTranslation()
	const location = useLocation()
	const [isHovered, setIsHovered] = useState(false)
	const [collapsed, setCollapsed] = useState(true)

	// Always collapsed on mount and on route change
	useEffect(() => {
		setCollapsed(true)
	}, [location.pathname])

	const isCollapsed = collapsed && !isHovered

	// Responsive: overlay on mobile, static on desktop
	const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
	const sidebarWidth = isCollapsed ? 'w-16' : 'w-56'
	const sidebarPosition = isMobile ? 'fixed top-0 left-0 h-full z-50' : 'md:static md:z-30'

	// Determine language prefix for routing
	const isEn = location.pathname.startsWith('/en')
	const dashPrefix = isEn ? '/en/dashboard' : '/dashboard'

	return (
		<aside
			className={`transition-all duration-300 bg-gray-900 text-white flex flex-col h-full px-2 py-4 ${sidebarWidth} ${sidebarPosition} shadow-lg`}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			style={{ minWidth: isCollapsed ? 64 : 224 }}
		>
			{/* Workspace title */}
			<div className={'mb-8 flex items-center gap-2 min-h-[32px] transition-all duration-300 ease-in-out ' + (isCollapsed ? 'justify-center' : 'justify-start')}
				style={{ minWidth: isCollapsed ? undefined : 160 }}
			>
				<span className={'text-2xl font-bold whitespace-nowrap transition-all duration-300 ease-in-out ' + (isCollapsed ? 'sr-only' : '')}>{t('sidebar.workspace')}</span>
			</div>
			<nav className='flex-1 flex flex-col items-center md:items-stretch'>
				{/* Section utilisateur/options */}
				<div className={`mb-4 flex flex-col items-center w-full transition-all duration-300 ease-in-out ${
					isCollapsed 
						? 'gap-2' 
						: 'bg-gray-800/80 rounded-xl p-4 shadow-sm'
				}`}> 
					{/* Avatar/email */}
					{user?.email && (
						<div className={`flex flex-col items-center w-full transition-all duration-300 ease-in-out ${
						isCollapsed ? 'mb-2' : 'mb-3'
					}`}>
							<div className={`rounded-full bg-gradient-to-br from-blue-500 to-blue-300 flex items-center justify-center text-white font-bold shadow transition-all duration-300 ease-in-out ${
							isCollapsed ? 'w-8 h-8 text-sm' : 'w-12 h-12 text-xl mb-2'
						}`}>
								{user.email[0]?.toUpperCase() || 'U'}
							</div>
							{!isCollapsed && (
								<span className='text-xs md:text-sm font-medium text-white text-center break-all'>{user.email}</span>
							)}
						</div>
					)}
					<div className={`flex flex-col w-full transition-all duration-300 ease-in-out ${
						isCollapsed ? 'gap-2' : 'gap-3'
					}`}>
						<NavLink 
							to={dashPrefix + '/subscription'} 
							className={`flex items-center font-medium rounded-lg hover:bg-blue-600/80 transition text-white group ${
							isCollapsed 
								? 'justify-center p-2' 
								: 'gap-3 text-base md:text-lg px-3 py-2'
							}`}
							title={isCollapsed ? t('sidebar.subscription') || 'Abonnement' : undefined}
						>
							<svg width={isCollapsed ? '20' : '26'} height={isCollapsed ? '20' : '26'} fill='none' viewBox='0 0 24 24' className='text-blue-200 group-hover:text-white'><path d='M12 3v18M3 12h18' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round'/></svg>
							{!isCollapsed && <span>Abonnement</span>}
						</NavLink>
						<NavLink 
							to={dashPrefix + '/organization'} 
							className={`flex items-center font-medium rounded-lg hover:bg-blue-600/80 transition text-white group ${
							isCollapsed 
								? 'justify-center p-2' 
								: 'gap-3 text-base md:text-lg px-3 py-2'
							}`}
							title={isCollapsed ? t('sidebar.organization') || 'Organisation' : undefined}
						>
							<svg width={isCollapsed ? '20' : '26'} height={isCollapsed ? '20' : '26'} fill='none' viewBox='0 0 24 24' className='text-blue-200 group-hover:text-white'><circle cx='12' cy='12' r='9' stroke='currentColor' strokeWidth='2.2'/><path d='M8 16v-1a4 4 0 018 0v1' stroke='currentColor' strokeWidth='2.2'/><circle cx='12' cy='10' r='3' stroke='currentColor' strokeWidth='2.2'/></svg>
							{!isCollapsed && <span>Organisation</span>}
						</NavLink>
						<NavLink 
							to={dashPrefix + '/settings'} 
							className={`flex items-center font-medium rounded-lg hover:bg-blue-600/80 transition text-white group ${
							isCollapsed 
								? 'justify-center p-2' 
								: 'gap-3 text-base md:text-lg px-3 py-2'
							}`}
							title={isCollapsed ? t('sidebar.settings') || 'Paramètres' : undefined}
						>
							<svg width={isCollapsed ? '20' : '26'} height={isCollapsed ? '20' : '26'} fill='none' viewBox='0 0 24 24' className='text-blue-200 group-hover:text-white'><circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2.2'/><path d='M12 8v4l3 3' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round'/></svg>
							{!isCollapsed && <span>Paramètres</span>}
						</NavLink>
					</div>
				</div>
			</nav>
		</aside>
	)
}

export default Sidebar
