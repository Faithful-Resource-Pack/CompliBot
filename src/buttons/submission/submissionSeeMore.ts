import { Button } from "@interfaces";
import { Client, Message, ButtonInteraction } from "@client";
import { submissionButtonsOpen, submissionButtonsVotes } from "@helpers/buttons";

export const button: Button = {
	buttonId: "submissionSeeMore",
	execute: async (client: Client, interaction: ButtonInteraction) => {
		await interaction.deferUpdate();
		const message: Message = interaction.message as Message;

		if (message.components.length == 2)
			await message.edit({ components: [submissionButtonsOpen, submissionButtonsVotes] });
		else await message.edit({ components: [submissionButtonsOpen] });
	},
};
