import { ButtonInteraction } from "discord.js";
import { Button, Event } from "@src/Interfaces";
import Client from "@src/Client";

export const event: Event = {
	name: "buttonUsed",
	run: async (client: Client, interaction: ButtonInteraction) => {
		const button = client.buttons.get(interaction.customId);

		if (button) {
			(button as Button).execute(client, interaction);
		}
	},
};
