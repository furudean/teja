/** @param {unknown} maybe_string */
export function formal_string(maybe_string) {
	if (typeof maybe_string === 'string') {
		if (maybe_string.trim().length === 0) return null

		return maybe_string.trim()
	}

	return null
}
