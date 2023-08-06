import { fail, redirect } from '@sveltejs/kit'
import { PASSPHRASE } from '$env/static/private'
import { dev } from '$app/environment'

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ locals }) => {
	if (locals.authenticated) {
		throw redirect(302, '/')
	}
}

/** @type {import('./$types').Actions} */
export const actions = {
	async login({ cookies, request }) {
		const form = await request.formData()
		const passphrase = form.get('passphrase')

		if (!passphrase) return fail(400, { credentials: true })

		if (passphrase !== PASSPHRASE) return fail(400, { credentials: true })

		cookies.set('session', passphrase, {
			// send cookie for every page
			path: '/',
			// server side only cookie so you can't use `document.cookie`
			httpOnly: true,
			// only requests from same site can send cookies
			// https://developer.mozilla.org/en-US/docs/Glossary/CSRF
			sameSite: 'strict',
			// only sent over HTTPS in production
			secure: !dev,
			// set cookie to expire after a month
			maxAge: 60 * 60 * 24 * 30
		})

		// redirect the user
		throw redirect(302, '/admin')
	}
}
