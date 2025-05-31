import mongoose from 'mongoose'

const googleEventTimeSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	eventId: { type: String, required: true }, // ID Google Calendar
	durationSeconds: { type: Number, default: 0 },
	updatedAt: { type: Date, default: Date.now },
})

googleEventTimeSchema.index({ userId: 1, eventId: 1 }, { unique: true })

export default mongoose.models.GoogleEventTime || mongoose.model('GoogleEventTime', googleEventTimeSchema)
