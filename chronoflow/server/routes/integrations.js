import express from 'express'
import { google } from 'googleapis'
import User from '../../src/models/user.js'
import Task from '../../src/models/task.js'
import { auth } from '../../src/middlewares/auth.js'

const router = express.Router()

// Vérifie la présence des variables d'environnement
if (
	!process.env.GOOGLE_CLIENT_ID ||
	!process.env.GOOGLE_CLIENT_SECRET ||
	!process.env.GOOGLE_REDIRECT_URI
) {
	console.error(
		'[Google Calendar] Variables d\'environnement manquantes : ' +
		'GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI'
	)
	// On ne throw pas ici pour ne pas casser le serveur, mais log l'erreur
}

const oauth2Client = new google.auth.OAuth2(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	process.env.GOOGLE_REDIRECT_URI,
)

const SCOPES = [
	'https://www.googleapis.com/auth/calendar',
	'https://www.googleapis.com/auth/userinfo.email',
]

// Redirige l'utilisateur vers Google pour consentement
router.get('/google-calendar/auth', auth, (req, res) => {
	try {
		const url = oauth2Client.generateAuthUrl({
			access_type: 'offline',
			scope: SCOPES,
			prompt: 'consent',
		})
		res.redirect(url)
	} catch (err) {
		console.error('[Google Calendar][Auth] Erreur génération URL:', err)
		res.status(500).send('Erreur Google OAuth')
	}
})

// Callback Google OAuth
router.get('/google-calendar/callback', auth, async (req, res) => {
	const { code } = req.query
	if (!req.user || !req.user.id) {
		return res.status(401).send('Utilisateur non authentifié')
	}
	if (!code) {
		return res.status(400).send('Code manquant')
	}
	try {
		const { tokens } = await oauth2Client.getToken(code)
		// Stocke les tokens dans le profil utilisateur (champ explicite)
		await User.updateOne(
			{ _id: req.user.id },
			{ $set: { googleCalendarTokens: tokens } }
		)
		// Redirection vers le frontend après succès
		res.redirect('http://localhost:5173/dashboard/integrations?google=success')
	} catch (err) {
		console.error('[Google Calendar][Callback] Erreur échange token:', err)
		// Redirection vers le frontend après erreur
		res.redirect('http://localhost:5173/dashboard/integrations?google=error')
	}
})

// Synchronise les tâches avec Google Calendar
router.post('/google-calendar/sync', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id)
		if (!user || !user.googleCalendarTokens) {
			return res.status(400).json({ error: 'Google Calendar non connecté' })
		}

		// Instancie un client OAuth avec les tokens de l'utilisateur
		oauth2Client.setCredentials(user.googleCalendarTokens)

		const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

		// Récupère les tâches à synchroniser (adapte selon ton modèle)
		const tasks = await Task.find({ userId: user._id })

		// Pour chaque tâche, crée un événement dans Google Calendar
		for (const task of tasks) {
			const event = {
				summary: task.title,
				description: task.description || '',
				start: {
					dateTime: task.dueDate ? task.dueDate.toISOString() : new Date().toISOString(),
					timeZone: 'Europe/Paris', // adapte si besoin
				},
				end: {
					dateTime: task.dueDate
						? new Date(new Date(task.dueDate).getTime() + 60 * 60 * 1000).toISOString()
						: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
					timeZone: 'Europe/Paris',
				},
			}
			try {
				await calendar.events.insert({
					calendarId: 'primary',
					resource: event,
				})
			} catch (err) {
				console.error('[Google Calendar][Sync] Erreur création événement:', err)
			}
		}

		res.json({ success: true })
	} catch (err) {
		console.error('[Google Calendar][Sync] Erreur globale:', err)
		res.status(500).json({ error: 'Erreur lors de la synchronisation' })
	}
})

// Récupère les événements Google Calendar de l'utilisateur connecté
router.get('/google-calendar/events', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id)
		if (!user || !user.googleCalendarTokens) {
			return res.status(400).json({ error: 'Google Calendar non connecté' })
		}

		oauth2Client.setCredentials(user.googleCalendarTokens)
		const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

		// Récupère les événements à venir (prochains 30 jours)
		const now = new Date()
		const maxDate = new Date()
		maxDate.setDate(now.getDate() + 30)

		const response = await calendar.events.list({
			calendarId: 'primary',
			timeMin: now.toISOString(),
			timeMax: maxDate.toISOString(),
			singleEvents: true,
			orderBy: 'startTime',
		})

		const events = response.data.items.map(event => ({
			id: event.id,
			summary: event.summary,
			description: event.description,
			start: event.start?.dateTime || event.start?.date,
			end: event.end?.dateTime || event.end?.date,
			location: event.location,
			status: event.status,
			creator: event.creator,
			attendees: event.attendees,
			htmlLink: event.htmlLink,
		}))

		res.json(events)
	} catch (err) {
		console.error('[Google Calendar][Events] Erreur récupération événements:', err)
		res.status(500).json({ error: 'Erreur lors de la récupération des événements Google Calendar' })
	}
})

// Déconnexion Google Calendar (supprime les tokens)
router.post('/google-calendar/disconnect', auth, async (req, res) => {
	try {
		await User.updateOne(
			{ _id: req.user.id },
			{ $unset: { googleCalendarTokens: '' } }
		)
		return res.json({ success: true })
	} catch (err) {
		console.error('[Google Calendar][Disconnect] Erreur suppression tokens:', err)
		return res.status(500).json({ error: 'Erreur lors de la déconnexion Google Calendar' })
	}
})

export default router
