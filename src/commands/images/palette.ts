import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "discord.js";
import { EmbedBuilder, ChatInputCommandInteraction } from "@client";
import { paletteAttachment } from "@images/palette";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("palette")
		.setDescription("Get the color palette of an image.")
		.addAttachmentOption((o) =>
			o.setName("image").setDescription("The image to palette").setRequired(false),
		),
	async execute(interaction: ChatInputCommandInteraction) {},
};
