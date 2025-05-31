// Page de connexion : permet à l'utilisateur de se connecter via Google ou GitHub avec Supabase OAuth, puis redirige automatiquement vers le dashboard si la session est active
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { useTranslation } from 'react-i18next'

export default function LoginPage () {
	const router = useRouter()
	const { t } = useTranslation()
	const [error, setError] = useState(null)

	useEffect(() => {
		// Vérifie si l'utilisateur est connecté et redirige vers le dashboard
		supabase.auth.getUser().then(({ data, error }) => {
			if (data?.user) {
				router.push('/dashboard')
			}
			if (error) setError(error.message)
		})
	}, [router])

	const handleGoogleLogin = () => {
		window.location.href = 'http://localhost:3001/api/auth/google'
	}

	const handleGithubLogin = () => {
		window.location.href = 'http://localhost:3001/api/auth/github'
	}

	return (
		<div className='p-8'>
			<h1 className='text-3xl font-bold mb-4'>{t('header.login')}</h1>
			{error && (
				<div className='mb-4 text-red-600 bg-red-100 p-2 rounded'>
					{error}
				</div>
			)}
			<button onClick={handleGoogleLogin} className='bg-blue-600 text-white px-4 py-2 rounded'>
				{t('header.login')} with Google
			</button>
			<button onClick={handleGithubLogin} className='bg-gray-600 text-white px-4 py-2 rounded mt-2'>
				{t('header.login')} with GitHub
			</button>
			{/* 
				Si tu utilises Vite (localhost:5173), ce message d'erreur peut apparaître car Vite utilise le mode "file://" ou un proxy local qui empêche l'accès au localStorage/cookies dans certains contextes OAuth.
				Pour éviter ce problème :
				- Utilise Next.js (recommandé pour Supabase + OAuth)
				- Ou déploie sur un vrai domaine (ex: vercel, netlify)
				- Ou configure Vite pour servir sur http://localhost:5173 (pas file://)
				- Vérifie que tu n'ouvres pas le fichier HTML localement (file://)
				- Supabase OAuth nécessite un vrai contexte HTTP/HTTPS pour stocker la session
			*/}
		</div>
	)
}
