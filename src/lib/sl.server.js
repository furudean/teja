import { SECOND_LIFE_API_KEY } from '$env/static/private'

/**
 * @param {object} arg
 * @param {string} arg.username
 * @param {string | undefined} arg.lastname
 * @returns {Promise<string | undefined>}
 */
export async function name_to_agent_id({ username, lastname }) {
	if (!lastname) lastname = 'Resident'

	const res = await fetch('https://api.secondlife.com/get_agent_id', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Api-Key': SECOND_LIFE_API_KEY
		},
		body: JSON.stringify({ username, lastname })
	})

	if (res.status === 404) return
	if (res.status > 400) throw Error('bad response from SL api')

	const data = await res.json()

	return data.agent_id
}

const DISPLAYNAME_USERNAME_MATCHER = /(\w+(?: \w+)?)(?: \((.*)\))?/

/** @param {string} uuid */
export async function agent_id_to_name(uuid) {
	const res = await fetch('https://world.secondlife.com/resident/' + uuid)

	if (!res.ok) throw Error('bad response from SL api')

	const html = await res.text()

	const name_username = html.match(/(?<=<title>)(.*)(?=<\/title>)/)?.[0]

	if (!name_username) throw Error('could not find name in ' + res.url)

	// eslint-disable-next-line no-unused-vars
	const match = name_username.match(DISPLAYNAME_USERNAME_MATCHER) ?? []

	const username = match[2] ?? match[1]
	const display_name = match[2]

	if (!username) throw Error('could not find username in string ' + name_username)

	return { display_name, username }
}
