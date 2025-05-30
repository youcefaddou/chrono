import express from 'express'
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { connectMongo } from './lib/mongoose.js'
import User from './models/user.js'
import Task from './models/task.js'

const app = express()
app.use(cookieParser())
app.use(cors({
	origin: 'http://localhost:5173',
	credentials: true,
}))
app.use(express.json())

// Middleware global pour connecter MongoDB une seule fois
app.use(async (req, res, next) => {
	await connectMongo()
	next()
})

// Signup
app.post('/api/signup', async (req, res) => {
	try {
		const { email, username, password } = req.body
		const existing = await User.findOne({ email })
		if (existing) return res.status(409).json({ message: 'Email already registered' })
		const hash = await bcrypt.hash(password, 10)
		const now = new Date()
		const user = await User.create({
			email,
			username,
			password: hash,
			createdAt: now,
			lastSignInAt: now,
		})
		res.status(201).json({
			user: {
				id: user._id,
				email: user.email,
				username: user.username,
				createdAt: user.createdAt,
				lastSignInAt: user.lastSignInAt,
			},
		})
	} catch (err) {
		res.status(400).json({ error: err.message })
	}
})

// Login
app.post('/api/login', async (req, res) => {
	try {
		const { email, password } = req.body
		const user = await User.findOne({ email })
		if (!user) return res.status(401).json({ message: 'Invalid credentials' })
		const valid = await bcrypt.compare(password, user.password)
		if (!valid) return res.status(401).json({ message: 'Invalid credentials' })
		const now = new Date()
		// Pour les anciens users, initialise lastSignInAt si absent
		if (!user.lastSignInAt) user.lastSignInAt = now
		else user.lastSignInAt = now
		await user.save()
		const token = jwt.sign(
			{
				id: user._id,
				email: user.email,
				username: user.username,
				createdAt: user.createdAt,
				lastSignInAt: user.lastSignInAt,
			},
			process.env.JWT_SECRET,
			{ expiresIn: '7d' }
		)
		res.cookie('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000,
			path: '/',
		})
		res.json({
			user: {
				id: user._id,
				email: user.email,
				username: user.username,
				createdAt: user.createdAt,
				lastSignInAt: user.lastSignInAt,
			},
		})
	} catch (err) {
		console.error('LOGIN ERROR:', err)
		res.status(400).json({ error: err.message })
	}
})

// Logout
app.post('/api/logout', (req, res) => {
	res.clearCookie('token', {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		path: '/',
	})
	res.json({ success: true })
})

// Auth middleware
function auth (req, res, next) {
	const token = req.cookies.token
	if (!token) {
		console.log('No token in cookies')
		return res.status(401).json({ message: 'No token' })
	}
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		req.user = decoded
		next()
	} catch (err) {
		console.error('JWT verification failed:', err)
		res.status(401).json({ message: 'Invalid token' })
	}
}

// Get current user
app.get('/api/me', auth, async (req, res) => {
	const user = await User.findById(req.user.id)
	if (!user) return res.status(404).json({ message: 'User not found' })
	res.json({
		id: user._id,
		email: user.email,
		username: user.username,
		createdAt: user.createdAt,
		lastSignInAt: user.lastSignInAt,
	})
})

// Tasks CRUD
app.get('/api/tasks', auth, async (req, res) => {
	const tasks = await Task.find({ userId: req.user.id })
	res.json(tasks)
})

app.post('/api/tasks', auth, async (req, res) => {
	try {
		const { title, description, start, end, color } = req.body
		const task = await Task.create({
			title,
			description,
			start,
			end,
			color,
			userId: req.user.id,
			isFinished: false,
			durationSeconds: 0,
		})
		res.status(201).json(task)
	} catch (err) {
		res.status(400).json({ error: err.message })
	}
})

app.put('/api/tasks/:id', auth, async (req, res) => {
	const { id } = req.params
	const update = req.body
	const task = await Task.findOneAndUpdate({ _id: id, userId: req.user.id }, update, { new: true })
	res.json(task)
})

app.delete('/api/tasks/:id', auth, async (req, res) => {
	const { id } = req.params
	await Task.deleteOne({ _id: id, userId: req.user.id })
	res.json({ success: true })
})

app.get('/', (req, res) => {
	res.send('API is running')
})

const port = process.env.PORT || 3001
app.listen(port, () => {
	console.log('Server started on port', port)
})
