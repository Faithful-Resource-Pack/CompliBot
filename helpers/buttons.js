const { MessageButton, MessageActionRow } = require("discord.js");
const settings = require("../resources/settings.json");

/**
 * Helper file to store image-related buttons and their data
 * @author Evorp
 * @see interactionCreate
 */

const magnifyButton = new MessageButton()
	.setStyle("PRIMARY")
	.setEmoji(settings.emojis.magnify)
	.setCustomId("magnifyButton");

const tileButton = new MessageButton()
	.setStyle("PRIMARY")
	.setEmoji(settings.emojis.tile)
	.setCustomId("tileButton");

const paletteButton = new MessageButton()
	.setStyle("PRIMARY")
	.setEmoji(settings.emojis.palette)
	.setCustomId("paletteButton");

const viewRawButton = new MessageButton()
	.setStyle("PRIMARY")
	.setEmoji(settings.emojis.view_raw)
	.setCustomId("viewRawButton");

const imgButtons = new MessageActionRow().addComponents([
	magnifyButton,
	tileButton,
	paletteButton,
	viewRawButton,
]);

module.exports = {
	magnifyButton,
	tileButton,
	paletteButton,
	viewRawButton,
	imgButtons,
};
