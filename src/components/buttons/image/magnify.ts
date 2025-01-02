import type { Component } from "@interfaces/components";
import { info } from "@helpers/logger";
import { Message, ButtonInteraction, EmbedBuilder } from "@client";
import { magnifyToAttachment } from "@images/magnify";
import { magnifyButtons } from "@utility/buttons";
import getImage, { imageNotFound } from "@images/getImage";

export default {
	id: "magnify",
	async execute(client, interaction) {
		if (client.verbose) console.log(`${info}Image was magnified!`);

		const message = interaction.message;
		const url = await getImage(message);
		if (!url) return imageNotFound(interaction);
		const attachment = await magnifyToAttachment(url);

		return interaction
			.reply({
				embeds: [
					new EmbedBuilder()
						.setImage(`attachment://${attachment.name}`)
						.setFooter({ text: `${interaction.user.username} | ${interaction.user.id}` })
						.setTimestamp(),
				],
				files: [attachment],
				components: [magnifyButtons],
				withResponse: true,
			})
			.then(({ resource }) => resource.message.deleteButton(true));
	},
} as Component<ButtonInteraction>;
