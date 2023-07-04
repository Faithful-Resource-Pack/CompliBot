const settings = require("../../resources/settings.json");

const downloadResults = require("./downloadResults");
const warnUser = require("../../helpers/warnUser");

/**
 * Instapass a given texture embed
 * @author Evorp
 * @param {DiscordClient} client discord client
 * @param {DiscordMessage} message embed to instapass
 * @returns
 */
module.exports = async function instapass(client, message) {
	let channelOutID;
	let channelArray;

	for (let pack of Object.values(settings.submission.packs)) {
		// picks up instapassing in both community and council phases
		channelArray = Object.values(pack.channels);
		if (channelArray.includes(message.channel.id)) {
			channelOutID = pack.channels.results;
			break;
		}
	}

	const channelOut = await client.channels.fetch(channelOutID);

	if (!channelOut) return warnUser(message, "Result channel was not able to be fetched.");

	const sentMessage = await channelOut.send({
		embeds: [
			message.embeds[0]
				.setColor(settings.colors.yellow)
				.setDescription(`[Original Post](${message.url})\n${message.embeds[0].description ?? ""}`),
		],
	});

	await sentMessage.react(settings.emojis.see_more);
	await downloadResults(client, channelOutID, true);
};
