import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function IntegrationsPage () {
	const location = useLocation()
	const navigate = useNavigate()

	const [isGoogleConnected, setIsGoogleConnected] = useState(false)
	const [syncing, setSyncing] = useState(false)
	const [message, setMessage] = useState('')

	useEffect(() => {
		const params = new URLSearchParams(location.search)
		const googleParam = params.get('google')
		if (googleParam === 'success' || googleParam === 'error') {
			setTimeout(() => {
				navigate(`/dashboard/settings?google=${googleParam}`, { replace: true })
			}, 1200)
		}
	}, [location, navigate])

	const handleConnectGoogle = async () => {
		window.location.href = 'http://localhost:3001/api/integrations/google-calendar/auth'
	}

	const handleSyncTasks = async () => {
		setSyncing(true)
		setMessage('')
		try {
			const res = await fetch('/api/integrations/google-calendar/sync', {
				method: 'POST',
				credentials: 'include',
			})
			if (res.ok) {
				setMessage('Synchronisation réussie !')
			} else {
				setMessage('Erreur lors de la synchronisation.')
			}
		} catch {
			setMessage('Erreur réseau.')
		}
		setSyncing(false)
	}

	return (
		<div className='p-8'>
			<h1 className='text-2xl font-bold mb-4'>Intégrations</h1>
			<p className='mb-8'>Connecte ton compte Google Calendar pour synchroniser tes tâches.</p>
			<div className='mb-6 flex flex-col gap-4'>
				{!isGoogleConnected ? (
					<button
						className='bg-blue-600 text-white px-4 py-2 rounded'
						onClick={handleConnectGoogle}
					>
						Connecter Google Calendar
					</button>
				) : (
					<button
						className='bg-green-600 text-white px-4 py-2 rounded'
						onClick={handleSyncTasks}
						disabled={syncing}
					>
						{syncing ? 'Synchronisation...' : 'Synchroniser mes tâches'}
					</button>
				)}
				{message && <div className='text-sm text-gray-700'>{message}</div>}
			</div>
			<hr className='my-8' />
			<h2 className='text-xl font-bold mb-2'>Notifications par email</h2>
			<p className='mb-4'>Active les notifications pour recevoir des emails lors d’actions importantes (sécurité, rappels...)</p>
			{/* Ici tu pourras ajouter un toggle ou une config pour activer les emails */}
			{(new URLSearchParams(location.search).get('google') === 'success') && (
				<div className='mt-4 text-green-600'>Connexion réussie, redirection...</div>
			)}
			{(new URLSearchParams(location.search).get('google') === 'error') && (
				<div className='mt-4 text-red-600'>Erreur lors de la connexion, redirection...</div>
			)}
		</div>
	)
}
