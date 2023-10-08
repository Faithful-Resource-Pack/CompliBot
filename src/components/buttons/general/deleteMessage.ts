import { info } from "@helpers/logger";
import { Client, Message, ButtonInteraction } from "@client";
import { Component } from "@interfaces";

export default {
	id: "deleteMessage",
	async execute(client: Client, interaction: ButtonInteraction) {
		if (client.verbose) console.log(`${info}Message deleted!`);
		const message = interaction.message as Message;
		// if there's no interaction we store the author ID in the footer
		const authorId = interaction.message.embeds[0].footer?.text.split(" | ")[1];

		// additional checking for undefined embeds and footers and stuff
		if (!message.reference && !authorId)
			return interaction.reply({
				content: interaction.strings().error.not_found.replace("%THING%", `Author ID in footer`),
				ephemeral: true,
			});

		if (!message.reference && interaction.user.id != authorId)
			// stupid check because undefined
			return interaction.reply({
				content: interaction
					.strings()
					.error.interaction.reserved.replace("%USER%", `<@!${authorId}>`),
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
} as Component;
