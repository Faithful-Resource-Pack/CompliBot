const { magnifyAttachment } = require("../functions/textures/magnify");

module.exports = {
	name: "interactionCreate",
	// eslint-disable-next-line no-unused-vars
	async execute(interaction) {
		if (!interaction.isButton()) return;
		const submissionEmbed = interaction.message.embeds[0];

		switch (interaction.customId) {
			case "magnify":
				return await interaction.reply({
					files: [await magnifyAttachment(submissionEmbed.thumbnail.url)],
					ephemeral: true,
				});
			case "view_raw":
				return await interaction.reply({
					files: [submissionEmbed.thumbnail.url],
					ephemeral: true,
				})
		}
	},
};
