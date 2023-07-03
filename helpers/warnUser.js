const settings = require("../resources/settings.json");
const strings = require("../resources/strings.json");
const prefix = process.env.PREFIX;

const { MessageEmbed } = require("discord.js");
const addDeleteReact = require("./addDeleteReact");

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
		.setDescription(text)
		.setFooter({
			text: strings.warn_user.footer.replace("%prefix%", prefix),
			iconURL: message.client.user.displayAvatarURL(),
		});

	let embedMessage;
	if (message.deletable) embedMessage = await message.reply({ embeds: [embed] });
	else embedMessage = await message.channel.send({ embeds: [embed] });

	addDeleteReact(embedMessage, message, true);
};
