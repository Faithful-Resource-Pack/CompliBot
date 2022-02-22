import { Button } from "@src/Interfaces";
import { info } from "@src/Helpers/logger";
import { Client, Message, ButtonInteraction, MessageEmbed } from "@src/Extended Discord";
import { MessageInteraction } from "discord.js";
import { magnifyAttachment } from "@functions/canvas/magnify";
import { imageButtons } from "@helpers/buttons";

export const button: Button = {
	buttonId: "magnify",
	execute: async (client: Client, interaction: ButtonInteraction) => {
		if (client.verbose) console.log(`${info}Image was magnified!`);

		const message: Message = interaction.message as Message;
		const url = message.embeds[0].image.url;
		const attachment = await magnifyAttachment({
			url: url,
			name: url.split("/").at(-1),
		});

		if (attachment == null)
			return interaction.reply({
				content: await interaction.text({ string: "Command.Images.TooBig" }),
				ephemeral: true,
			});

		if (Object.values(client.config.submitChannels).includes(interaction.channel.id))
			return interaction.reply({
				embeds: [new MessageEmbed().setImage(`attachment://${attachment.name}`).setTimestamp()],
				files: [attachment],
				components: [imageButtons],
				ephemeral: true,
			});
		else
			return interaction
				.reply({
					embeds: [new MessageEmbed().setImage(`attachment://${attachment.name}`).setFooter({ text: `${interaction.user.username} | ${interaction.user.id}` }).setTimestamp()],
					files: [attachment],
					components: [imageButtons],
					fetchReply: true,
				})
				.then((message: Message) => {
					message.deleteButton(true);
				});

	},
};
