import { Message, StringSelectMenuInteraction, EmbedBuilder } from "@client";
import type { Component } from "@interfaces/components";
import { info } from "@helpers/logger";
import { getTexture } from "@functions/getTexture";
import axios from "axios";
import { colors } from "@utility/colors";
import { unencodeChoice } from "@helpers/choiceEmbed";
import { MessageFlags } from "discord.js";

export default {
	id: "textureSelect",
	async execute(client, interaction) {
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
								.error.permission.user_locked.replace("%USER%", `<@${messageInteraction.user.id}>`),
						)
						.setColor(colors.red),
				],
				flags: MessageFlags.Ephemeral,
			});

		interaction.deferUpdate();

		const [id, pack, version] = unencodeChoice(interaction);
		const editOptions = await getTexture(
			interaction,
			(await axios.get(`${interaction.client.tokens.apiUrl}textures/${id}/all`)).data,
			pack,
			version,
		);

		if (!editOptions.files) return interaction.ephemeralReply(editOptions);

		return message.edit(editOptions).then((message: Message) => message.deleteButton());
	},
} as Component<StringSelectMenuInteraction>;
