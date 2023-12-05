import { Component } from "@interfaces/components";
import { info } from "@helpers/logger";
import { Client, Message, ButtonInteraction } from "@client";
import { paletteToAttachment } from "@images/palette";
import getImage, { imageNotFound } from "@images/getImage";
import { imageTooBig } from "@helpers/warnUser";

export default {
	id: "palette",
	async execute(client: Client, interaction: ButtonInteraction) {
		if (client.verbose) console.log(`${info}Image palette was requested!`);

		const message = interaction.message;
		const url = await getImage(message);
		if (!url) return imageNotFound(interaction);
		const [file, embed] = await paletteToAttachment(url);

		if (!file || !embed) return imageTooBig(interaction, "palette");

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
