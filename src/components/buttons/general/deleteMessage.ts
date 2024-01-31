import { info } from "@helpers/logger";
import { ButtonInteraction, EmbedBuilder } from "@client";
import { Component } from "@interfaces/components";
import { colors } from "@utility/colors";

export default {
	id: "deleteMessage",
	async execute(client, interaction) {
		if (client.verbose) console.log(`${info}Message deleted!`);
		const message = interaction.message;
		// if there's no interaction we store the author ID in the footer
		const authorId = interaction.message.embeds[0].footer?.text.split(" | ")[1];

		// additional checking for undefined embeds and footers and stuff
		if (!message.reference && !authorId)
			return interaction.reply({
				content: interaction.strings().error.message.no_author,
				ephemeral: true,
			});

		if (!message.reference && interaction.user.id != authorId)
			// stupid check because undefined
			return interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle(interaction.strings().error.permission.notice)
						.setDescription(
							interaction
								.strings()
								.error.permission.user_locked.replace("%USER%", `<@!${authorId}>`),
						)
						.setColor(colors.red),
				],
				ephemeral: true,
			});

		try {
			message.delete();
		} catch (err) {
			return interaction.reply({
				content: interaction.strings().error.message.deleted,
				ephemeral: true,
			});
		}
	},
} as Component<ButtonInteraction>;
