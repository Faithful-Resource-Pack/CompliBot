import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "discord.js";
import { EmbedBuilder, ChatInputCommandInteraction, Message } from "@client";
import { paletteToAttachment } from "@images/palette";
import getImage from "@helpers/getImage";
import { colors } from "@helpers/colors";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("palette")
		.setDescription("Get the color palette of an image.")
		.addAttachmentOption((o) =>
			o.setName("image").setDescription("The image to palette").setRequired(false),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		const image =
			interaction.options.getAttachment("image", false)?.url ?? (await getImage(interaction));

		const [file, embed] = await paletteToAttachment(image);

		if (!file || !embed)
			return await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle(
							interaction
								.strings()
								.command.images.too_big.replace("%ACTION%", "to take the palette of"),
						)
						.setDescription(interaction.strings().command.images.suggestion)
						.setColor(colors.red),
				],
				ephemeral: true,
			});

		await interaction.reply({
			embeds: [embed],
			files: [file],
			fetchReply: true,
		}).then((message: Message) => {
			message.deleteButton(true);
		});
	},
};
