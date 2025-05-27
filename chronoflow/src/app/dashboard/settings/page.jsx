'use client'

import { useState, useEffect } from 'react'
import { FaUser, FaEnvelope, FaSave, FaEdit, FaCalendarAlt } from 'react-icons/fa'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function SettingsPage () {
	const [profile, setProfile] = useState({
		username: '',
		email: '',
		createdAt: '',
		lastSignInAt: '',
		provider: '',
	})
	const [isEditing, setIsEditing] = useState(false)

	// Fetch user profile from Supabase Auth
	useEffect(() => {
		const fetchProfile = async () => {
			// Récupérer l'utilisateur connecté
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

			// Mettre à jour le profil avec les données disponibles
			setProfile({
				username: user.user_metadata?.user_name || '',
				email: user.email || '',
				createdAt: new Date(user.created_at).toLocaleDateString(),
				lastSignInAt: new Date(user.last_sign_in_at).toLocaleDateString(),
				provider: user.app_metadata?.provider || 'email',
			})
		}

		fetchProfile()
	}, [])

	const handleInputChange = (e) => {
		const { name, value } = e.target
		setProfile((prev) => ({ ...prev, [name]: value }))
	}

	const handleSaveProfile = async (e) => {
		e.preventDefault()
		setIsEditing(false)

		// Mettre à jour les métadonnées utilisateur
		const { error } = await supabase.auth.updateUser({
			data: { user_name: profile.username },
		})

		if (error) {
			console.error('Erreur lors de la sauvegarde du profil:', error)
		} else {
			alert('Profil sauvegardé avec succès !')
		}
	}

	const handleEditProfile = () => {
		setIsEditing(true)
	}

	return (
		<div className='p-8 space-y-8 bg-gray-100 min-h-screen'>
			<h1 className='text-3xl font-bold text-blue-700 mb-6'>Paramètres</h1>

			{/* Section Profil */}
			<section className='bg-white shadow-lg rounded-lg p-6'>
				<div className='flex items-center mb-4'>
					<FaUser className='text-blue-500 text-2xl mr-3' />
					<h2 className='text-2xl font-semibold text-gray-800'>Profil</h2>
				</div>
				<form className='space-y-6' onSubmit={handleSaveProfile}>
					<div>
						<label htmlFor='username' className='block text-sm font-medium text-gray-700'>
							Nom d'utilisateur
						</label>
						<input
							type='text'
							id='username'
							name='username'
							value={profile.username}
							onChange={handleInputChange}
							disabled={!isEditing}
							className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
								isEditing ? 'bg-white' : 'bg-gray-100 cursor-not-allowed'
							}`}
							placeholder="Votre nom d'utilisateur"
						/>
					</div>
					<div>
						<label htmlFor='email' className='block text-sm font-medium text-gray-700'>
							Email
						</label>
						<p className='mt-1 text-sm text-gray-700 font-semibold rounded-md'>
							{profile.email}
						</p>
					</div>
					<div>
						<label htmlFor='createdAt' className='block text-sm font-medium text-gray-700'>
							Date de création
						</label>
						<div className='mt-1 text-sm text-gray-600'>{profile.createdAt}</div>
					</div>
					<div>
						<label htmlFor='lastSignInAt' className='block text-sm font-medium text-gray-700'>
							Dernière connexion
						</label>
						<div className='mt-1 text-sm text-gray-600'>{profile.lastSignInAt}</div>
					</div>
					<div>
						<label htmlFor='provider' className='block text-sm font-medium text-gray-700'>
							Fournisseur d'authentification
						</label>
						<div className='mt-1 text-sm text-gray-600 capitalize'>{profile.provider}</div>
					</div>
					<div className='flex justify-end gap-4'>
						<button
							type='button'
							onClick={handleEditProfile}
							disabled={isEditing}
							className={`flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 ${
								isEditing ? 'opacity-50 cursor-not-allowed' : ''
							}`}
						>
							<FaEdit />
							Modifier
						</button>
						<button
							type='submit'
							disabled={!isEditing}
							className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
								!isEditing ? 'opacity-50 cursor-not-allowed' : ''
							}`}
						>
							<FaSave />
							Sauvegarder
						</button>
					</div>
				</form>
			</section>
		</div>
	)
}
