import { ButtonInteraction } from "@src/Client/interaction";
import { Button } from "@src/Interfaces/buttonEvent";
import { info } from "@src/Helpers/logger";
import Client from "@src/Client";
import Message from "@src/Client/message";
import { MessageInteraction } from "discord.js";

export const button: Button = {
	buttonId: "deleteMessage",
	execute: async (client: Client, interaction: ButtonInteraction) => {
		if (client.verbose) console.log(`${info}Messade deleted!`);

		const messageInteraction: MessageInteraction = interaction.message.interaction as MessageInteraction;
		const message: Message = interaction.message as Message;

		if (interaction.user.id !== messageInteraction.user.id)
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
