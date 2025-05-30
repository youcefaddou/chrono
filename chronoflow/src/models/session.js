import mongoose from 'mongoose'

const sessionSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	device: String,
	browser: String,
	ip: String,
	createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Session || mongoose.model('Session', sessionSchema)
