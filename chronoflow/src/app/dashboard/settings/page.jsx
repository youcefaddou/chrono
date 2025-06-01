'use client'

import { useEffect, useState } from 'react'
import { FaUser, FaCog, FaShieldAlt, FaPlug, FaQuestionCircle, FaTrashAlt } from 'react-icons/fa'
import Sidebar from '../../../components/dashboard/Sidebar'
import ErrorBoundary from '../../../components/ErrorBoundary'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import ConnectedDevices from '../../../components/ConnectedDevices'
import LoginHistory from '../../../components/LoginHistory'
import PasswordChangeFr from '../../passwordchange/password-change-fr.jsx'

export default function SettingsPage () {
	const { t, i18n } = useTranslation()
	const [profile, setProfile] = useState({
		username: '',
		email: '',
		createdAt: '',
		lastSignInAt: '',
	})
	const [isEditingUsername, setIsEditingUsername] = useState(false)
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
	const [showPasswordChange, setShowPasswordChange] = useState(false)
	const [message, setMessage] = useState('')
	const [googleStatus, setGoogleStatus] = useState(null)
	const [isGoogleConnected, setIsGoogleConnected] = useState(false)
	const location = useLocation()
	const navigate = useNavigate()

	useEffect(() => {
		const fetchProfile = async () => {
			const res = await fetch('http://localhost:3001/api/me', { credentials: 'include' })
			if (!res.ok) return
			const user = await res.json()
			setProfile({
				username: user.username || '',
				email: user.email || '',
				createdAt: user.createdAt
					? new Date(user.createdAt).toLocaleDateString('fr-FR')
					: '',
				lastSignInAt: user.lastSignInAt
					? new Date(user.lastSignInAt).toLocaleDateString('fr-FR')
					: '',
			})
		}
		fetchProfile()
	}, [])

	useEffect(() => {
		// Vérifie le paramètre d'URL pour afficher un message après intégration Google
		const params = new URLSearchParams(window.location.search)
		const googleParam = params.get('google')
		if (googleParam === 'success') {
			setGoogleStatus('success')
			setMessage('Google Calendar connecté avec succès !')
		} else if (googleParam === 'error') {
			setGoogleStatus('error')
			setMessage('Erreur lors de la connexion à Google Calendar.')
		}
	}, [])

	useEffect(() => {
		// Si on arrive sur /dashboard/integrations?google=success, redirige vers /dashboard/settings
		if (location.pathname === '/dashboard/integrations') {
			navigate('/dashboard/settings?google=success', { replace: true })
		}
	}, [location, navigate])

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

	const handleUsernameChange = (e) => {
		setProfile((prev) => ({ ...prev, username: e.target.value }))
	}

	const handleSaveUsername = async () => {
		setIsEditingUsername(false)
		// TODO: Appelle ton backend pour mettre à jour le username
	}

	const handleLanguageChange = (e) => {
		const selectedLanguage = e.target.value
		i18n.changeLanguage(selectedLanguage)
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
				setMessage('Google Calendar déconnecté avec succès.')
			} else {
				setMessage('Erreur lors de la déconnexion Google Calendar.')
			}
		} catch {
			setMessage('Erreur réseau lors de la déconnexion.')
		}
	}

	const sections = [
		{
			title: 'Profil Utilisateur',
			items: [
				{
					label: 'Nom d\'utilisateur',
					content: isEditingUsername ? (
						<div className='flex items-center space-x-2'>
							<input
								type='text'
								value={profile.username}
								onChange={handleUsernameChange}
								className='border rounded px-2 py-1'
							/>
							<button
								onClick={handleSaveUsername}
								className='bg-blue-500 text-white px-3 py-1 rounded cursor-pointer'
							>
								Sauvegarder
							</button>
						</div>
					) : (
						<div className='flex items-center space-x-2'>
							<span>{profile.username}</span>
							<button
								onClick={() => setIsEditingUsername(true)}
								className='text-blue-500 underline cursor-pointer'
							>
								Modifier
							</button>
						</div>
					),
				},
				{
					label: 'Adresse e-mail',
					content: <span className='ml-8'>{profile.email}</span>,
				},
				{ label: 'Date de création', content: <span>{profile.createdAt}</span> },
				{ label: 'Dernière connexion', content: <span>{profile.lastSignInAt}</span> },
			],
			icon: <FaUser className='text-blue-500' />,
		},
		{
			title: 'Préférences',
			items: [
				{
					content: (
						<div className='flex items-center space-x-6'>
							<label htmlFor='language-select' className='font-medium'>
								Langue
							</label>
							<select
								id='language-select'
								value={i18n.language}
								onChange={handleLanguageChange}
								className='border rounded px-4 py-2 w-40 cursor-pointer'
							>
								<option value='fr'>Français</option>
								<option value='en'>English</option>
							</select>
						</div>
					),
				},
			],
			icon: <FaCog className='text-green-500' />,
		},
		{
			title: 'Sécurité',
			items: [
				{
					label: '',
					content: (
						<button
							className='bg-blue-600 text-white px-8 py-2 rounded cursor-pointer hover:bg-blue-900 transition-colors'
							onClick={() => setShowPasswordChange(true)}
						>
							Changer le mot de passe
						</button>
					),
				},
				{
					label: '',
					content: <ConnectedDevices />,
				},
				{
					label: '',
					content: <LoginHistory />,
				},
			],
			icon: <FaShieldAlt className='text-red-500' />,
		},
		{
			title: 'Intégrations',
			items: [
				{
					label: '',
					content: (
						<div>
							{googleStatus === 'success' && (
								<div className='mb-2 text-green-600 font-semibold flex items-center gap-2'>
									<svg className='w-5 h-5 inline-block' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' /></svg>
									Google Calendar connecté
								</div>
							)}
							{googleStatus === 'error' && (
								<div className='mb-2 text-red-600 font-semibold flex items-center gap-2'>
									<svg className='w-5 h-5 inline-block' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' /></svg>
									Erreur Google Calendar
								</div>
							)}
							{isGoogleConnected ? (
								<button
									className='bg-rose-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-rose-700 transition-colors'
									onClick={handleDisconnectGoogle}
								>
									Déconnecter Google Calendar
								</button>
							) : (
								<button
									className='bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-900 transition-colors'
									onClick={handleConnectGoogle}
								>
									Connecter Google Calendar
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
			title: 'Support',
			items: [
				{ label: 'FAQ' },
				{ label: 'Contacter le support' },
				{ label: 'Documentation' },
			],
			icon: <FaQuestionCircle className='text-gray-500' />,
		},
		{
			title: 'Autres',
			items: [
				{ label: 'Exporter les données' },
				{ label: 'Supprimer les données' },
			],
			icon: <FaTrashAlt className='text-black' />,
		},
	]

	if (showPasswordChange) {
		return <PasswordChangeFr />
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
