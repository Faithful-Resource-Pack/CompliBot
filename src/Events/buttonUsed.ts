import { Button, Event } from "@src/Interfaces";
import { Client, ButtonInteraction } from "@src/Extended Discord";

export const event: Event = {
	name: "buttonUsed",
	run: async (client: Client, interaction: ButtonInteraction) => {
		const button: Button = client.buttons.get(interaction.customId);

		if (button) return button.execute(client, interaction);
	},
};
