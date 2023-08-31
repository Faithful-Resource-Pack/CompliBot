const settings = require("@resources/settings.json");

const downloadResults = require("@submission/downloadResults");
const warnUser = require("@helpers/warnUser");
const DEBUG = process.env.DEBUG.toLowerCase() == "true";
const { imageButtons } = require("@helpers/buttons");

/**
 * Instapass a given texture embed
 * @author Evorp
 * @param {import("discord.js").Client} client discord client
 * @param {import("discord.js").Message} message embed to instapass
 */
module.exports = async function instapass(client, message) {
	let channelOutID;

	for (let pack of Object.values(settings.submission.packs)) {
		// picks up instapassing in both community and council phases
		const channelArray = Object.values(pack.channels);
		if (channelArray.includes(message.channel.id)) {
			channelOutID = pack.channels.results;
			break;
		}
	}
	// this is why we send the channel rather than the pack into downloadResults()
	/** @type {import("discord.js").TextChannel} */
	const channelOut = await client.channels.fetch(channelOutID);
	if (!channelOut) return warnUser(message, "Result channel was not able to be fetched!");
	await channelOut.send({
		embeds: [
			// the status in submissions is changed in reactionMenu()
			message.embeds[0].setDescription(
				`[Original Post](${message.url})\n${message.embeds[0].description ?? ""}`,
			),
		],
		components: [imageButtons],
	});

	await downloadResults(client, channelOutID, true);
	if (DEBUG) console.log(`Texture instapassed: ${message.embeds[0].title}`);
};
