
const usersCollection = require('../../helpers/firestorm/users')
const VALID_ROLES = [
	"Administrator",
	"Moderator",
	"Muted",
	"Texture Supervision Council",
	"Developer",
	"VIP",
	"Donator",
	"Contributor",
	"Prog. Art Contributor",
	"Mods Contributor",
	"Dungeons Contributor",
	"Add-on Maker",
	"Translator"
]

/**
 * Update member count of a server
 * @param {DiscordClient} client 
 * @param {String} serverId server from where the count is established
 * @param {String} channelId use to set the count
 */
async function syncMembers(client, serversID) {

	let users = await usersCollection.read_raw()

	// for each given guilds
	const serversPromises = serversID.map(id => client.guilds.fetch(id))
	const serversResults = await Promise.all(serversPromises)

	// fetch members of each guilds
	const membersPromises = serversResults.map(guild => guild.members.fetch())
	const membersResults = await Promise.all(membersPromises)

	membersResults.forEach(members => {
		members.forEach(member => {
			const user = member.user
			let roles = []

			// do not process bot
			if (user.bot === false) {
				member.roles.cache.forEach(role => {
					// all roles
					if (VALID_ROLES.includes(role.name)) roles.push(role.name)

					// god == dev role
					if (role.name == "God") roles.push("Developer")
				})

				// if already in db
				if (users[user.id]) {
					if (!users[user.id].type) users[user.id].type = new Array()

					// add roles to the type value of the user
					roles.forEach(role => {
						if (!users[user.id].type.includes(role)) users[user.id].type.push(role)
					})

					// remove duplicates
					users[user.id].type = [...new Set(users[user.id].type) ]

				}

				// elsewhere
				else if (roles.length != 0) {
					users[user.id] = {
						username: user.username,
						type: roles,
						uuid: null
					}
				}
			}
		})
	})

	await usersCollection.write_raw(users)
}

exports.syncMembers = syncMembers;