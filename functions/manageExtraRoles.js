const settings = require('../resources/settings.json')

/**
 * Manage roles using reactions in the Extra Compliance Server
 */
async function manageExtraRoles(client, reaction, user) {
	const reactID = reaction.emoji.id

	const server = await client.guilds.cache.get(settings.guilds.cextras.id) || undefined
	const member = server === undefined ? undefined : await server.members.cache.get(user.id)

	if (member === undefined) return

	switch (reactID) {
		case settings.emojis.caddons:
			if (member.roles.cache.some(r => r.id === settings.roles.addons.cextras.id)) member.roles.remove(settings.roles.addons.cextras.id)
			else member.roles.add(settings.roles.addons.cextras.id)
			break
		case settings.emojis.ctweaks:
			if (member.roles.cache.some(r => r.id === settings.roles.tweaks.cextras.id)) member.roles.remove(settings.roles.tweaks.cextras.id)
			else member.roles.add(settings.roles.tweaks.cextras.id)
			break
		case settings.emojis.cmods:
			if (member.roles.cache.some(r => r.id === settings.roles.mods.cextras.id)) member.roles.remove(settings.roles.mods.cextras.id)
			else member.roles.add(settings.roles.mods.cextras.id)
			break
		case settings.emojis.cdungeons:
			if (member.roles.cache.some(r => r.id === settings.roles.dungeons.cextras.id)) member.roles.remove(settings.roles.dungeons.cextras.id)
			else member.roles.add(settings.roles.dungeons.cextras.id)
			break

		default:
			break
	}

	await reaction.users.remove(user.id)
}

exports.manageExtraRoles = manageExtraRoles