import { Button } from "@interfaces";
import { info } from "@helpers/logger";
import { Client, Message, ButtonInteraction, MessageEmbed } from "@client";
import { paletteAttachment } from "@images/palette";
import { getImageFromMessage } from "@functions/slashCommandImage";

export const button: Button = {
	buttonId: "palette",
	execute: async (client: Client, interaction: ButtonInteraction) => {
		if (client.verbose) console.log(`${info}Image palette was requested!`);

		const message: Message = interaction.message as Message;
		const url = await getImageFromMessage(message);
		const [attachment, embed] = await paletteAttachment({
			url: url,
		});

		if (attachment == null)
			return interaction.reply({
				content: await interaction.getEphemeralString({ string: "Command.Images.TooBig" }),
				ephemeral: true,
			});

		return interaction
			.reply({
				embeds: [
					new MessageEmbed(embed)
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
};
