import { PASSPHRASE } from '$env/static/private'

export const handle = async ({ event, resolve }) => {
	// get cookies from browser
	const session = event.cookies.get('session')

	event.locals.authenticated = session === PASSPHRASE

	return await resolve(event)
}
