import { Button } from "@src/Interfaces";
import { info } from "@src/Helpers/logger";
import { Client, Message, ButtonInteraction, MessageEmbed } from "@src/Extended Discord";
import { MessageInteraction } from "discord.js";
import { magnifyAttachment } from "@functions/canvas/magnify";
import imageButtons from "@helpers/imageBtn";

export const button: Button = {
	buttonId: "magnify",
	execute: async (client: Client, interaction: ButtonInteraction) => {
		if (client.verbose) console.log(`${info}Image was magnified!`);

                // mfw unnecessary thing stopping buttons from working on texture
		// const messageInteraction: MessageInteraction = interaction.message.interaction as MessageInteraction;
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
		// if (messageInteraction !== null) {
			return interaction.reply({
				embeds: [new MessageEmbed().setImage(`attachment://${attachment.name}`).setTimestamp()],
				files: [attachment],
				components: [imageButtons],
				fetchReply: true,
			}).then((message: Message) => {
				message.deleteButton();
			});;
		// }
	},
};
