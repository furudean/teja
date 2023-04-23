import { list_bans } from '$lib/prisma.server'

/**
 * @param {...unknown[]} arr
 */
function zip_many(...arr) {
	/**
	 * @param {any} _
	 * @param {number} i
	 */
	const zip = (_, i) => arr.map((a) => a[i])
	const length = arr[0].length // assume equal length for all arrays

	return Array.from(Array(length).fill(0), zip)
}

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	const bans = await list_bans()

	const uuids = bans.map((ban) => ban.uuid)
	const object_return = bans.map((ban) => (ban.return_objects ? '1' : '0'))
	const usernames = bans.map((ban) => ban.username)

	const maybe = zip_many(uuids, object_return, usernames).flat().join('::')

	return new Response(maybe)
}
