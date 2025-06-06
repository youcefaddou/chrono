'use client'

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Sidebar from '../../components/dashboard/Sidebar'
import DashboardHeader from '../../components/dashboard/DashboardHeader'

export default function DashboardPage () {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
	const navigate = useNavigate()
	const { t } = useTranslation()

	useEffect(() => {
		const getUser = async () => {
			try {
				const res = await fetch('http://localhost:3001/api/me', { credentials: 'include' })
				if (res.ok) {
					const userData = await res.json()
					setUser(userData)
				} else {
					setUser(null)
					navigate('/login')
				}
			} catch (err) {
				setUser(null)
				navigate('/login')
			} finally {
				setLoading(false)
			}
		}
		getUser()
	}, [navigate])

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
			</div>
		)
	}

	if (!user) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<p className='text-gray-600'>Utilisateur non connecté. Redirection...</p>
			</div>
		)
	}

	return (
		<div className='flex min-h-screen h-screen bg-white'>
			<Sidebar
				user={user}
				collapsed={sidebarCollapsed}
				onToggle={() => setSidebarCollapsed(v => !v)}
			/>
			<main
				className={
					'flex-1 flex flex-col transition-all duration-200 min-w-0 h-full ' +
					(sidebarCollapsed ? 'ml-10' : 'ml-5')
				}
			>
				<DashboardHeader
					user={user}
					sidebarCollapsed={sidebarCollapsed}
					setSidebarCollapsed={setSidebarCollapsed}
				/>
				{/* La grille est désormais gérée uniquement dans DashboardHeader */}
			</main>
		</div>
	)
}
