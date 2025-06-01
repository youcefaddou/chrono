'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaUser, FaCog, FaShieldAlt, FaPlug, FaQuestionCircle, FaTrashAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import Sidebar from '../../../../components/dashboard/Sidebar'
import ErrorBoundary from '../../../../components/ErrorBoundary'
import ConnectedDevicesEn from '../../../../components/ConnectedDevicesEn'
import LoginHistoryEn from '../../../../components/LoginHistoryEn'
import PasswordChangeEn from '../../../passwordchange/password-change-en.jsx'

export default function EnglishSettingsPage () {
	const { t, i18n } = useTranslation()
	const navigate = useNavigate()
	const location = useLocation()
	const [profile, setProfile] = useState({
		displayName: '',
		email: '',
		createdAt: '',
		lastSignInAt: '',
	})
	const [isEditingName, setIsEditingName] = useState(false)
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState('')
	const [devicesOpen, setDevicesOpen] = useState(false)
	const [historyOpen, setHistoryOpen] = useState(false)
	const [changePwd, setChangePwd] = useState({ oldPassword: '', newPassword: '', confirm: '' })
	const [pwdMsg, setPwdMsg] = useState('')
	const [showPasswordChange, setShowPasswordChange] = useState(false)
	const [googleStatus, setGoogleStatus] = useState(null)
	const [isGoogleConnected, setIsGoogleConnected] = useState(false)

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const res = await fetch('http://localhost:3001/api/me', { credentials: 'include' })
				if (res.ok) {
					const user = await res.json()
					setProfile({
						displayName: user.username,
						email: user.email,
						createdAt: new Date(user.createdAt).toLocaleDateString(),
						lastSignInAt: new Date(user.lastSignInAt).toLocaleDateString(),
					})
				} else {
					setMessage('Failed to fetch profile')
				}
			} catch (err) {
				setMessage('Error fetching profile: ' + err.message)
			}
		}
		fetchProfile()
	}, [])

	useEffect(() => {
		// Check URL param for Google Calendar integration feedback
		const params = new URLSearchParams(window.location.search)
		const googleParam = params.get('google')
		if (googleParam === 'success') {
			setGoogleStatus('success')
			setMessage('Google Calendar connected successfully!')
		} else if (googleParam === 'error') {
			setGoogleStatus('error')
			setMessage('Error connecting to Google Calendar.')
		}
	}, [])

	useEffect(() => {
		// Redirige /dashboard/integrations?google=success vers /en/dashboard/settings?google=success
		if (location.pathname === '/dashboard/integrations') {
			navigate('/en/dashboard/settings?google=success', { replace: true })
		}
	}, [location, navigate])

	// Check if Google Calendar is connected on mount
	useEffect(() => {
		async function checkGoogleConnected () {
			try {
				const res = await fetch('http://localhost:3001/api/integrations/google-calendar/events', { credentials: 'include' })
				setIsGoogleConnected(res.ok)
			} catch {
				setIsGoogleConnected(false)
			}
		}
		checkGoogleConnected()
	}, [])

	const handleNameChange = (e) => {
		setProfile((prev) => ({ ...prev, displayName: e.target.value }))
	}

	const handleSaveName = async () => {
		setIsEditingName(false)
		setMessage('Name saved (not persisted, demo only)')
	}

	const handleConnectGoogle = () => {
		window.location.href = 'http://localhost:3001/api/integrations/google-calendar/auth'
	}

	const handleDisconnectGoogle = async () => {
		try {
			const res = await fetch('http://localhost:3001/api/integrations/google-calendar/disconnect', { method: 'POST', credentials: 'include' })
			if (res.ok) {
				setIsGoogleConnected(false)
				setGoogleStatus(null)
				setMessage('Google Calendar disconnected successfully.')
			} else {
				setMessage('Error disconnecting Google Calendar.')
			}
		} catch {
			setMessage('Network error while disconnecting.')
		}
	}

	const handleLanguageChange = (e) => {
		i18n.changeLanguage(e.target.value)
	}

	const handleChangePassword = () => {
		navigate('/passwordchange/password-change-en')
	}

	const sections = [
		{
			title: t('settings.userProfile'),
			items: [
				{
					label: t('settings.items.name'),
					content: isEditingName ? (
						<div className='flex items-center space-x-2'>
							<input
								type='text'
								value={profile.displayName}
								onChange={handleNameChange}
								className='border rounded px-2 py-1'
							/>
							<button
								onClick={handleSaveName}
								className='bg-blue-500 text-white px-3 py-1 rounded'
							>
								{t('settings.items.save')}
							</button>
						</div>
					) : (
						<div className='flex items-center space-x-2'>
							<span>{profile.displayName}</span>
							<button
								onClick={() => setIsEditingName(true)}
								className='text-blue-500 underline'
							>
								{t('settings.items.edit')}
							</button>
						</div>
					),
				},
				{
					label: t('settings.items.email'),
					content: <span className='ml-8'>{profile.email}</span>,
				},
				{ label: t('settings.items.createdAt'), content: <span>{profile.createdAt}</span> },
				{ label: t('settings.items.lastSignInAt'), content: <span>{profile.lastSignInAt}</span> },
			],
			icon: <FaUser className='text-blue-500' />,
		},
		{
			title: t('settings.preferences'),
			items: [
				{
					label: t('settings.items.language'),
					content: (
						<select
							value={i18n.language}
							onChange={handleLanguageChange}
							className='border rounded px-2 py-1 ml-4 w-40 cursor-pointer'
						>
							<option value='en'>English</option>
							<option value='fr'>Français</option>
						</select>
					),
				},
			],
			icon: <FaCog className='text-green-500' />,
		},
		{
			title: t('settings.security'),
			items: [
				{
					label: '',
					content: (
						<button
							className='bg-blue-600 text-white px-8 py-2 rounded cursor-pointer hover:bg-blue-900 transition-colors'
							onClick={() => setShowPasswordChange(true)}
						>
							{t('settings.items.changePassword')}
						</button>
					),
				},
				{
					label: '',
					content: <ConnectedDevicesEn />,
				},
				{
					label: '',
					content: <LoginHistoryEn />,
				},
			],
			icon: <FaShieldAlt className='text-red-500' />,
		},
		{
			title: t('settings.integrations'),
			items: [
				{
					label: '',
					content: (
						<div>
							{googleStatus === 'success' && (
								<div className='mb-2 text-green-600 font-semibold flex items-center gap-2'>
									<svg className='w-5 h-5 inline-block' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' /></svg>
									Google Calendar connected
								</div>
							)}
							{googleStatus === 'error' && (
								<div className='mb-2 text-red-600 font-semibold flex items-center gap-2'>
									<svg className='w-5 h-5 inline-block' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' /></svg>
									Google Calendar error
								</div>
							)}
							{isGoogleConnected ? (
								<button
									className='bg-rose-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-rose-700 transition-colors'
									onClick={handleDisconnectGoogle}
								>
									Disconnect Google Calendar
								</button>
							) : (
								<button
									className='bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-900 transition-colors'
									onClick={handleConnectGoogle}
								>
									{t('settings.items.connectGoogleCalendar') || 'Connect Google Calendar'}
								</button>
							)}
							{message && <div className='text-sm text-gray-700 mt-2'>{message}</div>}
						</div>
					),
				},
			],
			icon: <FaPlug className='text-purple-500' />,
		},
		{
			title: t('settings.support'),
			items: [
				{ label: t('settings.items.faq') },
				{ label: t('settings.items.contactSupport') },
				{ label: t('settings.items.documentation') },
			],
			icon: <FaQuestionCircle className='text-yellow-500' />,
		},
		{
			title: t('settings.others'),
			items: [
				{ label: t('settings.items.exportData') },
				{ label: t('settings.items.deleteData') },
			],
			icon: <FaTrashAlt className='text-gray-500' />,
		},
	]

	if (showPasswordChange) {
		return <PasswordChangeEn />
	}

	return (
			<ErrorBoundary>
				<div className='flex min-h-auto bg-gray-100'>
					<Sidebar
						collapsed={sidebarCollapsed}
						onToggle={() => setSidebarCollapsed((prev) => !prev)}
					/>
					<main className={`flex-1 p-6 transition-all ${sidebarCollapsed ? 'ml-16' : 'ml-5'} h-auto`}>
						<h1 className='text-3xl font-bold text-blue-700 mb-6'>{t('settings.title')}</h1>
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
							{sections.map((section, index) => (
								<div
									key={index}
									className='bg-white shadow-md rounded-lg p-4 flex flex-col items-start space-y-4 transform transition-transform duration-300 hover:scale-105 hover:shadow-lg'
								>
									<div className='flex items-center space-x-3'>
										{section.icon}
										<h2 className='text-xl font-semibold text-gray-800'>{section.title}</h2>
									</div>
									<ul className='space-y-2'>
										{section.items.map((item, idx) => (
											<li key={idx} className='text-gray-600 flex justify-between'>
												{item.label
													? (
														<>
															<span>{item.label}</span>
															<span>{item.content}</span>
														</>
													)
													: (
														<span className='w-full'>{item.content}</span>
													)
												}
											</li>
										))}
									</ul>
								</div>
							))}
						</div>
					</main>
				</div>
			</ErrorBoundary>
		)
}
