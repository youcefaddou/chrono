import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI

export async function connectMongo () {
	if (mongoose.connection.readyState === 1) return
	await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
}
