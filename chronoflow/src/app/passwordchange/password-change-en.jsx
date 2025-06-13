import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const passwordRegex =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]).{8,}$/

const schema = z.object({
	oldPassword: z.string().min(8, 'Password required'),
	newPassword: z
		.string()
		.min(8, 'Password must contain uppercase, lowercase, number and special character')
		.regex(
			passwordRegex,
			'Password must contain uppercase, lowercase, number and special character'
		),
	confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
	message: 'Passwords do not match',
	path: ['confirmPassword'],
})

export default function PasswordChangeEn () {
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [loading, setLoading] = useState(false)
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm({
		resolver: zodResolver(schema),
		mode: 'onChange',
	})

	const onSubmit = async ({ oldPassword, newPassword }) => {
		setError('')
		setSuccess('')
		setLoading(true)
		try {
			const res = await fetch('http://localhost:3001/api/change-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ oldPassword, newPassword }),
			})
			const data = await res.json()
			setLoading(false)
			if (!res.ok) throw new Error(data.message || data.error || 'Error')
			setSuccess('Password changed. Please log in again.')
			reset()
		} catch (err) {
			setLoading(false)
			setError(err.message)
		}
	}

	return (
		<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-rose-100 to-blue-100 px-4">
			<div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
				<h1 className="text-2xl font-bold mb-6 text-center text-rose-700">Change password</h1>
				{error && (
					<div className="bg-rose-100 text-rose-700 px-3 py-2 rounded text-sm mb-4">
						{error}
					</div>
				)}
				{success && (
					<div className="bg-green-100 text-green-700 px-3 py-2 rounded text-sm mb-4">
						{success}
					</div>
				)}
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mb-4">
					<div>
						<label className="block mb-1 font-medium text-gray-700" htmlFor="oldPassword">
							Old password
						</label>
						<input
							id="oldPassword"
							type="password"
							autoComplete="current-password"
							className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
							{...register('oldPassword')}
							disabled={loading}
						/>
						{errors.oldPassword && (
							<p className="text-rose-600 text-sm mt-1">{errors.oldPassword.message}</p>
						)}
					</div>
					<div>
						<label className="block mb-1 font-medium text-gray-700" htmlFor="newPassword">
							New password
						</label>
						<input
							id="newPassword"
							type="password"
							autoComplete="new-password"
							className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
							{...register('newPassword')}
							disabled={loading}
						/>
						{errors.newPassword && (
							<p className="text-rose-600 text-sm mt-1">{errors.newPassword.message}</p>
						)}
					</div>
					<div>
						<label className="block mb-1 font-medium text-gray-700" htmlFor="confirmPassword">
							Confirm new password
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
					<button
						type="submit"
						className="cursor-pointer w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-60"
						disabled={loading}
					>
						{loading ? 'Changing...' : 'Change password'}
					</button>
				</form>
			</div>
		</div>
	)
}
