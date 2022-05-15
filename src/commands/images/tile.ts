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
				.addChoices(
					{ name: "grid", value: "grid" },
					{ name: "vertical", value: "vertical" },
					{ name: "horizontal", value: "horizontal" },
					{ name: "hollow", value: "hollow" },
					{ name: "plus", value: "plus" },
				),
		)
		.addAttachmentOption((o) => o.setName("image").setDescription("The image to tile").setRequired(false))
		.addStringOption((option) =>
			option
				.setName("random")
				.setDescription("Should individual tiles be randomly rotated?")
				.setRequired(false)
				.addChoices(
					{ name: "rotation", value: "rotation" },
					{ name: "flip", value: "flip" }, // only horizontal because mc doesn't use vertical flipping
				),
		),
	execute: async (interaction: CommandInteraction) => {
		const random = interaction.options.getString("random");
		const shape: tileShape = interaction.options.getString("type", true) as tileShape;

		generalSlashCommandImage(interaction, tileAttachment, {
			factor: interaction.options.getNumber("factor"),
			random: random,
			shape: shape,
			name: "tiled.png",
			embed: new MessageEmbed()
				.setTitle(`Tiled as ${shape}`)
				.setDescription(`Random: ${random == undefined ? false : random}`)
				.setImage("attachment://tiled.png"),
		});
	},
};
