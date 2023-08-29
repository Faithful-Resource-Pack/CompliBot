/**
 * Change status of embed
 * @author Evorp
 * @param {import("discord.js").Message} message message to edit
 * @param {String} status status to change (e.g. instapass, invalid, etc)
 * @param {String?} color optionally change embed color to match with status
 * @param {import("discord.js").MessageActionRow[]} components optionally change components to match status
 */
module.exports = async function changeStatus(message, status, color, components) {
	let embed = message.embeds[0];
	// fields[1] is always the status field in submissions
	embed.fields[1].value = status;
	if (color) embed.setColor(color);
	if (!components) components = [...message.components];
	await message.edit({ embeds: [embed], components: components });
};
