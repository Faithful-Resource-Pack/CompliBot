const settings = require('../../settings.js')

/**
 * Take a user, remove it's muted role
 * @param {Discord} client Discord Client
 * @param {Discord} userID Discord User ID
 */
async function removeMutedRole(client, userID) {
	const servers = [
		settings.CDUNGEONS_ID, 
		settings.CMODS_ID, 
		settings.CTWEAKS_ID,
		settings.CADDONS_ID, 
		settings.C64_ID, 
		settings.C32_ID, 
		'814198513847631944'
	]
	
	for (var i = 0; i < servers.length; i++) {
		var server = await client.guilds.cache.get(servers[i]) || undefined
		var member = await server.members.cache.get(userID) || undefined
		var role   = await server.roles.cache.find(r => r.name === 'Muted')
		if (server != undefined && member != undefined) {
			await member.roles.remove(role)
		}
	}
}

exports.removeMutedRole = removeMutedRole
