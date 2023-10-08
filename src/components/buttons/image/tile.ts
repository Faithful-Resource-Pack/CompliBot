import { Component } from "@interfaces";
import { info } from "@helpers/logger";
import { Client, Message, ButtonInteraction, EmbedBuilder } from "@client";
import { tileToAttachment, tileTooBig } from "@images/tile";
import { imageButtons } from "@utility/buttons";
import getImage from "@helpers/getImage";

export default {
	id: "tile",
	async execute(client: Client, interaction: ButtonInteraction) {
		if (client.verbose) console.log(`${info}Image was tiled!`);

		const message = interaction.message as Message;
		const url = await getImage(message);
		const attachment = await tileToAttachment(url);

		if (!attachment) return await tileTooBig(interaction);

		return interaction
			.reply({
				embeds: [
					new EmbedBuilder()
						.setImage(`attachment://${attachment.name}`)
						.setFooter({ text: `${interaction.user.username} | ${interaction.user.id}` })
						.setTimestamp(),
				],
				files: [attachment],
				components: [imageButtons],
				fetchReply: true,
			})
			.then((message: Message) => {
				message.deleteButton(true);
			});
	},
} as Component;
