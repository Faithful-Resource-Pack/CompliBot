import { Client, Message, StringSelectMenuInteraction } from "@client";
import { Component } from "@interfaces";
import { info } from "@helpers/logger";
import { MessageEditOptions, MessageInteraction } from "discord.js";
import textureComparison from "@functions/textureComparison";

export default {
	id: "compareSelect",
	async execute(client: Client, interaction: StringSelectMenuInteraction) {
		if (client.verbose) console.log(`${info}Texture selected!`);

		const messageInteraction: MessageInteraction = interaction.message
			.interaction as MessageInteraction;
		const message: Message = interaction.message as Message;

		if (interaction.user.id !== messageInteraction.user.id)
			return interaction.reply({
				content: interaction
					.strings()
					.error.interaction.reserved.replace("%USER%", `<@!${messageInteraction.user.id}>`),
				ephemeral: true,
			});

		interaction.deferUpdate();

		const [id, display] = interaction.values[0].split("__");
		const editOptions: MessageEditOptions = await textureComparison(
			interaction.client,
			id,
			display,
		);

		message.edit(editOptions).then((message: Message) => message.deleteButton());
	},
} as Component;
