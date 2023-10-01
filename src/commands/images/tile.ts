import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "discord.js";
import { ChatInputCommandInteraction, EmbedBuilder } from "@client";
import { tileAttachment, TileShape } from "@images/tile";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("tile")
		.setDescription("Tile an image")
		.addStringOption((option) =>
			option
				.setName("random")
				.setDescription("Should individual tiles be randomly rotated?")
				.setRequired(false)
				.addChoices(
					{ name: "rotation", value: "rotation" },
					{ name: "flip", value: "flip" }, // only horizontal because mc doesn't use vertical flipping
				),
		)
		.addStringOption((option) =>
			option
				.setName("type")
				.setDescription("How the image should be tiled.")
				.setRequired(false)
				.addChoices(
					{ name: "grid", value: "grid" },
					{ name: "vertical", value: "vertical" },
					{ name: "horizontal", value: "horizontal" },
					{ name: "hollow", value: "hollow" },
					{ name: "plus", value: "plus" },
				),
		)
		.addAttachmentOption((o) =>
			o.setName("image").setDescription("The image to tile").setRequired(false),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		const random = interaction.options.getString("random");
		const shape = (interaction.options.getString("type") ?? "grid") as TileShape;
	},
};
