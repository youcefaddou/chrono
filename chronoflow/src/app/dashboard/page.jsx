'use client'

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import Sidebar from '../../components/dashboard/Sidebar'
import DashboardHeader from '../../components/dashboard/DashboardHeader'
import CalendarGrid from '../../components/dashboard/CalendarGrid'
import RightPanel from '../../components/dashboard/RightPanel'
import { GlobalTimerProvider } from '../../components/Timer/GlobalTimerProvider'

export default function DashboardPage () {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)
	const [showCalendar, setShowCalendar] = useState(true)
	const navigate = useNavigate()
	const { t } = useTranslation()

	useEffect(() => {
		const getUser = async () => {
			const { data } = await supabase.auth.getUser()
			if (!data?.user) {
				navigate('/login')
			} else {
				setUser(data.user)
			}
			setLoading(false)
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

	return (
		<GlobalTimerProvider>
			<div className='flex min-h-screen bg-white'>
				<Sidebar
					user={user}
					onSmartTimerClick={() => setShowCalendar(true)}
				/>
				<main className='flex-1 flex flex-col'>
					<DashboardHeader />
					{/* SUPPRIME ce bloc pour ne plus afficher CalendarGrid ici */}
					{/* 
					<div className='flex flex-1'>
						<div className='flex-1 overflow-auto'>
							{showCalendar && <CalendarGrid />}
						</div>
						{/* <RightPanel /> */}
					
					
				</main>
			</div>
		</GlobalTimerProvider>
	)
}
