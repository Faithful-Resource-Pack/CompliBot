import { SelectMenu, Event } from "@src/Interfaces";
import { Client, SelectMenuInteraction } from "@src/Extended Discord";

export const event: Event = {
  name: "selectMenuUsed",
  run: async (client: Client, interaction: SelectMenuInteraction) => {
    let selectMenu: SelectMenu;

    if (interaction.customId.startsWith('textureSelect_')) selectMenu = client.menus.get('textureSelect')
    else selectMenu = client.menus.get(interaction.customId);

    if (selectMenu) return selectMenu.execute(client, interaction);

  }
}