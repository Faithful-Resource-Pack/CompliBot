import { Button } from "@interfaces";
import { info } from "@helpers/logger";
import { Client, Message, ButtonInteraction, EmbedBuilder } from "@client";
import { tileAttachment } from "@images/tile";
import { magnify, palette } from "@helpers/buttons";
import { getImageFromMessage } from "@functions/slashCommandImage";
import { ActionRowBuilder } from "discord.js";
import { ButtonBuilder } from "@discordjs/builders";

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
				content: interaction.strings().Command.Images.TooBig,
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
};
