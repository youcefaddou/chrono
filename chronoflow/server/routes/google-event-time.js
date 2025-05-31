import express from 'express'
import GoogleEventTime from '../../src/models/google-event-time.js'
import { auth } from '../../src/middlewares/auth.js'

const router = express.Router()

// GET: Récupère tous les temps suivis pour les événements Google de l'utilisateur
router.get('/google-calendar/event-times', auth, async (req, res) => {
	try {
		const userId = req.user.id
		const eventTimes = await GoogleEventTime.find({ userId })
		res.json(eventTimes)
	} catch (err) {
		console.error('[GoogleEventTime][GET] Erreur:', err)
		res.status(500).json({ error: 'Erreur lors de la récupération des temps Google Calendar' })
	}
})

// POST: Crée ou met à jour le temps suivi pour un événement Google
router.post('/google-calendar/event-times', auth, async (req, res) => {
	try {
		const userId = req.user.id
		const { eventId, durationSeconds } = req.body
		if (!eventId || typeof durationSeconds !== 'number') {
			return res.status(400).json({ error: 'eventId et durationSeconds requis' })
		}
		const updated = await GoogleEventTime.findOneAndUpdate(
			{ userId, eventId },
			{ durationSeconds, updatedAt: new Date() },
			{ upsert: true, new: true }
		)
		res.json(updated)
	} catch (err) {
		console.error('[GoogleEventTime][POST] Erreur:', err)
		res.status(500).json({ error: 'Erreur lors de la sauvegarde du temps Google Calendar' })
	}
})

export default router
