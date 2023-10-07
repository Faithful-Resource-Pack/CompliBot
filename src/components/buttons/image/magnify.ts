import { Component } from "@interfaces";
import { info } from "@helpers/logger";
import { Client, Message, ButtonInteraction, EmbedBuilder } from "@client";
import { magnifyToAttachment } from "@images/magnify";
import { palette } from "@helpers/buttons";
import getImage from "@helpers/getImage";
import { ActionRowBuilder } from "discord.js";
import { ButtonBuilder } from "discord.js";

export default {
	id: "magnify",
	async execute(client: Client, interaction: ButtonInteraction) {
		if (client.verbose) console.log(`${info}Image was magnified!`);

		const message = interaction.message as Message;
		const url = await getImage(message);
		const attachment = await magnifyToAttachment(url);

		return interaction
			.reply({
				embeds: [
					new EmbedBuilder()
						.setImage(`attachment://${attachment.name}`)
						.setFooter({ text: `${interaction.user.username} | ${interaction.user.id}` })
						.setTimestamp(),
				],
				files: [attachment],
				components: [new ActionRowBuilder<ButtonBuilder>().addComponents(palette)],
				fetchReply: true,
			})
			.then((message: Message) => {
				message.deleteButton(true);
			});
	},
} as Component;
