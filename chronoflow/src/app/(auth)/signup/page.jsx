import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '../../../lib/supabase'
import { Link, useNavigate } from 'react-router-dom'

const passwordRegex =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]).{8,}$/

const signupSchema = z.object({
	email: z.string().email('Email invalide'),
	password: z
		.string()
		.min(8, 'Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial')
		.regex(
			passwordRegex,
			'Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial'
		),
	confirmPassword: z.string().min(8, '8 caractères minimum'),
}).refine(data => data.password === data.confirmPassword, {
	message: 'Les mots de passe ne correspondent pas',
	path: ['confirmPassword'],
})

export default function SignupPage () {
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(signupSchema),
		mode: 'onChange',
	})

	const onSubmit = async ({ email, password }) => {
		setError('')
		setLoading(true)
		const { error: signUpError } = await supabase.auth.signUp({
			email,
			password,
		})
		setLoading(false)
		if (signUpError) {
			setError(signUpError.message)
		} else {
			navigate('/dashboard')
		}
	}

	return (
		<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-rose-100 to-blue-100 px-4">
			<div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
				<h1 className="text-2xl font-bold mb-6 text-center text-rose-700">Créer un compte</h1>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
							autoComplete="new-password"
							className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
							{...register('password')}
							disabled={loading}
						/>
						{errors.password && (
							<p className="text-rose-600 text-sm mt-1">{errors.password.message}</p>
						)}
					</div>
					<div>
						<label className="block mb-1 font-medium text-gray-700" htmlFor="confirmPassword">
							Confirmer le mot de passe
						</label>
						<input
							id="confirmPassword"
							type="password"
							autoComplete="new-password"
							className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
							{...register('confirmPassword')}
							disabled={loading}
						/>
						{errors.confirmPassword && (
							<p className="text-rose-600 text-sm mt-1">{errors.confirmPassword.message}</p>
						)}
					</div>
					{error && (
						<div className="bg-rose-100 text-rose-700 px-3 py-2 rounded text-sm">
							{error}
						</div>
					)}
					<button
						type="submit"
						className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-60"
						disabled={loading}
					>
						{loading ? 'Création...' : 'Créer un compte'}
					</button>
				</form>
				<div className="mt-6 text-center text-sm text-gray-600">
					Déjà un compte ?{' '}
					<Link to="/login" className="text-rose-600 hover:underline">
						Se connecter
					</Link>
				</div>
			</div>
		</div>
	)
}
