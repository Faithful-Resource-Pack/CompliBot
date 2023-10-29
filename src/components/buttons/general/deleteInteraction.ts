import { Component } from "@interfaces/components";
import { info } from "@helpers/logger";
import { Client, ButtonInteraction } from "@client";

export default {
	id: "deleteInteraction",
	async execute(client: Client, interaction: ButtonInteraction) {
		if (client.verbose) console.log(`${info}Interaction Message deleted!`);

		const messageInteraction = interaction.message.interaction;
		const message = interaction.message;

		if (messageInteraction != undefined && interaction.user.id != messageInteraction.user.id)
			return interaction.reply({
				content: interaction
					.strings()
					.error.interaction.reserved.replace("%USER%", `<@!${messageInteraction.user.id}>`),
				ephemeral: true,
			});

		let fetchedRef = false;
		try {
			fetchedRef = (await message.fetchReference()).author.id != interaction.user.id;
		} catch {} // ref deleted or author not matching

		if (message.reference !== undefined && fetchedRef)
			return interaction.reply({
				content: interaction
					.strings()
					.error.interaction.reserved.replace(
						"%USER%",
						`<@!${(await message.fetchReference()).author.id}>`,
					),
				ephemeral: true,
			});

		try {
			return message.delete();
		} catch (err) {
			return interaction.reply({
				content: interaction.strings().error.message.deleted,
				ephemeral: true,
			});
		}
	},
} as Component;
