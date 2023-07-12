const settings = require("../resources/settings.json");
const strings = require("../resources/strings.json");

const { MessageEmbed } = require("discord.js");
const addDeleteReact = require("./addDeleteReact");

/**
 * @typedef {Object} ChoiceParameter
 * @property {String?} title Embed title
 * @property {String?} [separator=' — '] Emoji proposition separator
 * @property {(Array<String>|Object.<string, string>)} propositions Array or Set of emojis and propositions
 * @property {String?} footer Embed footer
 * @property {String?} imageURL Embed footer image URL
 * @property {Number?} [max=1] Max number of emojis
 * @property {Number?} [timeout=60000] Timeout in ms
 */

/**
 * @typedef {Object} ChoiceResponse
 * @property {Number} index Result choice index
 * @property {String} emoji Result choice Emoji
 * @property {String} proposition Result choice proposition
 */

/**
 * Create embed with reactions for when the user has to pick between multiple valid options
 * @author TheRolf
 * @param {Discord.Message} message Received message
 * @param {ChoiceParameter} params Settings
 * @param {Discord.User} user User to send message to
 * @return {Promise<ChoiceResponse>}
 */
module.exports = async function (message, params, user) {
	/** @type {ChoiceParameter} */
	const DEFAULT = {
		title: strings.choice_embed.title,
		description: strings.choice_embed.description,
		footer: "Choice Embed",
		color: settings.colors.blue,
		max: 1,
		separator: " — ",
		imageURL: message.client.user.displayAvatarURL(),
		timeout: 30000,
	};

	// generate choice embed
	const DEFAULT_EMOJIS = settings.emojis.default_select;

	params = Object.assign({}, DEFAULT, params);

	if (!params.propositions) throw new Error("No proposition in object");

	let embed = new MessageEmbed().setTitle(params.title).setColor(params.color);

	if (params.imageURL) embed = embed.setFooter({ text: params.footer, iconURL: params.imageURL });
	else embed = embed.setFooter({ text: params.footer });

	// propositions object
	let propObj;
	if (Array.isArray(params.propositions)) {
		propObj = {};
		for (let i = 0; i < Math.min(params.propositions.length, DEFAULT_EMOJIS.length); ++i) {
			propObj[DEFAULT_EMOJIS[i]] = params.propositions[i];
		}
	} else {
		propObj = params.propositions;
	}

	// create description
	let description = [params.description];
	const emojis = Object.keys(propObj);
	emojis.forEach((emoji) => {
		description.push(`${emoji}${params.separator}${propObj[emoji]}`);
	});
	description = description.join("\n");

	if (description.length >= 2048) {
		description = description.slice(0, 2048);
		embed.addFields([
			{
				name: "⚠️ WARNING",
				value: "There are too many textures for Discord to display!",
				inline: true,
			},
		]);
	}

	embed.setDescription(description);

	const args = { embeds: [embed] };

	// create promise to send message
	const sendPromise = message !== undefined ? message.reply(args) : user.send(args);

	// send message and add reactions
	const embed_message = await sendPromise;
	let embedMessage = embed_message;
	for (let emoji of emojis) await embedMessage.react(emoji);

	if (embedMessage.deletable) setTimeout(() => embedMessage.delete(), params.timeout);

	// filter passed into the reaction waiting function
	const filter_num = (reaction, user) =>
		user.id === message.author.id && emojis.includes(reaction.emoji.name);

	// wait for a user to react and store their choice
	const collected = await getChoice(
		embedMessage,
		{ filter_num, max: params.max, time: params.timeout, errors: ["time"] },
		embedMessage.author.id,
	);

	// if reaction is valid delete the embed message and return the choice
	const reaction = collected.first();
	if (emojis.includes(reaction.emoji.name)) {
		embedMessage.delete();

		/** @type {ChoiceResponse} */
		return {
			index: emojis.indexOf(reaction.emoji.name),
			emoji: reaction.emoji.name,
			proposition: propObj[reaction.emoji.name],
		};
	}
};

/**
 * @param {DiscordMessage} messageToReact Message to react to
 * @param {import("discord.js").AwaitReactionsOptions} options Await reactions options
 * @param {String} botID bot ID to filter reactions from
 * @returns {Promise<Discord.Collection<string, Discord.MessageReaction>>}
 */
async function getChoice(messageToReact, options, botID) {
	const collected = await messageToReact.awaitReactions(options);
	const filtered = collected.filter(
		(reac) => reac.users.cache.size != 1 || reac.users.cache.first().id !== botID,
	);
	// break condition
	if (filtered.size) return collected;
	// recursively run function until a user has reacted
	return await getChoice(messageToReact, options, botID);
}
