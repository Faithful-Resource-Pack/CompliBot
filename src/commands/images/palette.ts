import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { generalSlashCommandImage } from "@functions/slashCommandImage";
import { MessageEmbed } from "@client";
import { paletteAttachment } from "@functions/canvas/palette";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("palette")
		.setDescription("Get the color palette of an image.")
		.addAttachmentOption((o) => o.setName("image").setDescription("The image to palette").setRequired(false)),
	execute: async (interaction: CommandInteraction) => {
		generalSlashCommandImage(interaction, paletteAttachment, {
			factor: interaction.options.getNumber("factor"),
			name: "magnified.png",
			embed: new MessageEmbed().setTitle("Magnified").setImage("attachment://magnified.png"),
			hideButtons: true,
		});
	},
};
