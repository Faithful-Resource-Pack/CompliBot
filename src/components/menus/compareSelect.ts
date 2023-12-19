import { Client, Message, StringSelectMenuInteraction, EmbedBuilder } from "@client";
import { Component } from "@interfaces/components";
import { info } from "@helpers/logger";
import { MessageEditOptions } from "discord.js";
import textureComparison from "@functions/textureComparison";
import { imageTooBig } from "@helpers/warnUser";
import { colors } from "@utility/colors";

export default {
	id: "compareSelect",
	async execute(client: Client, interaction: StringSelectMenuInteraction) {
		if (client.verbose) console.log(`${info}Texture selected!`);

		const messageInteraction = interaction.message.interaction;
		const message = interaction.message;

		if (interaction.user.id !== messageInteraction.user.id)
			return interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle(interaction.strings().error.permission.notice)
						.setDescription(
							interaction
								.strings()
								.error.permission.user_locked.replace(
									"%USER%",
									`<@!${messageInteraction.user.id}>`,
								),
						)
						.setColor(colors.red),
				],
				ephemeral: true,
			});

		interaction.deferUpdate();

		const [id, display] = interaction.values[0].split("__");
		const editOptions: MessageEditOptions = await textureComparison(
			interaction.client,
			id,
			display,
		);

		if (!editOptions) {
			// stupid workaround for already having deferred the message
			await interaction.deleteReply();
			return imageTooBig(interaction);
		}

		message.edit(editOptions).then((message: Message) => message.deleteButton());
	},
} as Component;
