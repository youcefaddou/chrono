import { serve } from 'https://deno.land/std@0.203.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

serve(async (req) => {
	const supabase = createClient(
		Deno.env.get('SUPABASE_URL'),
		Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
	)
	const now = new Date().toISOString()
	const { data: tasks, error } = await supabase
		.from('tasks')
		// Retire is_paused de la sélection et du filtre si la colonne n'existe pas
		.select('id, start, is_finished, duration_seconds')
		.eq('is_finished', false)
		.lte('start', now)
	if (error) {
		console.log('SELECT ERROR', error)
		return new Response(JSON.stringify({
			error,
			message: error.message,
			details: error.details,
			hint: error.hint,
			code: error.code,
		}), { status: 500 })
	}

	try {
		for (const task of tasks ?? []) {
			const lastTick = new Date(task.start)
			const delta = Math.floor((Date.now() - lastTick.getTime()) / 1000)
			if (delta > 0) {
				const newDuration = (task.duration_seconds || 0) + delta
				const { error: updateError } = await supabase
					.from('tasks')
					.update({
						duration_seconds: newDuration,
					})
					.eq('id', task.id)
					.select()
				if (updateError) {
					console.log('UPDATE ERROR', updateError)
					return new Response(JSON.stringify({
						updateError,
						message: updateError.message,
						details: updateError.details,
						hint: updateError.hint,
						code: updateError.code,
					}), { status: 500 })
				}
			}
		}
		return new Response(JSON.stringify({ ok: true }))
	} catch (err) {
		console.log('CATCH ERROR', err)
		return new Response(JSON.stringify({
			error: err,
			message: err?.message,
			stack: err?.stack,
		}), { status: 500 })
	}
})