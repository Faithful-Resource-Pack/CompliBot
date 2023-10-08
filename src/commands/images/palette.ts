import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "discord.js";
import { ChatInputCommandInteraction, Message } from "@client";
import { paletteToAttachment, paletteTooBig } from "@images/palette";
import getImage, { imageNotFound } from "@helpers/getImage";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("palette")
		.setDescription("Get the color palette of an image.")
		.addAttachmentOption((o) =>
			o.setName("image").setDescription("The image to palette").setRequired(false),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		const image = await getImage(interaction);
		if (!image) return imageNotFound(interaction);

		const [file, embed] = await paletteToAttachment(image);

		if (!file || !embed) return await paletteTooBig(interaction);

		await interaction
			.reply({
				embeds: [embed],
				files: [file],
				fetchReply: true,
			})
			.then((message: Message) => {
				message.deleteButton();
			});
	},
};
