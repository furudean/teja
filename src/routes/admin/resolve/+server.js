import { name_to_agent_id, agent_id_to_name } from '$lib/sl.server'
import { error } from '@sveltejs/kit'

const headers = {
	'Content-Type': 'application/json'
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, locals }) {
	if (!locals.authenticated) {
		throw error(401, 'Unauthenticated')
	}

	const query = url.searchParams.get('query')

	if (!query) throw error(400, "missing parameter 'query'")

	const [username, lastname] = query.split(' ')

	const uuid = await name_to_agent_id({
		username,
		lastname
	})

	if (!uuid) return new Response('{}', { headers })

	const { display_name } = await agent_id_to_name(uuid)

	return new Response(
		JSON.stringify({
			uuid,
			username,
			display_name
		}),
		{ headers }
	)
}
