import { add_ban, list_bans } from '$lib/prisma.server'
import { formal_string } from '$lib/form'
import { error } from '@sveltejs/kit'
import { name_to_agent_id } from '$lib/sl.server'

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const bans = await list_bans()

	return {
		bans: bans
	}
}

const IS_UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i

/** @type {import('./$types').Actions} */
export const actions = {
	ban: async ({ request }) => {
		const form = await request.formData()

		let uuid = formal_string(form.get('uuid'))
		const uname = formal_string(form.get('uname'))
		const note = formal_string(form.get('note'))

		if (!uuid && uname) {
			const [username, lastname] = uname.split(' ')
			uuid = await name_to_agent_id({
				username,
				lastname
			})
		}

		if (!uuid || !IS_UUID.test(uuid)) {
			throw error(400, 'missing username or uuid in request')
		}

		await add_ban({ uuid, note })
	}
}
