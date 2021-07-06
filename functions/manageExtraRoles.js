const settings = require('../ressources/settings')

/**
 * Manage roles using reactions in the Extra Compliance Server
 */
async function manageExtraRoles(client, reaction, user) {
	const reactID = reaction.emoji.id

	const server = await client.guilds.cache.get(settings.CEXTRAS_ID) || undefined
	const member = server === undefined ? undefined : await server.members.cache.get(user.id)

	if (member === undefined) return

	switch (reactID) {
		case '782350092106465300': // addons
			if (member.roles.cache.some(r => r.id === '860462015864111114')) member.roles.remove('860462015864111114')
			else member.roles.add('860462015864111114')
			break
		case '782350111694651452': // tweaks
			if (member.roles.cache.some(r => r.id === '860462167249780737')) member.roles.remove('860462167249780737')
			else member.roles.add('860462167249780737')
			break
		case '782350147119218718': // mods
			if (member.roles.cache.some(r => r.id === '860462150615302144')) member.roles.remove('860462150615302144')
			else member.roles.add('860462150615302144')
			break
		case '782350138550648833': // dungeons
			if (member.roles.cache.some(r => r.id === '860462126765703179')) member.roles.remove('860462126765703179')
			else member.roles.add('860462126765703179')
			break

		default:
			break
	}

	await reaction.users.remove(user.id)
}

exports.manageExtraRoles = manageExtraRoles