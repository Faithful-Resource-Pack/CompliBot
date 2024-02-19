import type { SlashCommand } from "@interfaces/interactions";
import { Message } from "@client";
import { SlashCommandBuilder } from "discord.js";
import { mcColorsOptions, multiplyToAttachment } from "@images/multiply";
import getImage, { imageNotFound } from "@images/getImage";
import { imageButtons } from "@utility/buttons";
export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("tint")
		.setDescription(`Tint a grayscale image to a Minecraft color`)
		.addStringOption((option) =>
			option
				.setName("colour")
				.setNameLocalization("en-US", "color")
				.setDescription("The colour to tint the grayscale image to")
				.setDescriptionLocalization("en-US", "The color to tint the grayscale image to")
				.addChoices(...mcColorsOptions)
				.setRequired(true),
		)
		.addAttachmentOption((o) =>
			o.setName("image").setDescription("The image to tint").setRequired(false),
		),
	async execute(interaction) {
		await interaction.deferReply();
		const image = await getImage(interaction);
		if (!image) return imageNotFound(interaction);

		const file = await multiplyToAttachment(image, interaction.options.getString("colour"));
		await interaction
			.editReply({
				files: [file],
				components: [imageButtons],
			})
			.then((message: Message) => message.deleteButton());
	},
};
