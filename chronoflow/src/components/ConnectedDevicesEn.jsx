import React, { useEffect, useState } from 'react'

function ConnectedDevicesEn () {
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
				<span>Connected Devices</span>
				<span className={`transform transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
			</button>
			{open && (
				<div className='mt-2'>
					{loading ? (
						<div className='text-gray-500'>Loading...</div>
					) : devices.length === 0 ? (
						<div className='text-gray-500'>No connected device.</div>
					) : (
						<div className='overflow-x-auto'>
							<table className='min-w-full bg-white rounded shadow'>
								<thead>
									<tr>
										<th className='px-4 py-2 text-left'>Device</th>
										<th className='px-4 py-2 text-left'>IP</th>
										<th className='px-4 py-2 text-left'>Browser</th>
										<th className='px-4 py-2 text-left'>Connected at</th>
									</tr>
								</thead>
								<tbody>
									{devices.map(device => (
										<tr key={device._id} className='border-t'>
											<td className='px-4 py-2'>{device.device || 'Unknown'}</td>
											<td className='px-4 py-2'>{device.ip || '-'}</td>
											<td className='px-4 py-2'>{device.browser || '-'}</td>
											<td className='px-4 py-2'>{device.createdAt ? new Date(device.createdAt).toLocaleString('en-GB') : '-'}</td>
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

export default ConnectedDevicesEn
