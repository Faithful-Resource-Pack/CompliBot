import { Button } from "@interfaces";
import { info } from "@helpers/logger";
import { Client, Message, ButtonInteraction } from "@client";
import { textureComparison } from "@functions/canvas/stitch";

export const button: Button = {
	buttonId: "compare",
	execute: async (client: Client, interaction: ButtonInteraction) => {
		if (client.verbose) console.log(`${info}Image was compared!`);

		const message: Message = interaction.message as Message;
		const ids = message.embeds?.[0]?.title.match(/\d+/);

		await interaction.deferReply();
		const [embed, magnified] = await textureComparison(client, ids[0]);
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
