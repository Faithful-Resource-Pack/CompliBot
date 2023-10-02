import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "discord.js";
import { ChatInputCommandInteraction, Message } from "@client";
import { tileToAttachment, TileShape, TileRandom } from "@images/tile";
import getImage from "@helpers/getImage";
import { imageButtons } from "@helpers/buttons";

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
		await interaction.deferReply();
		const random = interaction.options.getString("random") as TileRandom;
		const shape = interaction.options.getString("type") as TileShape;

		const image =
			interaction.options.getAttachment("image", false)?.url ?? (await getImage(interaction));

		const file = await tileToAttachment(image, { random, shape });
		await interaction
			.editReply({
				files: [file],
				components: [imageButtons]
			})
			.then((message: Message) => message.deleteButton());
	},
};
