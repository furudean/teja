import { add_ban, remove_ban, list_bans } from '$lib/prisma.server'
import { formal_string } from '$lib/form'
import { error, redirect } from '@sveltejs/kit'
import { agent_id_to_name } from '$lib/sl.server'

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
	if (!locals.authenticated) {
		throw redirect(302, 'login')
	}

	const bans = await list_bans()

	return {
		bans: bans
	}
}

const IS_UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i

/** @type {import('./$types').Actions} */
export const actions = {
	add_ban: async ({ request }) => {
		const form = await request.formData()

		const uuid = formal_string(form.get('uuid'))
		const return_objects = Boolean(form.get('return_objects'))
		const note = formal_string(form.get('note'))

		if (!uuid || !IS_UUID.test(uuid)) throw error(400, 'bad uuid in request')

		const { username } = await agent_id_to_name(uuid)

		await add_ban({ uuid, username, return_objects, note })
	},
	remove_ban: async ({ request }) => {
		const form = await request.formData()

		const uuid = formal_string(form.get('uuid'))

		if (!uuid || !IS_UUID.test(uuid)) throw error(400, 'bad uuid in request')

		await remove_ban({ uuid })
	}
}
