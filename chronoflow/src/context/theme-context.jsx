'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
	const [theme, setTheme] = useState('light') // Default to light mode

	// Apply the theme to the <html> element
	useEffect(() => {
		const root = document.documentElement
		root.classList.remove('light', 'dark') // Remove existing theme classes
		root.classList.add(theme) // Add the current theme class

	}, [theme])

	const toggleTheme = () => {
		setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'))
	}

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	)
}

export const useTheme = () => {
	const context = useContext(ThemeContext)
	if (!context) {
		throw new Error('useTheme must be used within a ThemeProvider')
	}
	return context
}
