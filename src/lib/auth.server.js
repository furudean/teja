import { createHash, timingSafeEqual } from 'node:crypto'

/** @param {string} value */
const digest = (value) => createHash('sha256').update(value).digest()

/**
 * @param {Request} request
 * @param {string | undefined} secret
 */
export function has_bearer(request, secret) {
	if (!secret) return false

	const header = request.headers.get('authorization') ?? ''

	return timingSafeEqual(digest(header), digest(`Bearer ${secret}`))
}
