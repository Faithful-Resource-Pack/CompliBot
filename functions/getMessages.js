async function getMessages(client, id, limit = 100) {
	if (limit > 100) limit = 100

	let last_id        = undefined
	const sum_messages = []
	const channel      = await client.channels.cache.get(id)
	const options      = { limit: limit }

	while (true) {
		if (last_id) options.before = last_id

		const messages = await channel.messages.fetch(options)
		sum_messages.push(...messages.array())

		if (messages.size != limit || sum_messages >= limit) break
		else last_id = messages.last().id
	}

	return sum_messages
}

exports.getMessages = getMessages