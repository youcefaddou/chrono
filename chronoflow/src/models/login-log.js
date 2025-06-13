import mongoose from 'mongoose'

const loginLogSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	date: { type: Date, default: Date.now },
	ip: String,
	device: String,
	success: Boolean,
})

export default mongoose.models.LoginLog || mongoose.model('LoginLog', loginLogSchema)
