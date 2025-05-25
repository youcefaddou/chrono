import { serve } from 'https://deno.land/std@0.203.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

serve(async (req) => {
	const supabase = createClient(
		Deno.env.get('SUPABASE_URL'),
		Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
	)
	
	try {
		// Récupérer toutes les tâches avec des durées anormales (plus de 24 heures = 86400 secondes)
		const { data: tasks, error } = await supabase
			.from('tasks')
			.select('id, title, start, end, duration_seconds')
			.gt('duration_seconds', 86400) // Plus de 24 heures
		
		if (error) {
			console.log('SELECT ERROR', error)
			return new Response(JSON.stringify({
				error,
				message: error.message,
			}), { status: 500 })
		}

		console.log(`Found ${tasks?.length || 0} tasks with abnormal durations`)
		
		let fixedCount = 0
		
		for (const task of tasks ?? []) {
			// Calculer la durée correcte basée sur start/end
			const startTime = new Date(task.start)
			const endTime = new Date(task.end)
			const correctDuration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
			
			// S'assurer que la durée est raisonnable (max 24h pour une tâche)
			const safeDuration = Math.min(Math.max(0, correctDuration), 86400)
			
			console.log(`Task "${task.title}": ${task.duration_seconds}s → ${safeDuration}s`)
			
			// Mettre à jour avec la durée corrigée
			const { error: updateError } = await supabase
				.from('tasks')
				.update({
					duration_seconds: safeDuration,
				})
				.eq('id', task.id)
			
			if (updateError) {
				console.log('UPDATE ERROR for task', task.id, updateError)
			} else {
				fixedCount++
			}
		}
		
		return new Response(JSON.stringify({ 
			ok: true, 
			message: `Fixed ${fixedCount} tasks with abnormal durations`,
			tasksFound: tasks?.length || 0,
			tasksFixed: fixedCount
		}))
		
	} catch (err) {
		console.log('CATCH ERROR', err)
		return new Response(JSON.stringify({
			error: err,
			message: err?.message,
			stack: err?.stack,
		}), { status: 500 })
	}
})
