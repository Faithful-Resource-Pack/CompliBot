import { Client, Message, SelectMenuInteraction } from "@src/Extended Discord"
import { SelectMenu } from "@src/Interfaces"
import { info } from "@src/Helpers/logger";
import imageButtons from "@src/Helpers/imageBtn";
import { MessageInteraction } from "discord.js";
import { getTextureMessageOptions } from "@src/Functions/getTexture";
import axios from "axios";

export const menu: SelectMenu = {
  selectMenuId: "textureSelect",
  execute: async (client: Client, interaction: SelectMenuInteraction) => {
		if (client.verbose) console.log(`${info}Texture selected!`);

		const messageInteraction: MessageInteraction = interaction.message.interaction as MessageInteraction;
		const message: Message = interaction.message as Message;

		if (interaction.user.id !== messageInteraction.user.id)
			return interaction.reply({
				content: (await interaction.text({ string: "Error.Interaction.Reserved" })).replace(
					"%USER%",
					`<@!${messageInteraction.user.id}>`,
				),
				ephemeral: true,
			});
		else interaction.deferReply();

		const [id, pack] = interaction.values[0].split('__');
		const [embed, files] = await getTextureMessageOptions({ texture: (await axios.get(`${(interaction.client as Client).config.apiUrl}textures/${id}/all`)).data, pack: pack });

		try {
			message.delete();
		} catch (err) { 
			interaction.editReply({
				content: await interaction.text({ string: "Error.Message.Deleted" })
			});
		}

		interaction.editReply({ embeds: [embed], files: files, components: [imageButtons] })
			.then((message: Message) => message.deleteButton());
  }
}
