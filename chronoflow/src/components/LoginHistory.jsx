import React, { useEffect, useState } from 'react'

function LoginHistory () {
	const [history, setHistory] = useState([])
	const [loading, setLoading] = useState(true)
	const [open, setOpen] = useState(false)

	useEffect(() => {
		const fetchHistory = async () => {
			try {
				const res = await fetch('http://localhost:3001/api/login-history', { credentials: 'include' })
				const data = await res.json()
				setHistory(data)
			} catch {
				setHistory([])
			}
			setLoading(false)
		}
		fetchHistory()
	}, [])

	return (
		<div className='w-full'>
			<button
				type='button'
				className='flex items-center justify-between w-full px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition font-semibold'
				onClick={() => setOpen(v => !v)}
				aria-expanded={open}
			>
				<span>Historique des connexions</span>
				<span className={`transform transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
			</button>
			{open && (
				<div className='mt-2'>
					{loading ? (
						<div className='text-gray-500'>Chargement...</div>
					) : history.length === 0 ? (
						<div className='text-gray-500'>Aucune connexion récente.</div>
					) : (
						<div className='overflow-x-auto'>
							<table className='min-w-full bg-white rounded shadow'>
								<thead>
									<tr>
										<th className='px-4 py-2 text-left'>Date</th>
										<th className='px-4 py-2 text-left'>IP</th>
										<th className='px-4 py-2 text-left'>Appareil</th>
										<th className='px-4 py-2 text-left'>Statut</th>
									</tr>
								</thead>
								<tbody>
									{history.map(log => (
										<tr key={log._id} className='border-t'>
											<td className='px-4 py-2'>{log.date ? new Date(log.date).toLocaleString('fr-FR') : '-'}</td>
											<td className='px-4 py-2'>{log.ip || '-'}</td>
											<td className='px-4 py-2'>{log.device || '-'}</td>
											<td className={`px-4 py-2 ${log.success ? 'text-green-600' : 'text-red-600'}`}>
												{log.success ? 'Succès' : 'Échec'}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

export default LoginHistory
