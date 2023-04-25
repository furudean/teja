import { list_clients } from '$lib/prisma.server'

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const clients = await list_clients()

	return {
		clients
	}
}

/** @type {import('./$types').Actions} */
export const actions = {}
