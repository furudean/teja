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
 * @param {string?} arg.note
 */
export async function add_ban({ uuid, username, note }) {
	await prisma.ban.upsert({
		where: {
			uuid
		},
		update: {
			revoked: null,
			note,
			instated: new Date()
		},
		create: {
			username,
			uuid
		}
	})
}
