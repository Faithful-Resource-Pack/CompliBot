const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require("discord.js");
const addDeleteButton = require("../../helpers/addDeleteButton");

const settings = require("../../resources/settings.json");
const strings = require("../../resources/strings.json");

/**
 * @typedef {Object} Choice
 * @property {String} label choice title
 * @property {String} description subtitle
 * @property {String} value value being sent to selectMenuUsed
 */

/**
 * Selection menu for dealing with multiple valid options
 * @author Evorp
 * @param {import("discord.js").Message} message message to reply to
 * @param {Choice[]} choices pre-mapped choices
 */
module.exports = async function choiceEmbed(message, choices) {
	const emojis = settings.emojis.default_select;
	const components = [];
	let rlen = choices.length;
	let max = 4;
	let _max = 0;

	do {
		const options = [];
		for (let i = 0; i < emojis.length; ++i) {
			if (choices[0] !== undefined) {
				let choice = choices.shift();
				choice.emoji = emojis[i % emojis.length];
				options.push(choice);
			}
		}
		const menu = new MessageSelectMenu()
			.setCustomId(`choiceEmbed_${_max}`)
			.setPlaceholder("Select a texture!")
			.addOptions(options);

		const row = new MessageActionRow().addComponents(menu);

		components.push(row);
	} while (choices.length !== 0 && _max++ < max);

	const embed = new MessageEmbed()
		.setTitle(`${rlen} results found`)
		.setDescription(`If you can't what you're looking for, please be more specific!`)
		.setColor(settings.colors.blue);

	const choiceMessage = await message.reply({ embeds: [embed], components: components });
	/**
	 * @see selectMenuUsed all extra code from here on out is there
	 */
	await addDeleteButton(choiceMessage);

	return setTimeout(() => {
		if (choiceMessage.deletable) choiceMessage.delete();
		if (message.deletable) message.delete();
	}, 30000);
};
