import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
	email: { type: String, required: true, unique: true },
	username: { type: String, required: true },
	password: { type: String, required: true },
	createdAt: { type: Date, default: Date.now },
	lastSignInAt: { type: Date, default: null },
})

export default mongoose.models.User || mongoose.model('User', userSchema)
