import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function list_bans() {
	const bans = await prisma.ban.findMany({
		where: {
			revoked: null
		}
	})

	return bans
}

/**
 * @param {object} arg
 * @param {string} arg.uuid
 * @param {string} arg.username
 * @param {boolean} arg.return_objects
 * @param {string?} arg.note
 */
export async function add_ban({ uuid, username, return_objects, note }) {
	await prisma.ban.upsert({
		where: {
			uuid
		},
		update: {
			revoked: null,
			instated: new Date(),
			username,
			uuid,
			return_objects,
			note
		},
		create: {
			username,
			uuid,
			return_objects,
			note
		}
	})
}

/**
 * @param {object} arg
 * @param {string} arg.uuid
 */
export async function remove_ban({ uuid }) {
	await prisma.ban.update({
		where: {
			uuid
		},
		data: {
			revoked: new Date(),
			note: null
		}
	})
}

/**
 * @param {object} arg
 * @param {string} arg.object_key
 * @param {string} arg.object_name
 * @param {string} arg.owner_key
 * @param {string} arg.owner_name
 * @param {string} arg.region
 * @param {string} arg.position
 * @param {string} arg.ip
 */
export async function heartbeat({
	object_key,
	object_name,
	owner_key,
	owner_name,
	region,
	position,
	ip
}) {
	const non_key = { object_name, owner_key, owner_name, region, position, ip }
	await prisma.client.upsert({
		where: {
			object_key
		},
		create: { object_key, ...non_key },
		update: non_key
	})
}
