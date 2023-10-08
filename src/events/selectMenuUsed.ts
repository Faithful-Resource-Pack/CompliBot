import { Event } from "@interfaces";
import { Client, StringSelectMenuInteraction } from "@client";

export default {
	name: "selectMenuUsed",
	async execute(client: Client, interaction: StringSelectMenuInteraction) {
		client.storeAction("selectMenu", interaction);

		const selectMenu = client.menus.get(interaction.customId.split("_")[0]);
		if (selectMenu) return selectMenu.execute(client, interaction);
	},
} as Event;
