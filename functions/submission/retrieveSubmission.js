const settings = require("../../resources/settings.json");

const getMessages = require("../../helpers/getMessages");
const changeStatus = require("./changeStatus");
const { imageButtons } = require("../../helpers/buttons");
const { MessageEmbed } = require("discord.js");

const DEBUG = process.env.DEBUG.toLowerCase() == "true";

/**
 * @typedef {Object} MappedMessage
 * @property {import("discord.js").MessageReaction} upvote
 * @property {import("discord.js").MessageReaction} downvote
 * @property {import("discord.js").MessageEmbed} embed
 * @property {import("discord.js").MessageComponent[]} components
 * @property {import("discord.js").Message} message
 */

/**
 * Send submissions older than a given delay to a new channel
 * @author Juknum
 * @param {import("discord.js").Client} client
 * @param {String} channelFromID channel from where submissions are retrieved
 * @param {String} channelOutID channel where submissions are sent
 * @param {Boolean} toCouncil true if from submissions to council, false if from council to results
 * @param {Integer} delay delay in days from today
 * @param {Boolean?} councilDisabled disable the use of council-related strings in embeds
 */
module.exports = async function retrieveSubmission(
	client,
	channelFromID,
	channelOutID,
	toCouncil,
	delay,
	councilDisabled = false,
) {
	let messages = await getMessages(client, channelFromID);

	let delayedDate = new Date();
	delayedDate.setDate(delayedDate.getDate() - delay);

	// filter message in the right timezone
	messages = messages
		.filter((message) => {
			let messageDate = new Date(message.createdTimestamp);
			return (
				messageDate.getDate() == delayedDate.getDate() &&
				messageDate.getMonth() == delayedDate.getMonth()
			);
		}) // only get pending submissions
		.filter((message) => message.embeds.length > 0)
		.filter((message) => message.embeds[0].fields[1]?.value?.includes(settings.emojis.pending))
		.reverse(); // upload from oldest to newest

	// map messages adding reacts count, embed and message (easier management like that)
	messages = messages.map((message) => {
		return {
			upvote: message.reactions.cache.get(settings.emojis.upvote),
			downvote: message.reactions.cache.get(settings.emojis.downvote),
			embed: message.embeds[0],
			components: [...message.components],
			message: message,
		};
	});

	// split messages by their votes (upvote >= downvote)
	/** @type {MappedMessage[]} */
	const messagesUpvoted = messages.filter(
		(message) => (message.upvote?.count ?? 1) >= (message.downvote?.count ?? 1),
	);

	/** @type {MappedMessage[]} */
	const messagesDownvoted = messages.filter(
		(message) => (message.upvote?.count ?? 1) < (message.downvote?.count ?? 1),
	);

	/** @type {import("discord.js").TextChannel} */
	const channelOut = client.channels.cache.get(channelOutID);
	if (DEBUG) console.log(`Sending textures to: ${channelOut.name}`);

	if (toCouncil) return await sendToCouncil(client, messagesUpvoted, messagesDownvoted, channelOut);
	return await sendToResults(
		client,
		messagesUpvoted,
		messagesDownvoted,
		channelOut,
		councilDisabled,
	);
};

/**
 * Send textures to a given council channel
 * @author Evorp
 * @param {import("discord.js").Client} client
 * @param {MappedMessage[]} messagesUpvoted
 * @param {MappedMessage[]} messagesDownvoted
 * @param {import("discord.js").TextChannel} channelOut
 */
async function sendToCouncil(client, messagesUpvoted, messagesDownvoted, channelOut) {
	const EMOJIS = [settings.emojis.upvote, settings.emojis.downvote, settings.emojis.see_more];

	for (let message of messagesUpvoted) {
		const councilEmbed = new MessageEmbed(message.embed)
			.setColor(settings.colors.council)
			.setDescription(
				`[Original Post](${message.message.url})\n${message.embed.description ?? ""}`,
			);

		const sentMessage = await channelOut.send({
			embeds: [councilEmbed],
			components: message.components,
		});

		for (const emojiID of EMOJIS) await sentMessage.react(client.emojis.cache.get(emojiID));

		changeStatus(
			message.message,
			`<:upvote:${settings.emojis.upvote}> Sent to council!`,
			settings.colors.green,
		);
	}

	for (let message of messagesDownvoted) {
		// not sent anywhere, returned early instead
		changeStatus(
			message.message,
			`<:downvote:${settings.emojis.downvote}> Not enough upvotes!`,
			settings.colors.red,
		);
	}
}

/**
 * Send textures to a given result channel
 * @author Evorp
 * @param {import("discord.js").Client} client
 * @param {MappedMessage[]} messagesUpvoted
 * @param {MappedMessage[]} messagesDownvoted
 * @param {import("discord.js").TextChannel} channelOut
 * @param {Boolean} councilDisabled whether to disable council or not (off by default)
 */
async function sendToResults(
	client,
	messagesUpvoted,
	messagesDownvoted,
	channelOut,
	councilDisabled = false,
) {
	for (let message of messagesUpvoted) {
		const resultEmbed = new MessageEmbed(message.embed).setColor(settings.colors.green);
		resultEmbed.fields[1].value = `<:upvote:${
			settings.emojis.upvote
		}> Will be added in a future version! ${getPercentage(message.upvote, message.downvote)}`;

		// if we're coming straight from submissions
		if (!resultEmbed.description?.startsWith("[Original Post]("))
			resultEmbed.setDescription(
				`[Original Post](${message.message.url})\n${message.embed.description ?? ""}`,
			);

		await channelOut.send({ embeds: [resultEmbed], components: [imageButtons] });

		changeStatus(
			message.message,
			`<:upvote:${settings.emojis.upvote}> Sent to results!`,
			settings.colors.green,
		);
	}

	for (let message of messagesDownvoted) {
		// don't you love having to pass a value in down like three functions just to format some strings
		if (!councilDisabled) {
			message.embed.setColor(settings.colors.red);
			const resultEmbed = new MessageEmbed(message.embed);
			resultEmbed.fields[1].value = `<:downvote:${
				settings.emojis.downvote
			}> This texture did not pass council voting and therefore will not be added. ${getPercentage(
				message.upvote,
				message.downvote,
			)}`;

			const users = await message.downvote.users.fetch();

			// add council downvotes field between the status and path fields
			resultEmbed.fields.splice(2, 0, {
				name: "Council Downvotes",
				value: `<@!${users
					.map((user) => user.id)
					.filter((user) => user !== client.user.id)
					.join(">\n<@!")
					.toString()}>`,
				inline: true,
			});

			await channelOut.send({ embeds: [resultEmbed], components: message.components });

			changeStatus(
				message.message,
				`<:downvote:${settings.emojis.downvote}> Sent to results!`,
				settings.colors.red,
			);
		} else
			changeStatus(
				message.message,
				`<:downvote:${settings.emojis.downvote}> Not enough upvotes!`,
				settings.colors.red,
			);
	}
}

/**
 * Calculates percentage of upvotes and returns a formatted string
 * @author Evorp, Juknum
 * @param {import("discord.js").MessageReaction} upvotes upvote objects
 * @param {import("discord.js").MessageReaction} downvotes downvote objects
 * @returns {String} formatted string (or an empty string if not possible)
 */
function getPercentage(upvotes, downvotes) {
	const upvotePercentage =
		((upvotes?.count - 1) * 100) / (upvotes?.count - 1 + (downvotes.count - 1));
	if (isNaN(upvotePercentage)) return "";
	return `(${upvotePercentage}% upvoted)`;
}
