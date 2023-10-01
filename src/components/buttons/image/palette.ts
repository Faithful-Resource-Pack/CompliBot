import { Component } from "@interfaces";
import { info } from "@helpers/logger";
import { Client, Message, ButtonInteraction, EmbedBuilder } from "@client";
import { paletteAttachment } from "@images/palette";
import getImage from "@helpers/getImage";

export default {
	id: "palette",
	async execute(client: Client, interaction: ButtonInteraction) {
		if (client.verbose) console.log(`${info}Image palette was requested!`);

		const message: Message = interaction.message as Message;
		const url = await getImage(message);
		const [attachment, embed] = await paletteAttachment({
			url: url,
			name: url.split("/").at(-1),
		});

		if (attachment == null)
			return interaction.reply({
				content: interaction.strings().Command.Images.TooBig,
				ephemeral: true,
			});

		return interaction
			.reply({
				embeds: [
					EmbedBuilder.from(embed)
						.setFooter({ text: `${interaction.user.username} | ${interaction.user.id}` })
						.setTimestamp(),
				],
				files: [attachment],
				fetchReply: true,
			})
			.then((message: Message) => {
				message.deleteButton(true);
			});
	},
} as Component;
