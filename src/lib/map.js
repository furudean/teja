/**
 * @param {string} coordinate
 * @returns {L.LatLngLiteral}
 */
export function local_to_lat_long(coordinate) {
	const pattern = /\((?<y>\d+\.\d+), (?<x>\d+\.\d+), \d+\.\d+\)/

	const { y, x } = coordinate.match(pattern)?.groups ?? {}

	if (typeof y === 'undefined' || typeof x === 'undefined') {
		throw new TypeError(`bad local coordinate ${coordinate}`)
	}

	return {
		lat: Number(x) / 255,
		lng: Number(y) / 255
	}
}

/**
 * @param {string} coordinate
 * @returns {L.LatLngLiteral}
 */
export function region_to_lat_long(coordinate) {
	const pattern = /.+ \((?<y>\d+), (?<x>\d+)/

	const { y, x } = coordinate.match(pattern)?.groups ?? {}

	if (typeof y === 'undefined' || typeof x === 'undefined') {
		throw new TypeError(`bad region coordinate ${coordinate}`)
	}

	return {
		lat: Number(x) / 256,
		lng: Number(y) / 256
	}
}

/**
 * @param {L.LatLngLiteral} a
 * @param {L.LatLngLiteral} b
 * @returns {L.LatLngLiteral}
 */
export function translate(a, b) {
	return {
		lat: a.lat + b.lat,
		lng: a.lng + b.lng
	}
}
