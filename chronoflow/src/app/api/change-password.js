import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { connectMongo } from '../../lib/mongoose.js'
import User from '../../models/user.js'

export default async function handler (req, res) {
	if (req.method !== 'POST') {
		return res.status(405).json({ message: 'Method not allowed' })
	}

	await connectMongo()

	const token = req.cookies.token
	if (!token) return res.status(401).json({ message: 'Not authenticated' })

	let decoded
	try {
		decoded = jwt.verify(token, process.env.JWT_SECRET)
	} catch (err) {
		return res.status(401).json({ message: 'Invalid token' })
	}

	const { oldPassword, newPassword } = req.body
	if (!oldPassword || !newPassword) {
		return res.status(400).json({ message: 'Missing fields' })
	}

	const user = await User.findById(decoded.id)
	if (!user) return res.status(404).json({ message: 'User not found' })

	const valid = await bcrypt.compare(oldPassword, user.password)
	if (!valid) return res.status(401).json({ message: 'Old password incorrect' })

	const hash = await bcrypt.hash(newPassword, 10)
	user.password = hash
	await user.save()

	// Invalider le token courant (déconnexion)
	res.clearCookie('token', {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		path: '/',
	})

	return res.json({ success: true, message: 'Password changed, please log in again.' })
}
