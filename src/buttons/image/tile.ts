import { Button } from "@interfaces";
import { info } from "@helpers/logger";
import { Client, Message, ButtonInteraction, MessageEmbed } from "@client";
import { tileAttachment } from "@functions/canvas/tile";
import { magnify, palette } from "@helpers/buttons";
import { getImageFromMessage } from "@functions/slashCommandImage";
import { MessageActionRow } from "discord.js";
import { getSubmissionsChannels } from "@helpers/channels";

export const button: Button = {
	buttonId: "tile",
	execute: async (client: Client, interaction: ButtonInteraction) => {
		if (client.verbose) console.log(`${info}Image was tiled!`);

		const message: Message = interaction.message as Message;
		const url = await getImageFromMessage(message);
		const attachment = (
			await tileAttachment({
				url: url,
				name: url.split("/").at(-1), //gets last element and trims off .png as it is re-added later
			})
		)[0];

		if (attachment == null)
			return interaction.reply({
				content: await interaction.getEphemeralString({ string: "Command.Images.TooBig" }),
				ephemeral: true,
			});

		if (getSubmissionsChannels(interaction.client as Client).includes(interaction.channelId))
			return interaction.reply({
				embeds: [new MessageEmbed().setImage(`attachment://${attachment.name}`).setTimestamp()],
				files: [attachment],
				components: [new MessageActionRow().addComponents(magnify)],
				ephemeral: true,
			});
		else
			return interaction
				.reply({
					embeds: [
						new MessageEmbed()
							.setImage(`attachment://${attachment.name}`)
							.setFooter({ text: `${interaction.user.username} | ${interaction.user.id}` })
							.setTimestamp(),
					],
					files: [attachment],
					components: [new MessageActionRow().addComponents(magnify, palette)],
					fetchReply: true,
				})
				.then((message: Message) => {
					message.deleteButton(true);
				});
	},
};
