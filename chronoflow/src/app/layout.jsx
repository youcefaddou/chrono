'use client'

import React from 'react'
import { ThemeProvider } from '../context/theme-context'
import Header from '../components/Header/Header'
import Footer from '../components/Footer/Footer'

export default function Layout ({ children }) {
	return (
		<ThemeProvider>
			<html lang="en">
				<body className="bg-lightBackground text-lightText dark:bg-darkBackground dark:text-darkText">
					<div className="min-h-screen flex flex-col">
						<Header />
						<main className="flex-1">
							{children}
						</main>
						<Footer />
					</div>
				</body>
			</html>
		</ThemeProvider>
	)
}
