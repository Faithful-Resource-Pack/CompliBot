import { Button, Event } from "@interfaces";
import { Client, ButtonInteraction } from "@client";

export const event: Event = {
	name: "buttonUsed",
	run: async (client: Client, interaction: ButtonInteraction) => {
		let button: Button;

		if (interaction.customId.startsWith("pollVote__")) button = client.buttons.get("pollVote");
		else button = client.buttons.get(interaction.customId);

		if (button) return button.execute(client, interaction);
	},
};
