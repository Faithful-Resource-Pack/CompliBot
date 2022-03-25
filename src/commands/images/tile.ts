import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "@client";
import { tileAttachment, tileShape } from "@functions/canvas/tile";
import { generalSlashCommandImage } from "@functions/slashCommandImage";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("tile")
		.setDescription("Tile an image")
		.addStringOption((option) =>
			option
				.setName("type")
				.setDescription("How the image should be tiled.")
				.setRequired(true)
				.addChoices([
					["grid", "grid"],
					["vertical", "vertical"],
					["horizontal", "horizontal"],
					["hollow", "hollow"],
					["plus", "plus"],
				]),
		)
		.addStringOption((option) =>
			option
				.setName("random")
				.setDescription("Should individual tiles be randomly rotated?")
				.addChoices([
					["rotation", "rotation"],
					["flip", "flip"], // only horizontal because mc doesnt use vertical flipping
				]),
		),
	execute: async (interaction: CommandInteraction) => {
		const random = interaction.options.getString("random");
		const shape: tileShape = interaction.options.getString("type", true) as tileShape;

		generalSlashCommandImage(interaction, tileAttachment, {
			factor: interaction.options.getNumber("factor"),
			name: "tiled.png",
			embed: new MessageEmbed()
				.setTitle(`Tiled as ${shape}`)
				.setDescription(`Random: ${random == undefined ? false : random}`)
				.setImage("attachment://tiled.png"),
		});
	},
};
