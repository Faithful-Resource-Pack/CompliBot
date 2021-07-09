const settings = require('../../resources/settings')
const users    = require('../../helpers/firestorm/users')

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
		settings.CEXTRAS_ID, 
		settings.C64_ID, 
		settings.C32_ID, 
		// '720677267424018526' // Bot dev discord
	]
	
	for (var i = 0; i < servers.length; i++) {
		let server = await client.guilds.cache.get(servers[i]) || undefined
		let member = server === undefined ? undefined : await server.members.cache.get(userID)
		let role   = member === undefined ? undefined : await server.roles.cache.find(r => r.name === 'Muted')
		if (role) await member.roles.remove(role)
	}

	// get the user from the db
	let user = await users.searchKeys([userID])

	// you guys are supposing you found the user, maybe he doesn't exist
	if(user === undefined) user = [{}] // FIX for proprerty muted of undefined

	// replace it's muted obj with an empty one
	user[0].muted = new Object()
	users.set(userID, user[0])
}

exports.removeMutedRole = removeMutedRole
