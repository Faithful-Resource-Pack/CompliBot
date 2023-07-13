const { MessageActionRow } = require("discord.js");
const { magnifyButton } = require("../helpers/buttons");

const { magnifyAttachment } = require("../functions/textures/magnify");
const tile = require("../functions/textures/tile");
const palette = require("../functions/textures/palette");

module.exports = {
	name: "interactionCreate",
	// eslint-disable-next-line no-unused-vars
	async execute(interaction) {
		if (!interaction.isButton()) return;
		const image =
			interaction.message?.embeds[0]?.thumbnail?.url ?? interaction.message.attachments.first().url;

		switch (interaction.customId) {
			case "magnifyButton":
				return await interaction.reply({
					files: [await magnifyAttachment(image)],
					ephemeral: true,
				});
			case "tileButton":
				return await interaction.reply({
					files: [await tile(interaction, image)],
					components: [new MessageActionRow().addComponents(magnifyButton)],
					ephemeral: true,
				});
			case "paletteButton":
				// since there's multiple components in palette it's easier to reply there
				return palette(interaction, image);
			case "viewRawButton":
				return await interaction.reply({
					files: [image],
					ephemeral: true,
				});
			default:
				return await interaction.reply({
					content: "This button doesn't have an event set up yet!",
					ephemeral: true,
				});
		}
	},
};