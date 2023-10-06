import { Component } from "@interfaces";
import { info } from "@helpers/logger";
import { Client, Message, ButtonInteraction, EmbedBuilder } from "@client";
import { tileToAttachment } from "@images/tile";
import { magnify, palette } from "@helpers/buttons";
import { ActionRowBuilder } from "discord.js";
import { ButtonBuilder } from "discord.js";
import getImage from "@helpers/getImage";

export default {
	id: "tile",
	async execute(client: Client, interaction: ButtonInteraction) {
		if (client.verbose) console.log(`${info}Image was tiled!`);

		const message: Message = interaction.message as Message;
		const url = await getImage(message);
		const attachment = await tileToAttachment(url, {}, url.split("/").at(-1));

		if (attachment == null)
			return interaction.reply({
				content: interaction.strings().command.images.too_big,
				ephemeral: true,
			});

		return interaction
			.reply({
				embeds: [
					new EmbedBuilder()
						.setImage(`attachment://${attachment.name}`)
						.setFooter({ text: `${interaction.user.username} | ${interaction.user.id}` })
						.setTimestamp(),
				],
				files: [attachment],
				components: [new ActionRowBuilder<ButtonBuilder>().addComponents(magnify, palette)],
				fetchReply: true,
			})
			.then((message: Message) => {
				message.deleteButton(true);
			});
	},
} as Component;
