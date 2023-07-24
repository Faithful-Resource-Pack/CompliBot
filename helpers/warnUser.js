const settings = require("../resources/settings.json");
const strings = require("../resources/strings.json");

const { MessageEmbed, MessageActionRow } = require("discord.js");
const { deleteButton } = require("./buttons");

/**
 * Sends pre-formatted red embed with warning sign
 * @author Juknum
 * @param {Discord.Message} message
 * @param {String} text
 */
module.exports = async function warnUser(message, text) {
	const embed = new MessageEmbed()
		.setColor(settings.colors.red)
		.setThumbnail(settings.images.warning)
		.setTitle(strings.bot.error)
		.setDescription(text);

	const args = {
		embeds: [embed],
		components: [new MessageActionRow().addComponents(deleteButton)],
	};
	if (message.deletable) await message.reply(args);
	else await message.channel.send(args);
};
