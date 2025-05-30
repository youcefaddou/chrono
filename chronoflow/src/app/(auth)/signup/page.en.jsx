import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'

const passwordRegex =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]).{8,}$/

const signupSchema = z.object({
	email: z.string().email('Invalid email'),
	username: z.string().min(3, 'Username is required'),
	password: z
		.string()
		.min(8, 'Password must contain an uppercase, a lowercase, a number and a special character')
		.regex(
			passwordRegex,
			'Password must contain an uppercase, a lowercase, a number and a special character'
		),
	confirmPassword: z.string().min(8, 'At least 8 characters'),
}).refine(data => data.password === data.confirmPassword, {
	message: 'Passwords do not match',
	path: ['confirmPassword'],
})

export default function SignupPageEn () {
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const [success, setSuccess] = useState(false)
	const navigate = useNavigate()
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(signupSchema),
		mode: 'onChange',
	})

	const onSubmit = async ({ email, username, password }) => {
		setError('')
		setSuccess(false)
		setLoading(true)
		try {
			const res = await fetch('http://localhost:3001/api/signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, username, password }),
			})
			const data = await res.json()
			setLoading(false)
			if (!res.ok) throw new Error(data.message || 'Signup failed')
			setSuccess(true)
			setTimeout(() => {
				localStorage.setItem('token', data.token)
				navigate('/dashboard')
			}, 1200)
		} catch (err) {
			setLoading(false)
			setError(err.message)
		}
	}

	return (
		<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-rose-100 to-blue-100 px-4">
			<div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
				<h1 className="text-2xl font-bold mb-6 text-center text-rose-700">Create an account</h1>
				{success && (
					<div className="bg-green-100 text-green-700 px-3 py-2 rounded text-sm mb-4 text-center">
						Account created successfully!
					</div>
				)}
				{error && (
					<div className="bg-rose-100 text-rose-700 px-3 py-2 rounded text-sm mb-4">
						{error}
					</div>
				)}
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
						<label className="block mb-1 font-medium text-gray-700" htmlFor="username">
							Username
						</label>
						<input
							id="username"
							type="text"
							autoComplete="username"
							className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
							{...register('username')}
							disabled={loading}
						/>
						{errors.username && (
							<p className="text-rose-600 text-sm mt-1">{errors.username.message}</p>
						)}
					</div>
					<div>
						<label className="block mb-1 font-medium text-gray-700" htmlFor="password">
							Password
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
							Confirm password
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
						{loading ? 'Creating...' : 'Create an account'}
					</button>
				</form>
				<div className="mt-6 text-center text-sm text-gray-600">
					Already have an account?{' '}
					<Link to="/en/login" className="text-rose-600 hover:underline">
						Sign in
					</Link>
				</div>
			</div>
		</div>
	)
}
