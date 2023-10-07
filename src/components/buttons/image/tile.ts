import { Component } from "@interfaces";
import { info } from "@helpers/logger";
import { Client, Message, ButtonInteraction, EmbedBuilder } from "@client";
import { tileToAttachment } from "@images/tile";
import { magnify, palette } from "@helpers/buttons";
import { ActionRowBuilder } from "discord.js";
import { ButtonBuilder } from "discord.js";
import getImage from "@helpers/getImage";
import { colors } from "@helpers/colors";

export default {
	id: "tile",
	async execute(client: Client, interaction: ButtonInteraction) {
		if (client.verbose) console.log(`${info}Image was tiled!`);

		const message = interaction.message as Message;
		const url = await getImage(message);
		const attachment = await tileToAttachment(url);

		if (!attachment)
			return await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle(interaction.strings().command.images.too_big.replace("%ACTION%", "be tiled"))
						.setDescription(interaction.strings().command.images.suggestion)
						.setColor(colors.red),
				],
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
