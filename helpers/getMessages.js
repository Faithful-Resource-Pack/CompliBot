/**
 * Fetched messages from a Discord Channel
 * @author Juknum
 * @param {import('discord.js').Client} client 
 * @param {String} id Channel from where messages are fetched
 * @param {Integer} limit Max amount of message fetch
 * @returns Returns an Array of all fetched messages
 */
async function getMessages(client, id, limit = 100) {
	if(typeof(limit) !== 'number')
		return new Array()
	
	let channel
	try {
		channel = await client.channels.cache.get(id)
	} catch (_err) { return new Array() }
	
	let fetchLimit = Math.min(100, Math.max(0, limit)) // clamps values in [0, 100]

	const sum_messages = new Array()

	let last_id // = undefined
	let options
	let messages
	
	let done = false
	while (!done) {
		options = { limit: fetchLimit }
		if (last_id !== undefined) options.before = last_id

		try {
			messages = await channel.messages.fetch(options)
		} catch (err) { console.log(err) }
		sum_messages.push(...messages.array())
		last_id = messages.last().id

		if (messages.size != 100 || sum_messages.length >= limit) done = true
	}

	return sum_messages
}

exports.getMessages = getMessages