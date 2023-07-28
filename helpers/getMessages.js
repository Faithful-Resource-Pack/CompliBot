/**
 * Fetch messages from a Discord channel
 * @author Juknum
 * @param {import("discord.js").Client} client
 * @param {String} id channel where messages are fetched from
 * @param {Number} limit max amount of message fetched (default is 130)
 * @returns {Promise<import("discord.js").Message[]>} Returns an Array of all fetched messages
 */
module.exports = async function getMessages(client, id, limit = 130) {
	if (typeof limit !== "number") return new Array();

	let channel;
	try {
		channel = await client.channels.cache.get(id);
	} catch {
		return new Array();
	}

	let fetchLimit = Math.min(100, Math.max(0, limit)); // clamps values in [0, 100]

	const sum_messages = new Array();

	let last_id; // = undefined
	let options;
	let messages;

	let done = false;
	while (!done) {
		options = { limit: fetchLimit };
		if (last_id !== undefined) options.before = last_id;

		try {
			messages = await channel.messages.fetch(options);
		} catch (err) {
			console.log(err);
		}
		sum_messages.push(...messages.values());
		last_id = messages.last().id;

		if (messages.size != 100 || sum_messages.length >= limit) done = true;
	}

	return sum_messages;
};
