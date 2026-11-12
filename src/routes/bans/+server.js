import { error } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'
import { has_bearer } from '$lib/auth.server'
import { list_bans, set_bans } from '$lib/store.server'

const IS_UUID =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * @type {import('./$types').RequestHandler}
 */
export async function GET({ request }) {
	if (!has_bearer(request, env.CLIENT_SECRET)) throw error(401, 'bad secret')

	const bans = list_bans()

	if (!bans) throw error(503, 'ban list not synced yet')

	const body = bans.flatMap((ban) => [ban.uuid, ban.username]).join('::')

	return new Response(body)
}

/**
 * @type {import('./$types').RequestHandler}
 */
export async function PUT({ request }) {
	if (!has_bearer(request, env.ADMIN_SECRET)) throw error(401, 'bad secret')

	/** @type {unknown} */
	let body

	try {
		body = await request.json()
	} catch {
		throw error(400, 'body is not json')
	}

	if (!Array.isArray(body)) throw error(400, 'body is not a list')

	const bans = body.map((item) => {
		const uuid = String(item?.uuid ?? '')

		if (!IS_UUID.test(uuid)) throw error(400, `bad uuid ${uuid}`)

		return {
			uuid: uuid.toLowerCase(),
			username: String(item.username ?? '').replaceAll('::', '')
		}
	})

	set_bans(bans)

	return new Response(String(bans.length))
}
