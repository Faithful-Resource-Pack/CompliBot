const settings = require('../../resources/settings')
const users    = require('../../helpers/firestorm/users')

async function addMutedRole(client, userID, seconds) {
	const servers = [
		settings.CDUNGEONS_ID, 
		settings.CMODS_ID, 
		settings.CTWEAKS_ID, 
		settings.CEXTRAS_ID, 
		settings.C64_ID, 
		settings.C32_ID, 
		// '720677267424018526' // Bot dev discord
	]
	
	// add roles to the discord user
	for (let i = 0; i < servers[i]; i++) {
		let server = await client.guilds.cache.get(servers[i]) || undefined
		let member = server === undefined ? undefined : await server.members.cache.get(userID)
		let role   = member === undefined ? undefined : await server.roles.cache.find(r => r.name === 'Muted')
	
		if (role) await member.roles.add(role)
	}

	// make dates
	var startAt = new Date();
	var endAt = new Date();

	// add mute time value
	endAt.setSeconds(endAt.getSeconds() + seconds)

	// if infinite mute:
	if (seconds < 0) endAt = 0 // beware this is not a date

	// get the user from the db
	let user = await users.searchKeys([ userID ])

	// if the user doesn't exist, create a new one (add username for a better readability when looking at the db)
	if (!user[0]) {
		const discord_user = await client.users.cache.find(user => user.id === userID)

		user[0] = {
			username: discord_user.username,
			type: [ 'member' ]
		}
	}

	// set start & end timestamp
	user[0].muted = {
		start: startAt.getTime(),
		end: typeof(endAt) === 'object' && 'getTime' in endAt ? endAt.getTime() : endAt.toString() // fix for getTime is not a function
	}
	users.set(userID, user[0])
}

exports.addMutedRole = addMutedRole