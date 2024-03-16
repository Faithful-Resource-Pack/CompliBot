import type { Event } from "@interfaces/events";

export default {
	name: "modalSubmit",
	async execute(client, interaction) {
		client.storeAction("modalSubmit", interaction);

		const modal = client.modals.get(interaction.customId);
		if (modal) return modal.execute(client, interaction);
	},
} as Event;
