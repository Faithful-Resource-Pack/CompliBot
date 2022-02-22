import { Button } from "@src/Interfaces";
import { info } from "@src/Helpers/logger";
import { Client, Message, ButtonInteraction, MessageEmbed } from "@src/Extended Discord";
import { MessageInteraction } from "discord.js";
import { tileAttachment } from "@functions/canvas/tile";
import { imageButtons } from "@helpers/buttons";

export const button: Button = {
	buttonId: "tile",
	execute: async (client: Client, interaction: ButtonInteraction) => {
		if (client.verbose) console.log(`${info}Image was tiled!`);

		const message: Message = interaction.message as Message;
		const url = message.embeds[0].image.url;

		const attachment = await tileAttachment({
			url: url,
			name: url.split("/").at(-1), //gets last element and trims off .png as it is readded later
		});
		if (attachment == null)
			return interaction.reply({
				content: await interaction.text({ string: "Command.Images.TooBig" }),
				ephemeral: true,
			});
			
		return interaction.reply({
			embeds: [new MessageEmbed().setImage(`attachment://${attachment.name}`).setFooter({ text: `${interaction.user.username} | ${interaction.user.id}` }).setTimestamp()],
			files: [attachment],
			components: [imageButtons],
			fetchReply: true,
		}).then((message: Message) => {
			message.deleteButton(true);
		});;
	},
};
