import { Client, Message, StringSelectMenuInteraction } from "@client";
import { Component } from "@interfaces";
import { info } from "@helpers/logger";
import { MessageEditOptions, MessageInteraction } from "discord.js";
import { getTexture } from "@functions/getTexture";
import axios from "axios";

export default {
	id: "textureSelect",
	async execute(client: Client, interaction: StringSelectMenuInteraction) {
		if (client.verbose) console.log(`${info}Texture selected!`);

		const messageInteraction: MessageInteraction = interaction.message
			.interaction as MessageInteraction;
		const message: Message = interaction.message as Message;

		if (interaction.user.id !== messageInteraction.user.id)
			return interaction.reply({
				content: interaction
					.strings()
					.Error.Interaction.Reserved.replace("%USER%", `<@!${messageInteraction.user.id}>`),
				ephemeral: true,
			});

		interaction.deferUpdate();

		const [id, pack] = interaction.values[0].split("__");
		const editOptions: MessageEditOptions = await getTexture({
			texture: (
				await axios.get(`${(interaction.client as Client).tokens.apiUrl}textures/${id}/all`)
			).data,
			pack: pack,
			guild: interaction.guild,
		});

		return message.edit(editOptions).then((message: Message) => message.deleteButton());
	},
} as Component;
