import { Component } from "@interfaces/components";
import { info } from "@helpers/logger";
import { Client, Message, ButtonInteraction, EmbedBuilder } from "@client";
import { tileToAttachment, untile } from "@images/tile";
import { tileButtons } from "@utility/buttons";
import getImage, { imageNotFound } from "@images/getImage";
import { imageTooBig } from "@helpers/warnUser";

export default {
	id: "rotate",
	async execute(client: Client, interaction: ButtonInteraction) {
		if (client.verbose) console.log(`${info}Image was rotated!`);

		const message = interaction.message;
		const url = await getImage(message);
		if (!url) return imageNotFound(interaction);
		const image = await untile(url);
		const attachment = await tileToAttachment(image, { random: "rotation", magnify: true });

		if (!attachment) return await imageTooBig(interaction, "tile");

		return interaction
			.reply({
				embeds: [
					new EmbedBuilder()
						.setImage(`attachment://${attachment.name}`)
						.setFooter({ text: `${interaction.user.username} | ${interaction.user.id}` })
						.setTimestamp(),
				],
				files: [attachment],
				components: [tileButtons],
				fetchReply: true,
			})
			.then((message: Message) => {
				message.deleteButton(true);
			});
	},
} as Component;
