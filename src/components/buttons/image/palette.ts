import { Component } from "@interfaces";
import { info } from "@helpers/logger";
import { Client, Message, ButtonInteraction, EmbedBuilder } from "@client";
import { paletteToAttachment } from "@images/palette";
import getImage from "@helpers/getImage";
import { colors } from "@helpers/colors";

export default {
	id: "palette",
	async execute(client: Client, interaction: ButtonInteraction) {
		if (client.verbose) console.log(`${info}Image palette was requested!`);

		const message = interaction.message as Message;
		const url = await getImage(message);
		const [file, embed] = await paletteToAttachment(url);

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

		return interaction
			.reply({
				embeds: [
					embed
						.setFooter({ text: `${interaction.user.username} | ${interaction.user.id}` })
						.setTimestamp(),
				],
				files: [file],
				fetchReply: true,
			})
			.then((message: Message) => {
				message.deleteButton(true);
			});
	},
} as Component;
