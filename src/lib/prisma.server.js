import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function list_bans() {
	const bans = await prisma.ban.findMany()

	return bans
}

/**
 * @param {object} arg
 * @param {string} arg.uuid
 * @param {string?} arg.note
 */
export async function add_ban({ uuid, note }) {
	await prisma.ban.create({
		data: {
			uuid,
			note
		}
	})
}
