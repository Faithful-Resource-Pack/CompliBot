import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "@src/Extended Discord";
import { slashCommandImage } from "@functions/slashCommandImage";
import { magnifyAttachment } from "@functions/canvas/magnify";

export const command: SlashCommand = {
	permissions: undefined,
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
	execute: async (interaction: CommandInteraction) => {
		slashCommandImage({
			interaction: interaction,
			limit: 10,
			response: {
				title: "Magnified",
				url: "attachment://magnified.png",
				attachmentOptions: {
					factor: await interaction.options.getNumber("factor"), //it will check if it is undefined in magnifyAttachment
				},
				attachment: magnifyAttachment,
			},
		});
	},
};
//x
