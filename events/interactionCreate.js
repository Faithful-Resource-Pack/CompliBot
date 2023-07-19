const { magnifyAttachment } = require("../functions/textures/magnify");
const tile = require("../functions/textures/tile");
const palette = require("../functions/textures/palette");
const { MessageEmbed } = require("discord.js");

const strings = require("../resources/strings.json");
const settings = require("../resources/settings.json");

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
				// tile + magnify
				const tileBuffer = await tile(interaction, image);
				if (!tileBuffer) return;
				return await interaction.reply({
					files: [await magnifyAttachment(tileBuffer)],
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
					embeds: [
						new MessageEmbed()
							.setTitle(strings.bot.error)
							.setThumbnail(settings.images.error)
							.setDescription("This button doesn't have an event set up yet!")
							.setColor(settings.colors.red),
					],
					ephemeral: true,
				});
		}
	},
};
