/** @type {import('./$types').RequestHandler} */
export async function GET({ request }) {
	console.log(Object.fromEntries(request.headers.entries()))
	console.log(request.body)

	return new Response()
}
