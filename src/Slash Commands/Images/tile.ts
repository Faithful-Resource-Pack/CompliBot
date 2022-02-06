import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder, SlashCommandStringOption, SlashCommandBooleanOption } from "@discordjs/builders";
import { CommandInteraction } from "@src/Extended Discord";
import { slashCommandImage } from "@functions/slashCommandImage";
import { tileAttachment, tileShape } from "@functions/canvas/tile";

export const command: SlashCommand = {
	permissions: undefined,
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
		.addBooleanOption((option: SlashCommandBooleanOption) =>
			option.setName("random").setDescription("Does tiling is randomly rotated?"),
		),
	execute: async (interaction: CommandInteraction) => {
		let random: boolean =
			interaction.options.getBoolean("random") === null ? false : interaction.options.getBoolean("random");
		let shape: tileShape = interaction.options.getString("type", true) as tileShape;

		slashCommandImage({
			interaction: interaction,
			limit: 10,
			response: {
				title: `Tiled as ${shape}`,
				description: `Random: ${random}`,
				url: "attachment://tiled.png",
				attachmentOptions: {
					random: random,
					shape: shape,
				},
				attachment: tileAttachment,
			},
		});
	},
};
