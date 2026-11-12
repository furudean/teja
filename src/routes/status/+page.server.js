import { get_bans_synced, list_bans, list_clients } from '$lib/store.server'

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	return {
		clients: list_clients(),
		ban_count: list_bans()?.length ?? 0,
		bans_synced: get_bans_synced()
	}
}
