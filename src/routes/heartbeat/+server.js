// {
// 	'user-agent': 'Second-Life-LSL/2023-04-03.579248 (https://secondlife.com)',
// 	'x-real-ip': '35.91.18.87',
// 	'x-secondlife-local-position': '(141.747360, 87.869370, 231.889694)',
// 	'x-secondlife-local-rotation': '(0.000000, 0.000000, 0.000000, 1.000000)',
// 	'x-secondlife-local-velocity': '(0.000000, 0.000000, 0.000000)',
// 	'x-secondlife-object-key': '926f28dc-bf24-99de-b960-b4ab3d403f8d',
// 	'x-secondlife-object-name': 'teja ban client',
// 	'x-secondlife-owner-key': 'abab9a59-0a83-4cbd-8a5e-f8667c40eb17',
// 	'x-secondlife-owner-name': 'glue9 Resident',
// 	'x-secondlife-region': 'Lendrum (283136, 262912)',
// 	'x-secondlife-shard': 'Production',
// }

import { heartbeat } from '$lib/prisma.server'

/** @type {import('./$types').RequestHandler} */
export async function GET({ request }) {
	// console.log(Object.fromEntries(request.headers.entries()))

	// older version used body instead of query param
	const script_version =
		(await request.text()) ?? new URL(request.url).searchParams.get('version')

	const get = (/** @type {string} */ key) => request.headers.get(key) ?? ''

	await heartbeat({
		object_key: get('x-secondlife-object-key'),
		object_name: get('x-secondlife-object-name'),
		owner_key: get('x-secondlife-owner-key'),
		owner_name: get('x-secondlife-owner-name'),
		region: get('x-secondlife-region'),
		position: get('x-secondlife-local-position'),
		ip: get('x-real-ip'),
		script_version
	})

	return new Response()
}
