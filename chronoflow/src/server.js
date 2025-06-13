import express from 'express'
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit' // Ajout du rate limiter
import { connectMongo } from './lib/mongoose.js'
import User from './models/user.js'
import Task from './models/task.js'
import Session from './models/session.js'
import LoginLog from './models/login-log.js'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import integrationsRouter from '../server/routes/integrations.js' 
import googleEventTimeRouter from '../server/routes/google-event-time.js'
import { auth } from './middlewares/auth.js'

const app = express()
app.use(cookieParser())
app.use(cors({
	origin: 'http://localhost:5173',
	credentials: true,
}))
app.use(express.json())

app.use(passport.initialize())

// Middleware global pour connecter MongoDB une seule fois
app.use(async (req, res, next) => {
	await connectMongo()
	next()
})

// Rate limiting global (1000 requêtes / 15 min par IP en dev, 100 en prod)
if (process.env.NODE_ENV === 'production') {
	const limiter = rateLimit({
		windowMs: 15 * 60 * 1000,
		max: 1000,
		standardHeaders: true,
		legacyHeaders: false,
		message: { message: 'Too many requests, please try again later.' },
	})
	app.use(limiter)
}

// Forcer HTTPS en production
if (process.env.NODE_ENV === 'production') {
	app.use((req, res, next) => {
		if (req.headers['x-forwarded-proto'] !== 'https') {
			return res.redirect('https://' + req.headers.host + req.url)
		}
		next()
	})
}

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
		const valid = user ? await bcrypt.compare(password, user.password) : false
		const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
		const userAgent = req.headers['user-agent'] || ''
		const device = userAgent

		// Log de connexion (succès ou échec)
		await LoginLog.create({
			userId: user ? user._id : undefined,
			ip,
			device,
			success: !!user && valid,
		})

		if (!user || !valid) return res.status(401).json({ message: 'Invalid credentials' })

		const now = new Date()
		user.lastSignInAt = now
		await user.save()

		// Session (appareil connecté)
		await Session.create({
			userId: user._id,
			device,
			browser: device,
			ip,
		})

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
	const mapped = tasks.map(task => ({
		id: task._id.toString(),
		title: task.title,
		description: task.description,
		start: task.start ? task.start.toISOString() : null,
		end: task.end ? task.end.toISOString() : null,
		color: task.color,
		userId: task.userId,
		isFinished: task.isFinished,
		durationSeconds: task.durationSeconds,
		// Pour compatibilité, expose aussi _id
		_id: task._id.toString(),
	}))
	res.json(mapped)
})

app.post('/api/tasks', auth, async (req, res) => {
	try {
		const { title, description, start, end, color, durationSeconds, isFinished } = req.body
		const task = await Task.create({
			title,
			description,
			start,
			end,
			color,
			userId: req.user.id,
			isFinished: isFinished === true,
			durationSeconds: typeof durationSeconds === 'number' ? durationSeconds : 0,
		})
		res.status(201).json(task)
	} catch (err) {
		res.status(400).json({ error: err.message })
	}
})

app.put('/api/tasks/:id', auth, async (req, res) => {
	const { id } = req.params
	const update = req.body
	// Forcer la clé camelCase pour la durée
	if ('durationSeconds' in update && typeof update.durationSeconds !== 'number') {
		update.durationSeconds = Number(update.durationSeconds) || 0
	}
	const task = await Task.findOneAndUpdate({ _id: id, userId: req.user.id }, update, { new: true })
	res.json(task)
})

app.delete('/api/tasks/:id', auth, async (req, res) => {
	const { id } = req.params
	await Task.deleteOne({ _id: id, userId: req.user.id })
	res.json({ success: true })
})

// Appareils connectés
app.get('/api/devices', auth, async (req, res) => {
	const sessions = await Session.find({ userId: req.user.id }).sort({ createdAt: -1 })
	res.json(sessions)
})

// Historique des connexions
app.get('/api/login-history', auth, async (req, res) => {
	const logs = await LoginLog.find({ userId: req.user.id }).sort({ date: -1 }).limit(20)
	res.json(logs)
})

// Change password
app.post('/api/change-password', async (req, res) => {
	try {
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
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

// Google OAuth
passport.use(new GoogleStrategy({
	clientID: process.env.GOOGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	callbackURL: '/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
	try {
		let user = await User.findOne({ provider: 'google', providerId: profile.id })
		if (!user) {
			// Vérifie si un utilisateur existe déjà avec ce mail (créé via signup classique ou autre OAuth)
			user = await User.findOne({ email: profile.emails[0].value })
			if (user) {
				// Mets à jour le provider et providerId si besoin
				user.provider = 'google'
				user.providerId = profile.id
				await user.save()
			} else {
				user = await User.create({
					provider: 'google',
					providerId: profile.id,
					username: profile.displayName,
					email: profile.emails[0].value,
					createdAt: new Date(),
					lastSignInAt: new Date(),
				})
			}
		}
		done(null, user)
	} catch (err) {
		done(err)
	}
}))

app.get('/api/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }))

app.get('/api/auth/google/callback',
	passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:5173/login' }),
	(req, res) => {
		const token = jwt.sign(
			{
				id: req.user._id,
				email: req.user.email,
				username: req.user.username,
				createdAt: req.user.createdAt,
				lastSignInAt: req.user.lastSignInAt,
			},
			process.env.JWT_SECRET,
			{ expiresIn: '7d' }
		)
		res.cookie('token', token, {
			httpOnly: true,
			secure: false, // en dev, doit être false
			sameSite: 'lax', // 'lax' pour dev multi-port
			maxAge: 7 * 24 * 60 * 60 * 1000,
			path: '/',
			// PAS de domain ici !
		})
		res.redirect('http://localhost:5173/dashboard')
	}
)

app.use('/api/integrations', integrationsRouter)
app.use('/api/integrations', googleEventTimeRouter)

app.listen(3001, () => {
	console.log('Server running on http://localhost:3001')
})
