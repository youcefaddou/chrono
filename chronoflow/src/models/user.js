import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
	email: { type: String, required: true, unique: true },
	username: { type: String, required: true },
	password: { type: String }, // <-- supprime "required: true"
	createdAt: { type: Date, default: Date.now },
	lastSignInAt: { type: Date },
	provider: { type: String }, // pour OAuth
	providerId: { type: String }, // pour OAuth
})

export default mongoose.models.User || mongoose.model('User', userSchema)
