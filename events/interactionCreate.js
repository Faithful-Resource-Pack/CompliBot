const client = require("../index").Client;

module.exports = {
	name: "interactionCreate",
	// eslint-disable-next-line no-unused-vars
	async execute(interaction) {
		if (interaction.isButton()) client.emit("buttonUsed", interaction);
	},
};
