const client = require("../index").Client;

/**
 * this is the actual event being called for button/menu interactions
 * but it lumps all interactions together
 * so we split them into separate event files here
 * @author Evorp
 * @see buttonUsed
 * @see selectMenuUsed
 */
module.exports = {
	name: "interactionCreate",
	async execute(interaction) {
		if (interaction.isButton()) return client.emit("buttonUsed", interaction);
		else if (interaction.isSelectMenu()) return client.emit("selectMenuUsed", interaction);
	},
};
