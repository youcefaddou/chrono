import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '../../../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'

const passwordRegex =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]).{8,}$/

const loginSchema = z.object({
	email: z.string().email('Invalid email'),
	password: z
		.string()
		.min(8, 'Password must contain an uppercase, a lowercase, a number and a special character')
		.regex(
			passwordRegex,
			'Password must contain an uppercase, a lowercase, a number and a special character'
		),
})

export default function LoginPageEn () {
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()
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
		const { error: signInError } = await supabase.auth.signInWithPassword({
			email,
			password,
		})
		setLoading(false)
		if (signInError) {
			setError(signInError.message)
		} else {
			navigate('/dashboard')
		}
	}

	const handleOAuth = async provider => {
		setError('')
		setLoading(true)
		const { error } = await supabase.auth.signInWithOAuth({ provider })
		setLoading(false)
		if (error) setError(error.message)
	}

	return (
		<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-rose-100 to-blue-100 px-4">
			<div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
				<h1 className="text-2xl font-bold mb-6 text-center text-rose-700">Sign in</h1>
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
							Password
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
						{loading ? 'Signing in...' : 'Sign in'}
					</button>
				</form>
				<div className="flex flex-col gap-4 mb-4">
					<button
						type="button"
						onClick={() => handleOAuth('google')}
						className="cursor-pointer w-full flex items-center justify-center gap-2  hover:bg-gray-700 hover:text-white bg-white border border-gray-300  text-gray-700 font-semibold py-2 rounded-lg shadow transition disabled:opacity-60"
						disabled={loading}
					>
						<img src="/assets/images/google.png" alt="Google" className="w-5 h-5" />
						Sign in with Google
					</button>
					<button
						type="button"
						onClick={() => handleOAuth('github')}
						className="cursor-pointer w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-rose-800 text-white font-semibold py-2 rounded-lg shadow transition disabled:opacity-60"
						disabled={loading}
					>
						<img src="/assets/images/github.png" alt="GitHub" className="w-5 h-5 bg-white rounded-full p-0.2" />
						Sign in with GitHub
					</button>
				</div>
				<div className="mt-6 text-center text-sm text-gray-600">
					Don't have an account?{' '}
					<Link to="/en/signup" className="text-rose-600 hover:underline">
						Create an account
					</Link>
				</div>
			</div>
		</div>
	)
}
