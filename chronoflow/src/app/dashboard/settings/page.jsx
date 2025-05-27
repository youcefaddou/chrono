'use client'

import { useState, useEffect } from 'react'
import { FaUser, FaEnvelope, FaSave, FaEdit, FaCogs, FaKey, FaPlug } from 'react-icons/fa'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function SettingsPage () {
	const [profile, setProfile] = useState({
		name: '',
		email: '',
		username: '',
	})
	const [isEditing, setIsEditing] = useState(false)

	// Fetch user profile from Supabase
	useEffect(() => {
		const fetchProfile = async () => {
			const { data, error } = await supabase
				.from('users')
				.select('name, email')
				.eq('id', supabase.auth.user()?.id)
				.single()

			if (error) {
				console.error('Erreur lors de la récupération du profil:', error)
			} else {
				setProfile({
					name: data.name || '',
					email: data.email || '',
				})
			}
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

		// Update user profile in Supabase
		const { error } = await supabase
			.from('users')
			.update({ username: profile.username })
			.eq('id', supabase.auth.user()?.id)

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
						<label htmlFor='name' className='block text-sm font-medium text-gray-700'>
							Nom
						</label>
						<input
							type='text'
							id='name'
							name='name'
							value={profile.name}
							disabled
							className='mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm'
						/>
					</div>
					<div>
						<label htmlFor='email' className='block text-sm font-medium text-gray-700'>
							Email
						</label>
						<input
							type='email'
							id='email'
							name='email'
							value={profile.email}
							disabled
							className='mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm'
						/>
					</div>
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
							placeholder='Votre nom d\'utilisateur'
						/>
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

			{/* Section Abonnement */}
			<section className='bg-white shadow-lg rounded-lg p-6'>
				<div className='flex items-center mb-4'>
					<FaCogs className='text-green-500 text-2xl mr-3' />
					<h2 className='text-2xl font-semibold text-gray-800'>Abonnement</h2>
				</div>
				<p className='text-sm text-gray-600'>TODO: Ajouter la gestion des abonnements.</p>
			</section>

			{/* Section Intégrations */}
			<section className='bg-white shadow-lg rounded-lg p-6'>
				<div className='flex items-center mb-4'>
					<FaPlug className='text-purple-500 text-2xl mr-3' />
					<h2 className='text-2xl font-semibold text-gray-800'>Intégrations</h2>
				</div>
				<p className='text-sm text-gray-600'>TODO: Ajouter les intégrations (e.g., Google, Slack).</p>
			</section>

			{/* Section 2FA */}
			<section className='bg-white shadow-lg rounded-lg p-6'>
				<div className='flex items-center mb-4'>
					<FaKey className='text-red-500 text-2xl mr-3' />
					<h2 className='text-2xl font-semibold text-gray-800'>Authentification à deux facteurs (2FA)</h2>
				</div>
				<p className='text-sm text-gray-600'>TODO: Ajouter la configuration de l'authentification à deux facteurs.</p>
			</section>
		</div>
	)
}
