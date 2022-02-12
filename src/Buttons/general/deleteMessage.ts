import { Button } from "@src/Interfaces";
import { info } from "@src/Helpers/logger";
import { Client, Message, ButtonInteraction } from "@src/Extended Discord";
import { MessageInteraction } from "discord.js";

export const button: Button = {
	buttonId: "deleteMessage",
	execute: async (client: Client, interaction: ButtonInteraction) => {
		if (client.verbose) console.log(`${info}Message deleted!`);

		const messageInteraction: MessageInteraction = interaction.message.interaction as MessageInteraction;
		const message: Message = interaction.message as Message;

		if (messageInteraction !== null && interaction.user.id !== messageInteraction.user.id)
			return interaction.reply({
				content: (await interaction.text({ string: "Error.Interaction.Reserved" })).replace(
					"%USER%",
					`<@!${messageInteraction.user.id}>`,
				),
				ephemeral: true,
			});

		try {
			return message.delete();
		} catch (err) {
			interaction.reply({
				content: await interaction.text({ string: "Error.Message.Deleted" }),
				ephemeral: true,
			});
		}
	},
};
