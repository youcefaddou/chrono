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
		const { eventId, durationSeconds, isFinished, title, description } = req.body
		if (!eventId || typeof durationSeconds !== 'number') {
			return res.status(400).json({ error: 'eventId et durationSeconds requis' })
		}
		const update = { durationSeconds, updatedAt: new Date() }
		if (typeof isFinished === 'boolean') update.isFinished = isFinished
		if (typeof title === 'string') update.title = title
		if (typeof description === 'string') update.description = description
		const updated = await GoogleEventTime.findOneAndUpdate(
			{ userId, eventId },
			update,
			{ upsert: true, new: true }
		)
		res.json(updated)
	} catch (err) {
		console.error('[GoogleEventTime][POST] Erreur:', err)
		res.status(500).json({ error: 'Erreur lors de la sauvegarde du temps Google Calendar' })
	}
})

// PATCH: Met à jour start/end et titre/description pour un événement Google (local uniquement)
router.patch('/google-calendar/event-times/:eventId', auth, async (req, res) => {
	try {
		const userId = req.user.id
		const { eventId } = req.params
		const { start, end, title, description } = req.body
		if (!eventId) {
			return res.status(400).json({ error: 'eventId requis' })
		}
		const update = { updatedAt: new Date() }
		if (start) update.start = start
		if (end) update.end = end
		if (typeof title === 'string') update.title = title
		if (typeof description === 'string') update.description = description
		if (typeof req.body.isFinished === 'boolean') update.isFinished = req.body.isFinished
		const updated = await GoogleEventTime.findOneAndUpdate(
			{ userId, eventId },
			update,
			{ upsert: true, new: true }
		)
		res.json(updated)
	} catch (err) {
		console.error('[GoogleEventTime][PATCH] Erreur:', err)
		res.status(500).json({ error: 'Erreur lors de la mise à jour locale de l’événement Google' })
	}
})

// DELETE: Supprime l'événement Google localement (ne touche pas Google Calendar)
router.delete('/google-calendar/event-times/:eventId', auth, async (req, res) => {
	try {
		const userId = req.user.id
		const { eventId } = req.params
		if (!eventId) {
			return res.status(400).json({ error: 'eventId requis' })
		}
		await GoogleEventTime.deleteOne({ userId, eventId })
		res.json({ success: true })
	} catch (err) {
		console.error('[GoogleEventTime][DELETE] Erreur:', err)
		res.status(500).json({ error: 'Erreur lors de la suppression locale de l’événement Google' })
	}
})

export default router
