import { SECOND_LIFE_API_KEY } from '$env/static/private'

/**
 * @param {object} arg
 * @param {string} arg.username
 * @param {string | undefined} arg.lastname
 */
export async function name_to_agent_id({ username, lastname }) {
	if (!lastname) lastname = 'Resident'

	const rq = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Api-Key': SECOND_LIFE_API_KEY
		},
		body: JSON.stringify({ username, lastname })
	}

	console.log(rq)

	const res = await fetch('https://api.secondlife.com/get_agent_id', rq)

	if (!res.ok) throw Error('bad response from SL api')

	const data = await res.json()

	return data.agent_id
}
