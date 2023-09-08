import { Client, ButtonInteraction } from "@client";
import { Button } from "@interfaces";
import { info } from "@helpers/logger";
import sendFeedback from "@helpers/feedback";

export const button: Button = {
	buttonId: "feedbackBug",
	execute: async (client: Client, interaction: ButtonInteraction) => {
		if (client.verbose) console.log(`${info}Bug report sent!`);
		return await sendFeedback(client, interaction, interaction.message.interaction.user.id, "bug");
	},
};
