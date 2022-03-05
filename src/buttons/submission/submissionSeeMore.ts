import { Button } from "@helpers/interfaces";
import { Client, Message, ButtonInteraction } from "@client";
import { submissionButtonsOpen, submissionButtonsVotes } from "@helpers/buttons";

export const button: Button = {
	buttonId: "submissionSeeMore",
	execute: async (client: Client, interaction: ButtonInteraction) => {
		const message: Message = interaction.message as Message;

		if (message.components.length == 2)
			await message.edit({ components: [submissionButtonsOpen, submissionButtonsVotes] });
		else await message.edit({ components: [submissionButtonsOpen] });

		try {
			interaction.update({});
		} catch (err) {
			console.error(err);
		}
	},
};
