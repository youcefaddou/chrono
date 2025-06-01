// Script to migrate GoogleEventTime documents to set missing 'title' from Google Calendar API
// Usage: node server/scripts/migrate-google-event-titles.js

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { google } from 'googleapis'
import GoogleEventTime from '../../src/models/google-event-time.js'
import User from '../../src/models/user.js'

dotenv.config({ path: '.env' })

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI
if (!MONGO_URI) {
	console.error('Missing MONGO_URI in environment')
	process.exit(1)
}

async function main () {
	await mongoose.connect(MONGO_URI)
	console.log('Connected to MongoDB')

	const users = await User.find({ googleCalendarTokens: { $exists: true, $ne: null } })
	for (const user of users) {
		const oauth2Client = new google.auth.OAuth2(
			process.env.GOOGLE_CLIENT_ID,
			process.env.GOOGLE_CLIENT_SECRET,
			process.env.GOOGLE_REDIRECT_URI,
		)
		oauth2Client.setCredentials(user.googleCalendarTokens)
		const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
		const now = new Date()
		const maxDate = new Date()
		maxDate.setDate(now.getDate() + 90)
		const response = await calendar.events.list({
			calendarId: 'primary',
			timeMin: now.toISOString(),
			timeMax: maxDate.toISOString(),
			singleEvents: true,
			orderBy: 'startTime',
		})
		const events = response.data.items
		const eventMap = {}
		for (const event of events) {
			eventMap[event.id] = event
		}
		const googleEvents = await GoogleEventTime.find({ userId: user._id })
		for (const ge of googleEvents) {
			const gEvent = eventMap[ge.eventId]
			if (gEvent) {
				const newTitle = gEvent.summary || gEvent.title || '(Google event)'
				const newDesc = gEvent.description || ''
				if (!ge.title || ge.title === '(Google event)' || ge.title === '' || ge.title === undefined) {
					ge.title = newTitle
					ge.description = newDesc
					await ge.save()
					console.log(`Updated eventId=${ge.eventId} for user=${user.email}`)
				}
			}
		}
	}
	console.log('Migration complete')
	process.exit(0)
}

main().catch(err => {
	console.error('Migration error:', err)
	process.exit(1)
})
