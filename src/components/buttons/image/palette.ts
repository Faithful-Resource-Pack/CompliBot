import { Component } from "@interfaces";
import { info } from "@helpers/logger";
import { Client, Message, ButtonInteraction } from "@client";
import { paletteToAttachment, paletteTooBig } from "@images/palette";
import getImage from "@helpers/getImage";

export default {
	id: "palette",
	async execute(client: Client, interaction: ButtonInteraction) {
		if (client.verbose) console.log(`${info}Image palette was requested!`);

		const message = interaction.message as Message;
		const url = await getImage(message);
		const [file, embed] = await paletteToAttachment(url);

		if (!file || !embed) return await paletteTooBig(interaction);

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
