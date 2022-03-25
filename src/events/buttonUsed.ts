import { Button, Event } from "@interfaces";
import { Client, ButtonInteraction } from "@client";
import { info } from "@helpers/logger";

export const event: Event = {
	name: "buttonUsed",
	run: async (client: Client, interaction: ButtonInteraction) => {
		if (client.verbose) console.log(`${info}Button used`)
		let button: Button;

		if (interaction.customId.startsWith("pollVote__")) button = client.buttons.get("pollVote");
		else button = client.buttons.get(interaction.customId);

		if (button) return button.execute(client, interaction);
	},
};
