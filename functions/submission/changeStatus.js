/**
 * Change status of embed
 * @author Evorp
 * @param {DiscordMessage} message message to edit
 * @param {String} string status to change (e.g. instapass, invalid, etc)
 * @param {String} color optionally change embed color to match with status
 */
module.exports = async function changeStatus(message, string, color = null) {
	let embed = message.embeds[0];
	// fields[1] is always the status field in submissions
	embed.fields[1].value = string;
	embed.color = color ?? embed.color;
	await message.edit({ embeds: [embed] });
};