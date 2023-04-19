import { name_to_agent_id } from '$lib/sl.server'
import { error } from '@sveltejs/kit'

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const name = url.searchParams.get('name')?.toString()

	if (!name) throw error(400, 'missing name in query')

	const [username, lastname] = name.split(' ')

	const uuid = await name_to_agent_id({
		username,
		lastname
	})

	return new Response(
		JSON.stringify({
			uuid
		})
	)
}
