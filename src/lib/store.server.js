import { readFileSync, renameSync, writeFileSync } from 'node:fs'
import { env } from '$env/dynamic/private'

const BANS_FILE = env.BANS_FILE ?? 'bans.json'

/**
 * @typedef {object} Ban
 * @property {string} uuid
 * @property {string} username
 */

/**
 * @typedef {object} Client
 * @property {string} object_key
 * @property {string} object_name
 * @property {string} owner_key
 * @property {string} owner_name
 * @property {string} region
 * @property {string} position
 * @property {string} ip
 * @property {string} script_version
 * @property {Date} first_ping
 * @property {Date} last_ping
 */

/** @type {Ban[]} */
let bans = []

/** @type {Date | null} */
let bans_synced = null

try {
	const saved = JSON.parse(readFileSync(BANS_FILE, 'utf8'))

	bans = saved.bans
	bans_synced = new Date(saved.synced)
} catch {
	// no saved list yet
}

/** @type {Map<string, Client>} */
const clients = new Map()

export function list_bans() {
	return bans_synced ? bans : null
}

export function get_bans_synced() {
	return bans_synced
}

/** @param {Ban[]} new_bans */
export function set_bans(new_bans) {
	bans = new_bans
	bans_synced = new Date()

	const tmp = BANS_FILE + '.tmp'

	writeFileSync(tmp, JSON.stringify({ synced: bans_synced, bans }))
	renameSync(tmp, BANS_FILE)
}

/**
 * @param {Omit<Client, 'first_ping' | 'last_ping'>} client
 */
export function heartbeat(client) {
	const now = new Date()
	const existing = clients.get(client.object_key)

	clients.set(client.object_key, {
		...client,
		first_ping: existing?.first_ping ?? now,
		last_ping: now
	})
}

export function list_clients() {
	const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000

	for (const [key, client] of clients) {
		if (client.last_ping.getTime() < cutoff) clients.delete(key)
	}

	return [...clients.values()].sort(
		(a, b) =>
			b.first_ping.getTime() - a.first_ping.getTime() ||
			a.owner_key.localeCompare(b.owner_key)
	)
}
