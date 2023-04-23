import { redirect } from '@sveltejs/kit'

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ locals }) => {
	if (!locals.authenticated) {
		throw redirect(302, 'login')
	}
}

/** @type {import('./$types').Actions} */
export const actions = {
	async default({ cookies }) {
		cookies.set('session', '', {
			path: '/',
			expires: new Date(0)
		})

		throw redirect(302, 'login')
	}
}
