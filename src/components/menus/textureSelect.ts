import { Client, Message, StringSelectMenuInteraction, EmbedBuilder } from "@client";
import { Component } from "@interfaces/components";
import { info } from "@helpers/logger";
import { getTexture } from "@functions/getTexture";
import axios from "axios";
import { colors } from "@utility/colors";

export default {
	id: "textureSelect",
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

		const [id, pack] = interaction.values[0].split("__");
		const editOptions = await getTexture(
			interaction,
			(await axios.get(`${interaction.client.tokens.apiUrl}textures/${id}/all`)).data,
			pack,
		);

		if (!editOptions.files) return interaction.ephemeralReply(editOptions);

		return message.edit(editOptions).then((message: Message) => message.deleteButton());
	},
} as Component;
