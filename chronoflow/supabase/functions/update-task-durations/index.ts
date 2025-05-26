// import { serve } from 'https://deno.land/std@0.203.0/http/server.ts'
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

// serve(async (req) => {
// 	const supabase = createClient(
// 		Deno.env.get('SUPABASE_URL'),
// 		Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
// 	)
// 	const now = new Date().toISOString()
// 	const { data: tasks, error } = await supabase
// 		.from('tasks')
// 		// Récupérer les tâches non terminées avec les champs nécessaires
// 		.select('id, start, end, is_finished, duration_seconds, updated_at')
// 		.eq('is_finished', false)
// 		.lte('start', now)
// 	if (error) {

// 		return new Response(JSON.stringify({
// 			error,
// 			message: error.message,
// 			details: error.details,
// 			hint: error.hint,
// 			code: error.code,
// 		}), { status: 500 })
// 	}

// 	try {
// 		for (const task of tasks ?? []) {

// 			const startTime = new Date(task.start)
// 			const endTime = new Date(task.end)
			
// 			// Calculer la durée prévue de la tâche (end - start)
// 			const plannedDuration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
			
// 			// Pour les tâches actives, utiliser la durée prévue ou calculer depuis le début
// 			// mais ne PAS accumuler à chaque appel
// 			const calculatedDuration = Math.max(0, plannedDuration)
			
// 			// Seulement mettre à jour si la durée calculée est différente
// 			if (calculatedDuration !== (task.duration_seconds || 0)) {
// 				const { error: updateError } = await supabase
// 					.from('tasks')
// 					.update({
// 						duration_seconds: calculatedDuration,
// 					})
// 					.eq('id', task.id)
// 					.select()
// 				if (updateError) {

// 					return new Response(JSON.stringify({
// 						updateError,
// 						message: updateError.message,
// 						details: updateError.details,
// 						hint: updateError.hint,
// 						code: updateError.code,
// 					}), { status: 500 })
// 				}
// 			}
// 		}
// 		return new Response(JSON.stringify({ ok: true }))
// 	} catch (err) {

// 		return new Response(JSON.stringify({
// 			error: err,
// 			message: err?.message,
// 			stack: err?.stack,
// 		}), { status: 500 })
// 	}
// })

// import { serve } from 'https://deno.land/std@0.203.0/http/server.ts'

// serve(async (req) => {
// 	// Fonction désactivée - retourne simplement un OK sans traitement
// 	return new Response(JSON.stringify({ 
// 		ok: true, 
// 		disabled: true,
// 		message: 'Function disabled - not needed for this SaaS application' 
// 	}), {
// 		headers: { 'Content-Type': 'application/json' }
// 	})
// })