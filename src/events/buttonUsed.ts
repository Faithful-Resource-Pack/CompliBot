import { Event } from "@interfaces/events";
import { ButtonInteraction } from "@client";
import { info } from "@helpers/logger";

export default {
	name: "buttonUsed",
	async execute(client, interaction: ButtonInteraction) {
		client.storeAction("button", interaction);

		if (client.verbose) console.log(`${info}Button used!`);

		const button = interaction.customId.startsWith("pollVote__")
			? client.buttons.get("pollVote")
			: client.buttons.get(interaction.customId);

		if (button) return button.execute(client, interaction);
	},
} as Event;
