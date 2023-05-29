const usersCollection = require('../../helpers/firestorm/users')
const { removeMutedRole } = require('../moderation/removeMutedRole')

async function checkTimeout(client) {

	let users
	try {
		users = await usersCollection.read_raw()
	} catch (err) { return } // avoid Request faild with status code 525/502 etc..

	for (const [_key, user] of Object.entries(users)) {
		// check if the user has 'muted: {}' && 'muted: { start: n }'
		if (user.muted && user.muted.start) {
			let timestamp = new Date()
			let endTimestamp = user.muted.end ? user.muted.end : 0
			timestamp = timestamp.getTime()

			// if the actual timestamp is greater than the end timestamp, remove the mute role
			if (timestamp > endTimestamp && endTimestamp != 0) removeMutedRole(client, user.id)
		}
	}
}

exports.checkTimeout = checkTimeout