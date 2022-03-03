import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder, SlashCommandStringOption, SlashCommandBooleanOption } from "@discordjs/builders";
import { CommandInteraction } from "@src/Extended Discord";
import { slashCommandImage } from "@functions/slashCommandImage";
import { tileAttachment, tileShape } from "@functions/canvas/tile";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("tile")
		.setDescription("Tile an image")
		.addStringOption((option: SlashCommandStringOption) =>
			option
				.setName("type")
				.setDescription("How the image should be tiled?")
				.setRequired(true)
				.addChoices([
					["grid", "grid"],
					["vertical", "vertical"],
					["horizontal", "horizontal"],
					["hollow", "hollow"],
					["plus", "plus"],
				]),
		)
		.addStringOption((option: SlashCommandStringOption) =>
			option
				.setName("random")
				.setDescription("Does tiling is randomly rotated?")
				.addChoices([
					["rotation", "rotation"],
					["flip", "flip"], // only horizontal because mc doesnt use vertical flipping
				]),
		),
	execute: async (interaction: CommandInteraction) => {
		const random = interaction.options.getString("random");
		const shape: tileShape = interaction.options.getString("type", true) as tileShape;

		slashCommandImage({
			interaction: interaction,
			limit: 10,
			response: {
				title: `Tiled as ${shape}`,
				description: `Random: ${random == undefined ? false : random}`,
				url: "attachment://tiled.png",
				attachmentOptions: {
					random: interaction.options.getString("random"),
					shape: shape,
				},
				attachment: tileAttachment,
			},
		});
	},
};
