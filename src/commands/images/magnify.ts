import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "@client";
import { generalSlashCommandImage } from "@functions/slashCommandImage";
import { magnifyAttachment } from "@images/magnify";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("magnify")
		.setDescription("Magnify an image.")
		.addAttachmentOption((o) =>
			o.setName("image").setDescription("The image to magnify").setRequired(false),
		)
		.addNumberOption((num) => {
			return num
				.addChoices(
					{ name: "0.25x", value: 0.25 },
					{ name: "0.5x", value: 0.5 },
					{ name: "2x", value: 2 },
					{ name: "4x", value: 4 },
					{ name: "8x", value: 8 },
					{ name: "16x", value: 16 },
					{ name: "32x", value: 32 },
				)
				.setName("factor")
				.setDescription("The scale factor the image should be enlarged by.")
				.setRequired(false);
		}),
	execute: (interaction: CommandInteraction) => {
		generalSlashCommandImage(interaction, magnifyAttachment, {
			factor: interaction.options.getNumber("factor"),
			name: "magnified.png",
			embed: new MessageEmbed().setTitle("Magnified").setImage("attachment://magnified.png"),
		});
	},
};
