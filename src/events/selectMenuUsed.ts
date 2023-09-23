import { SelectMenu, Event } from "@interfaces";
import { Client, StringSelectMenuInteraction } from "@client";

export const event: Event = {
	name: "selectMenuUsed",
	run: async (client: Client, interaction: StringSelectMenuInteraction) => {
		client.storeAction("selectMenu", interaction);

		const selectMenu: SelectMenu = client.menus.get(interaction.customId.split("_")[0]);
		if (selectMenu) return selectMenu.execute(client, interaction);
	},
};
