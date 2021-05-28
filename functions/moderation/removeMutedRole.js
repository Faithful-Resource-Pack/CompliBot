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
		'814198513847631944', // what the hell is this server id ??
		'720677267424018526' // Bot dev discord
	]
	
	for (var i = 0; i < servers.length; i++) {
		let server = await client.guilds.cache.get(servers[i]) || undefined
		let member = server === undefined ? undefined : await server.members.cache.get(userID)
		let role   = member === undefined ? undefined : await server.roles.cache.find(r => r.name === 'Muted')
		if (role) await member.roles.remove(role)
	}
}

exports.removeMutedRole = removeMutedRole
