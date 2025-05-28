'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Sidebar from '../../../../components/dashboard/Sidebar'
import ErrorBoundary from '../../../../components/ErrorBoundary'
import ThemeToggle from '../../../../components/theme-toggle'
import {
	FaUser,
	FaCog,
	FaShieldAlt,
	FaPlug,
	FaQuestionCircle,
	FaTrashAlt,
} from 'react-icons/fa'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
	import.meta.env.VITE_SUPABASE_URL,
	import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function EnglishSettingsPage() {
	const { t, i18n } = useTranslation()
	const [profile, setProfile] = useState({
		displayName: '',
		email: '',
		createdAt: '',
		lastSignInAt: '',
	})
	const [isEditingName, setIsEditingName] = useState(false)
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

	// Fetch user profile from auth.users
	useEffect(() => {
		const fetchProfile = async () => {
			const { data: session, error: sessionError } = await supabase.auth.getSession()

			if (sessionError) {
				console.error('Error fetching user session:', sessionError)
				return
			}

			const user = session?.session?.user

			if (!user) {
				console.error('No user logged in')
				return
			}

			// Extract user metadata directly from the session
			const rawUserMetaData = user.user_metadata || {}
			const displayName = rawUserMetaData.name || rawUserMetaData.full_name || 'Not defined'

			// Set profile data
			setProfile({
				displayName,
				email: user.email || '',
				createdAt: new Date(user.created_at).toLocaleDateString(),
				lastSignInAt: new Date(user.last_sign_in_at).toLocaleDateString(),
			})
		}

		fetchProfile()
	}, [])

	const handleNameChange = (e) => {
		setProfile((prev) => ({ ...prev, displayName: e.target.value }))
	}

	const handleSaveName = async () => {
		setIsEditingName(false)

		// Update display name in auth.users
		const { error } = await supabase.auth.updateUser({
			data: { display_name: profile.displayName },
		})

		if (error) {
			console.error('Error saving name:', error)
		} else {
			console.log('Name saved successfully!')
		}
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
					content: (
						<div className='flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0'>
							<label htmlFor='language-select' className='font-medium w-full sm:w-24'>
								{t('settings.items.language')}
							</label>
							<select
								id='language-select'
								value={i18n.language}
								onChange={(e) => i18n.changeLanguage(e.target.value)}
								className='border rounded px-4 py-2 w-full sm:w-48 cursor-pointer'
							>
								<option value='en'>English</option>
								<option value='fr'>Français</option>
							</select>
						</div>
					),
				},
				
			],
			icon: <FaCog className='text-green-500' />,
		},
		{
			title: t('settings.security'),
			items: [
				{ label: t('settings.items.twoFactorAuth') },
				{ label: t('settings.items.connectedDevices') },
				{ label: t('settings.items.loginHistory') },
			],
			icon: <FaShieldAlt className='text-red-500' />,
		},
		{
			title: t('settings.integrations'),
			items: [
				{ label: t('settings.items.connectServices') },
				{ label: t('settings.items.managePermissions') },
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

	return (
		<ErrorBoundary>
			<div className='flex min-h-auto bg-gray-100'>
				<Sidebar
					collapsed={sidebarCollapsed}
					onToggle={() => setSidebarCollapsed((prev) => !prev)}
				/>
				<main className={`flex-1 p-6 transition-all ${sidebarCollapsed ? 'ml-16' : 'ml-0'} h-auto`}>
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
											<span>{item.label}</span>
											<span>{item.content}</span>
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
