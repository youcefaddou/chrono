'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { FaUser, FaCog, FaShieldAlt, FaPlug, FaQuestionCircle, FaTrashAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import Sidebar from '../../../../components/dashboard/Sidebar'
import ErrorBoundary from '../../../../components/ErrorBoundary'
import ConnectedDevicesEn from '../../../../components/ConnectedDevicesEn'
import LoginHistoryEn from '../../../../components/LoginHistoryEn'
import PasswordChangeEn from '../../../passwordchange/password-change-en.jsx'

export default function EnglishSettingsPage () {
	const { t, i18n } = useTranslation()
	const navigate = useNavigate()
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
							<button
								className='bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-900 transition-colors'
								onClick={handleConnectGoogle}
							>
								{t('settings.items.connectGoogleCalendar') || 'Connect Google Calendar'}
							</button>
							{message && <div className='text-sm text-gray-700 mt-2'>{message}</div>}
						</div>
					),
				},
				{ label: t('settings.items.managePermissions') || 'Manage permissions' },
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
				{ label: t('settings.items.reset') },
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
