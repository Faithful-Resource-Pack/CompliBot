const settings = require("../resources/settings.json");
const strings = require("../resources/strings.json");

const { MessageEmbed } = require("discord.js");
const { addDeleteReact } = require("./addDeleteReact");

/**
 * @typedef {Object} ChoiceParameter
 * @property {String?} title Embed title
 * @property {String?} [separator=' — '] Emoji proposition separator
 * @property {(Array<String>|Object.<string, string>)} propositions Array or Set of emojis and propositions
 * @property {String?} footer Embed footer
 * @property {String?} imageURL Embed footer image URL
 * @property {Number?} [max=1] Max number of emojis
 * @property {Number?} [timeout=60000] Timeout in ms,
 */

/**
 * @typedef {Object} ChoiceResponse
 * @property {Number} index Result choice index
 * @property {String} emoji Result choice Emoji
 * @property {String} proposition Result choice proposition
 */

/**
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
		footer: "chooseEmbed",
		color: settings.colors.blue,
		max: 1,
		separator: " — ",
		imageURL: message.client.user.displayAvatarURL(),
		timeout: 60000,
	};

	const DEFAULT_EMOJIS = settings.emojis.default_select;

	params = Object.assign({}, DEFAULT, params);

	if (!params.propositions) throw new Error("No proposition in object");

	let embed = new MessageEmbed().setTitle(params.title).setColor(params.color);

	embed = params.imageURL
		? embed.setFooter({ text: params.footer, iconURL: params.imageURL })
		: embed.setFooter({ text: params.footer });

	// popositions object
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
				text: "⚠️ WARNING",
				value: "There are too many textures for Discord to display!",
				inline: true,
			},
		]);
	}

	embed.setDescription(description);

	const args = { embeds: [embed] };
	const sendPromise = message !== undefined ? message.reply(args) : user.send(args);

	// reply to the sent message
	/** @type {Discord.Message} */
	let embedMessage = await sendPromise;
	for (let emoji of emojis) await embedMessage.react(emoji);
	// await addDeleteReact(embedMessage, message, true);
	const filter_num = (reaction, user) => user.id === message.author.id && emojis.includes(reaction.emoji.name);

	const collected = await awaitReactionTweaked(
		embedMessage,
		{
			filter_num,
			max: params.max,
			time: params.timeout,
			errors: ["time"],
		},
		embedMessage.author.id,
	); // the bot sent the embed message

	/** @type {Discord.MessageReaction} */
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
 * @param {Discord.Message} messageToReact Message to react to
 * @param {import("discord.js").AwaitReactionsOptions} options Await reactions options
 * @param {String} botId bot ID to filter reactions from
 * @returns {Promise<Discord.Collection<string, Discord.MessageReaction>>}
 */
async function awaitReactionTweaked(messageToReact, options, botId) {
	const collected = await messageToReact.awaitReactions(options)
	const filtered = collected.filter(
		(reac) => reac.users.cache.size != 1 || reac.users.cache.first().id !== botId);
	if (filtered.size != 0) return collected;
	else {
		awaitReactionTweaked(messageToReact, options, botId);
	}
}
