import { Client, ButtonInteraction, Message } from "@src/Extended Discord";
import { Button } from "@src/Interfaces/buttonEvent";
import { MessageInteraction } from "discord.js";

export const button: Button = {
	buttonId: "feedbackCancel",
	execute: async (client: Client, interaction: ButtonInteraction) => {
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

		await interaction.reply({
			content: (
				await interaction.text({ string: "Success.Cancel" })
			).replace("%ACTION%", await interaction.text({ string: "Command.Feedback.Title" })),
			ephemeral: true,
		});

		try {
			message.delete();
		} catch (_err) {
			/* message already deleted */
		}
	},
};
