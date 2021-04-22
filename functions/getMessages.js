/**
 * Fetched messages from a Discord Channel
 * @author Juknum
 * @param {DiscordClient} client 
 * @param {String} id Channel from where messages are fetched
 * @param {*} limit Max amount of message fetch
 * @returns Returns an Array of all fetched messages
 */
async function getMessages(client, id, limit = 100) {
	const channel = await client.channels.cache.get(id)
	const sum_messages = []
	let last_id
	let done = false
	
	let fetchLimit = limit
	if (fetchLimit > 100) fetchLimit = 100

	while (!done) {
		const options = { limit: fetchLimit }
		if (last_id) options.before = last_id

		const messages = await channel.messages.fetch(options)
		sum_messages.push(...messages.array())
		last_id = messages.last().id

		if (messages.size != 100 || sum_messages.length >= limit) done = true
	}

	return sum_messages
}

exports.getMessages = getMessages