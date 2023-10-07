import { Component } from "@interfaces";
import { info } from "@helpers/logger";
import { Client, Message, ButtonInteraction, EmbedBuilder } from "@client";
import { paletteToAttachment } from "@images/palette";
import getImage from "@helpers/getImage";

export default {
	id: "palette",
	async execute(client: Client, interaction: ButtonInteraction) {
		if (client.verbose) console.log(`${info}Image palette was requested!`);

		const message: Message = interaction.message as Message;
		const url = await getImage(message);
		const [attachment, embed] = await paletteToAttachment(url);

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
