import { Button } from "@interfaces";
import { info } from "@helpers/logger";
import { Client, Message, ButtonInteraction, MessageEmbed } from "@client";
import textureComparison from "@functions/textureComparison";
import { MessageEmbedFooter } from "discord.js";

export const button: Button = {
	buttonId: "compare",
	execute: async (client: Client, interaction: ButtonInteraction) => {
		if (client.verbose) console.log(`${info}Image was compared!`);

		const message: Message = interaction.message as Message;
		const ids = message.embeds?.[0]?.title.match(/\d+/);

		await interaction.deferReply();
		const [embed, magnified] = await textureComparison(client, ids[0]);

		(embed as MessageEmbed).setFooter(
			embed.footer
				? {
						text: `${embed.footer.text} | ${interaction.user.id}`,
						iconURL: (embed.footer as MessageEmbedFooter).iconURL,
				  }
				: {
						text: interaction.user.id,
				  },
		);

		embed.setTimestamp();

		return interaction
			.editReply({
				embeds: [embed],
				files: magnified ? [magnified] : null,
			})
			.then((message: Message) => {
				message.deleteButton(true);
			});
	},
};
