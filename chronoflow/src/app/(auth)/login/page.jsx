import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const passwordRegex =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]).{8,}$/

const loginSchema = z.object({
	email: z.string().email('Email invalide'),
	password: z
		.string()
		.min(8, 'Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial')
		.regex(
			passwordRegex,
			'Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial'
		),
})

export default function LoginPage () {
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()
	const { t, i18n } = useTranslation()
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(loginSchema),
		mode: 'onChange',
	})

	const onSubmit = async ({ email, password }) => {
		setError('')
		setLoading(true)
		try {
			const res = await fetch('http://localhost:3001/api/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
				credentials: 'include',
			})
			const data = await res.json()
			setLoading(false)
			if (!res.ok) throw new Error(data.message || data.error || 'Login failed')
			navigate('/dashboard')
		} catch (err) {
			setLoading(false)
			setError(err.message)
		}
	}

	return (
		<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-rose-100 to-blue-100 px-4">
			<div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
				<h1 className="text-2xl font-bold mb-6 text-center text-rose-700">Connexion</h1>
				{error && (
					<div className="bg-rose-100 text-rose-700 px-3 py-2 rounded text-sm mb-4">
						{error}
					</div>
				)}
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mb-4">
					<div>
						<label className="block mb-1 font-medium text-gray-700" htmlFor="email">
							Email
						</label>
						<input
							id="email"
							type="email"
							autoComplete="email"
							className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
							{...register('email')}
							disabled={loading}
						/>
						{errors.email && (
							<p className="text-rose-600 text-sm mt-1">{errors.email.message}</p>
						)}
					</div>
					<div>
						<label className="block mb-1 font-medium text-gray-700" htmlFor="password">
							Mot de passe
						</label>
						<input
							id="password"
							type="password"
							autoComplete="current-password"
							className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
							{...register('password')}
							disabled={loading}
						/>
						{errors.password && (
							<p className="text-rose-600 text-sm mt-1">{errors.password.message}</p>
						)}
					</div>
					<button
						type="submit"
						className="cursor-pointer w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-60"
						disabled={loading}
					>
						{loading ? 'Connexion...' : 'Se connecter'}
					</button>
				</form>
				<div className="flex flex-col gap-2 mt-4">
					<button
						type="button"
						onClick={() => {
							window.location.assign('http://localhost:3001/api/auth/google')
						}}
						className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
					>
						{t('header.login')} avec Google
					</button>
				</div>
				<div className="mt-6 text-center text-sm text-gray-600">
					Pas encore de compte ?{' '}
					<Link to="/signup" className="text-rose-600 hover:underline">
						Créer un compte
					</Link>
				</div>
			</div>
		</div>
	)
}
