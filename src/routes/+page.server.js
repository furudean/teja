import { redirect } from '@sveltejs/kit'

/** @type {import('./$types').PageServerLoad} */
export const load = async () => {
	throw redirect(302, '/status')
}
