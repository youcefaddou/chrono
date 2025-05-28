'use client'

import { useState, useEffect } from 'react'
import { FaUser, FaCog, FaShieldAlt, FaPlug, FaQuestionCircle, FaTrashAlt } from 'react-icons/fa'
import { createClient } from '@supabase/supabase-js'
import Sidebar from '../../../components/dashboard/Sidebar'
import ErrorBoundary from '../../../components/ErrorBoundary'

const supabase = createClient(
	import.meta.env.VITE_SUPABASE_URL,
	import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function SettingsPage () {
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
				console.error('Erreur lors de la récupération de la session utilisateur:', sessionError)
				return
			}

			const user = session?.session?.user

			if (!user) {
				console.error('Aucun utilisateur connecté')
				return
			}

			// Extraire les métadonnées utilisateur directement depuis la session
			const rawUserMetaData = user.user_metadata || {}
			const displayName = rawUserMetaData.name || rawUserMetaData.full_name || 'Non défini'

			// Mettre à jour le profil avec les données récupérées
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
			console.error('Erreur lors de la sauvegarde du nom:', error)
		} else {
			console.log('Nom sauvegardé avec succès !')
		}
	}

	const sections = [
		{
			title: 'Profil Utilisateur',
			items: [
				{
					label: 'Nom',
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
								Sauvegarder
							</button>
						</div>
					) : (
						<div className='flex items-center space-x-2'>
							<span>{profile.displayName}</span>
							<button
								onClick={() => setIsEditingName(true)}
								className='text-blue-500 underline'
							>
								Modifier
							</button>
						</div>
					),
				},
				{
					label: 'Adresse e-mail',
					content: <span className='ml-8'>{profile.email}</span>, // Added spacing
				},
				{ label: 'Date de création', content: <span>{profile.createdAt}</span> },
				{ label: 'Dernière connexion', content: <span>{profile.lastSignInAt}</span> },
			],
			icon: <FaUser className='text-blue-500' />,
		},
		{
			title: 'Préférences',
			items: [
				{ label: 'Langue' },
				{ label: 'Thème' },
				{ label: 'Notifications' },
			],
			icon: <FaCog className='text-green-500' />,
		},
		{
			title: 'Sécurité',
			items: [
				{ label: 'Authentification à deux facteurs' },
				{ label: 'Appareils connectés' },
				{ label: 'Historique des connexions' },
			],
			icon: <FaShieldAlt className='text-red-500' />,
		},
		{
			title: 'Intégrations',
			items: [
				{ label: 'Connecter des services tiers' },
				{ label: 'Gérer les autorisations' },
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
				{ label: 'Réinitialiser' },
				{ label: 'Exporter les données' },
				{ label: 'Supprimer les données' },
			],
			icon: <FaTrashAlt className='text-black' />,
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
					<h1 className='text-3xl font-bold text-blue-700 mb-6'>Paramètres</h1>
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
