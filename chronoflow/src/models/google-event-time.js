import mongoose from 'mongoose'

const googleEventTimeSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	eventId: { type: String, required: true }, // ID Google Calendar
	title: { type: String, default: '' }, // Event title from Google Calendar
	description: { type: String, default: '' }, // Event description from Google Calendar
	durationSeconds: { type: Number, default: 0 },
	start: { type: Date }, // Ajout pour déplacement local
	end: { type: Date }, // Ajout pour déplacement local
	updatedAt: { type: Date, default: Date.now },
	isFinished: { type: Boolean, default: false },
})

googleEventTimeSchema.index({ userId: 1, eventId: 1 }, { unique: true })

export default mongoose.models.GoogleEventTime || mongoose.model('GoogleEventTime', googleEventTimeSchema)
