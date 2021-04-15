/**
 * Fetched messages from a Discord Channel
 * @author Juknum
 * @param {DiscordClient} client 
 * @param {String} id Channel from where messages are fetched
 * @param {*} limit Max amount of message fetch
 * @returns Returns an Array of all fetched messages
 */
async function getMessages(client, id, limit = 100) {
	let undone         = true
	let last_id        = undefined
	const sum_messages = []
	const channel      = await client.channels.cache.get(id)
	const options      = { limit: limit }

	while (undone) {
		if (last_id) options.before = last_id

		const messages = await channel.messages.fetch(options)
		sum_messages.push(...messages.array())

		if (messages.size != limit || sum_messages >= limit) undone = false
		else last_id = messages.last().id
	}

	return sum_messages
}

exports.getMessages = getMessages