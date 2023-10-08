import { SlashCommand } from "@interfaces";
import { ChatInputCommandInteraction, Message } from "@client";
import { SlashCommandBuilder } from "discord.js";
import { mcColorsOptions, multiplyToAttachment } from "@images/multiply";
import getImage, { imageNotFound } from "@helpers/getImage";
import { imageButtons } from "@utility/buttons";
export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("tint")
		.setDescription(`Tint a grayscale image to a Minecraft color`)
		.addStringOption((option) =>
			option
				.setName("color")
				.setDescription("The color to tint the grayscale image to")
				.addChoices(...mcColorsOptions)
				.setRequired(true),
		)
		.addAttachmentOption((o) =>
			o.setName("image").setDescription("The image to tint").setRequired(false),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();
		const image = await getImage(interaction);
		if (!image) return imageNotFound(interaction);

		const file = await multiplyToAttachment(image, interaction.options.getString("color"));
		await interaction
			.editReply({
				files: [file],
				components: [imageButtons],
			})
			.then((message: Message) => message.deleteButton());
	},
};
