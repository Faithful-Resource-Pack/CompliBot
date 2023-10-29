import { Client, Message, StringSelectMenuInteraction } from "@client";
import { Component } from "@interfaces/components";
import { info } from "@helpers/logger";
import { cycleComparison } from "@functions/cycleComparison";

export default {
	id: "cycleSelect",
	async execute(client: Client, interaction: StringSelectMenuInteraction) {
		if (client.verbose) console.log(`${info}Texture selected!`);

		const messageInteraction = interaction.message.interaction;
		const message = interaction.message;

		if (interaction.user.id !== messageInteraction.user.id)
			return interaction.reply({
				content: interaction
					.strings()
					.error.interaction.reserved.replace("%USER%", `<@!${messageInteraction.user.id}>`),
				ephemeral: true,
			});

		interaction.deferUpdate();

		const [id, display, framerate] = interaction.values[0].split("__");
		const editOptions = await cycleComparison(interaction.client, id, display, Number(framerate));

		message.edit(editOptions).then((message: Message) => message.deleteButton());
	},
} as Component;
