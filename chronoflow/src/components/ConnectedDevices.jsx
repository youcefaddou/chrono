import React, { useEffect, useState } from 'react'

function ConnectedDevices () {
	const [devices, setDevices] = useState([])
	const [loading, setLoading] = useState(true)
	const [open, setOpen] = useState(false)

	useEffect(() => {
		const fetchDevices = async () => {
			try {
				const res = await fetch('http://localhost:3001/api/devices', { credentials: 'include' })
				const data = await res.json()
				setDevices(data)
			} catch {
				setDevices([])
			}
			setLoading(false)
		}
		fetchDevices()
	}, [])

	return (
		<div className='w-full'>
			<button
				type='button'
				className='flex items-center justify-between w-full px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition font-semibold'
				onClick={() => setOpen(v => !v)}
				aria-expanded={open}
			>
				<span>Appareils connectés</span>
				<span className={`transform transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
			</button>
			{open && (
				<div className='mt-2'>
					{loading ? (
						<div className='text-gray-500'>Chargement...</div>
					) : devices.length === 0 ? (
						<div className='text-gray-500'>Aucun appareil connecté.</div>
					) : (
						<div className='overflow-x-auto'>
							<table className='min-w-full bg-white rounded shadow'>
								<thead>
									<tr>
										<th className='px-4 py-2 text-left'>Appareil</th>
										<th className='px-4 py-2 text-left'>IP</th>
										<th className='px-4 py-2 text-left'>Navigateur</th>
										<th className='px-4 py-2 text-left'>Connecté le</th>
									</tr>
								</thead>
								<tbody>
									{devices.map(device => (
										<tr key={device._id} className='border-t'>
											<td className='px-4 py-2'>{device.device || 'Inconnu'}</td>
											<td className='px-4 py-2'>{device.ip || '-'}</td>
											<td className='px-4 py-2'>{device.browser || '-'}</td>
											<td className='px-4 py-2'>{device.createdAt ? new Date(device.createdAt).toLocaleString('fr-FR') : '-'}</td>
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

export default ConnectedDevices
