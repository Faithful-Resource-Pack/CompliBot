import { Event } from "@interfaces";
import { Client, ModalSubmitInteraction } from "@client";

export default {
	name: "modalSubmit",
	async execute(client: Client, interaction: ModalSubmitInteraction) {
		client.storeAction("modal", interaction);

		const modal = client.modals.get(interaction.customId);
		if (modal) return modal.execute(client, interaction);
	},
} as Event;
