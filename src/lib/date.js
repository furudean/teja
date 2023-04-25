import { Temporal } from 'temporal-polyfill'

/**
 * @param {Date} date
 */
export function since(date) {
	const now = Temporal.Now.instant()
	const date_temporal = Temporal.Instant.from(date.toISOString())

	return now.since(date_temporal)
}

/**
 * @param {Date} date
 */
export function relative_date(date) {
	const now = new Date()
	const elapsed = Math.floor((now.getTime() - date.getTime()) / 1000)

	if (elapsed < 10) {
		return 'now'
	}

	if (elapsed < 60) {
		return `${elapsed}s`
	}

	if (elapsed < 3600) {
		const minutes = since(date).round('minutes').minutes
		return `${minutes}m`
	}

	if (elapsed < 3600 * 24) {
		const hours = since(date).round('hours').hours
		return `${hours}h`
	}

	if (elapsed < 3600 * 24 * 31) {
		const days = since(date).round('days').days

		return `${days}d`
	}

	return date.toLocaleDateString('en-US')
}
