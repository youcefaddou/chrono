import React from 'react'

export default class ErrorBoundary extends React.Component {
	constructor (props) {
		super(props)
		this.state = { hasError: false }
	}

	static getDerivedStateFromError () {
		return { hasError: true }
	}

	componentDidCatch (error, errorInfo) {
		console.error('ErrorBoundary caught an error:', error, errorInfo)
	}

	render () {
		if (this.state.hasError) {
			return (
				<div className='flex items-center justify-center min-h-screen'>
					<p className='text-red-500'>Une erreur est survenue. Veuillez réessayer plus tard.</p>
				</div>
			)
		}

		return this.props.children
	}
}
