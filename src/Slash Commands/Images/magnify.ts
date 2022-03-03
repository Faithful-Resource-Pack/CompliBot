import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "@src/Extended Discord";
import { generalSlashCommandImage } from "@functions/slashCommandImage";
import { magnifyAttachment } from "@functions/canvas/magnify";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("magnify")
		.setDescription("Magnify an image")
		.addNumberOption((num) => {
			return num
				.addChoices([
					["2x", 2],
					["4x", 4],
					["8x", 8],
					["16x", 16],
					["32x", 32],
				])
				.setName("factor")
				.setDescription("The scale factor the image should be enlarged by.")
				.setRequired(false);
		}),
	execute: (interaction: CommandInteraction) => {
		generalSlashCommandImage(interaction, magnifyAttachment, {
			factor: interaction.options.getNumber("factor"),
			name: "magnified.png",
			embed: new MessageEmbed()
				.setTitle("Magnified")
				.setImage("attachment://magnified.png")
		})
	},
};