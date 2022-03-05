import { SelectMenu, Event } from "@helpers/interfaces";
import { Client, SelectMenuInteraction } from "@client";

export const event: Event = {
	name: "selectMenuUsed",
	run: async (client: Client, interaction: SelectMenuInteraction) => {
		let selectMenu: SelectMenu;

		if (interaction.customId.startsWith("textureSelect_")) selectMenu = client.menus.get("textureSelect");
		else selectMenu = client.menus.get(interaction.customId);

		if (selectMenu) return selectMenu.execute(client, interaction);
	},
};
