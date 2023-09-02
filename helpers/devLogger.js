const settings = require("@resources/settings.json");
const { MessageEmbed } = require("discord.js");

/**
 * Log dev errors and information to a dedicated channel
 * @author Evorp
 * @param {import("discord.js").Client} client
 * @param {String} description what to log
 * @param {{ color: String, title: String, isJson: String }} params
 */
module.exports = async function devLogger(client, description, params = {}) {
	const channel = client.channels.cache.get(process.env.LOG_CHANNEL);
	if (!channel) return;

	if (params.isJson) description = `\`\`\`json\n${description}\`\`\``;

	const embed = new MessageEmbed()
		.setTitle(params.title ?? "Unhandled Rejection")
		.setDescription(description)
		.setColor(params.color ?? settings.colors.red)
		.setTimestamp();

	channel.send({ embeds: [embed] }).catch(console.error);
};
