import jwt from 'jsonwebtoken'

export function auth (req, res, next) {
	const token = req.cookies.token
	if (!token) {
		return res.redirect('http://localhost:5173/login')
	}
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		req.user = decoded
		next()
	} catch {
		return res.redirect('http://localhost:5173/login')
	}
}
