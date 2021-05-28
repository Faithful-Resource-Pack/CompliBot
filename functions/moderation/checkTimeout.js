const { removeMutedRole } = require('../moderation/removeMutedRole.js')
const usersCollection = require('../../helpers/firestorm/users.js')

async function checkTimeout(client) {

	const users = await usersCollection.read_raw();

	for (const [_key, user] of Object.entries(users)) {
		// check if the user has 'muted: {}' && 'muted: { start: n }'
		if (user.muted && user.muted.start) {
			let timestamp = new Date()
			let endTimestamp = user.muted.end ? user.muted.end : 0
			timestamp = timestamp.getTime()

			// if the actual timestamp is greater than the end timestamp, remove the mute role
			if (timestamp > endTimestamp && endTimestamp != 0) {
				user.muted = {}
				usersCollection.set(user.id, user)
				removeMutedRole(client, user.id)
			}
		}
	}
}

exports.checkTimeout = checkTimeout