import { info } from "@helpers/logger";
import { Client, Message, ButtonInteraction } from "@client";
import { Component } from "@interfaces";

export default {
	id: "deleteMessage",
	async execute(client: Client, interaction: ButtonInteraction) {
		if (client.verbose) console.log(`${info}Message deleted!`);
		const message: Message = interaction.message as Message;
		// as we can't fetch the interaction to detect who is the owner of the message/interaction, we uses the stored id inside the footer
		const authorId = interaction.message.embeds[0].footer.text.split(" | ")[1]; //splits by | to remove stuff before author id

		//additional checking for undefined embeds and footers and stuff
		if (!message.reference && !authorId)
			return interaction.reply({
				content: interaction.strings().error.not_found.replace("%THING%", `Author ID in footer`),
				ephemeral: true,
			});

		if (!message.reference && interaction.user.id != authorId)
			//stupid check because undefined
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
