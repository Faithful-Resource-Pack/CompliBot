const { MessageActionRow } = require("discord.js");
const { deleteButton } = require("./buttons");

/**
 * Add delete button to bot message
 * @author Evorp
 * @param {import("discord.js").Message} message message sent by bot
 */
module.exports = async function addDeleteButton(message) {
	// Based off the TypeScript version
	if (
		message.components[0] != undefined &&
		message.components.at(-1).components.length < 5 && //check there aren't 5 buttons
		message.components.at(-1).components[0].type === "BUTTON" //checks there isn't a select menu
	) {
		message.components.at(-1).addComponents([deleteButton]);

		return message.edit({
			components: [...message.components],
		});
	}
	return message.edit({
		components: [...message.components, new MessageActionRow().addComponents(deleteButton)],
	});
};
