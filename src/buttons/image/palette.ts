import { Button } from "@helpers/interfaces";
import { info } from "@helpers/logger";
import { Client, Message, ButtonInteraction, MessageEmbed } from "@client";
import { imageButtons } from "@helpers/buttons";
import { paletteAttachment } from "@functions/canvas/palette";
import { getImageFromMessage } from "@functions/slashCommandImage";

export const button: Button = {
	buttonId: "palette",
	execute: async (client: Client, interaction: ButtonInteraction) => {
		if (client.verbose) console.log(`${info}Image palette was requested!`);

		const message: Message = interaction.message as Message;
		const url = await getImageFromMessage(message);
		const [attachment, embed] = await paletteAttachment({
			url: url,
			name: url.split("/").at(-1),
		});

		if (attachment == null)
			return interaction.reply({
				content: await interaction.text({ string: "Command.Images.TooBig" }),
				ephemeral: true,
			});

		if (Object.values(client.config.submissions).filter((c) => c.submit === interaction.channel.id).length > 0)
			return interaction.reply({
				embeds: [new MessageEmbed(embed).setTimestamp()],
				files: [attachment],
				components: [imageButtons],
				ephemeral: true,
			});
		else
			return interaction
				.reply({
					embeds: [
						new MessageEmbed(embed)
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
};
