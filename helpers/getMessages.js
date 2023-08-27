/**
 * Fetch messages from a Discord channel
 * @author Juknum
 * @param {import("discord.js").Client} client
 * @param {String} channelID channel where messages are fetched from
 * @param {Number} limit max amount of message fetched (clamped to [0, 100])
 * @returns {Promise<import("discord.js").Message[]>} Returns an Array of all fetched messages
 */
module.exports = async function getMessages(client, channelID, limit = 100) {
	if (typeof limit !== "number") return [];

	/** @type {import("discord.js").TextChannel} */
	let channel;
	try {
		channel = client.channels.cache.get(channelID);
	} catch {
		return [];
	}

	// clamps limit
	const fetchLimit = Math.min(100, Math.max(0, limit));

	const sum_messages = [];

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
