import { list_bans } from '$lib/prisma.server'

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	const bans = await list_bans()

	const uuids = bans.map((ban) => ban.uuid).join(':')

	return new Response(uuids)
}
