import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function IntegrationsPageEn () {
	const location = useLocation()
	const navigate = useNavigate()

	useEffect(() => {
		const params = new URLSearchParams(location.search)
		const googleParam = params.get('google')
		if (googleParam === 'success' || googleParam === 'error') {
			setTimeout(() => {
				navigate(`/en/dashboard/settings?google=${googleParam}`, { replace: true })
			}, 1200)
		}
	}, [location, navigate])

	return (
		<div className='p-8'>
			<h1 className='text-2xl font-bold mb-4'>Integrations</h1>
			<p>Connect your Google Calendar account to sync your tasks.</p>
			<button className='bg-blue-600 text-white px-6 py-2 rounded mt-6'>Connect Google Calendar</button>
			{(new URLSearchParams(location.search).get('google') === 'success') && (
				<div className='mt-4 text-green-600'>Connected successfully, redirecting...</div>
			)}
			{(new URLSearchParams(location.search).get('google') === 'error') && (
				<div className='mt-4 text-red-600'>Error connecting, redirecting...</div>
			)}
		</div>
	)
}
