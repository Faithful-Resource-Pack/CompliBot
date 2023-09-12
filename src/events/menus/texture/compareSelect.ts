import { Client, Message, SelectMenuInteraction } from "@client";
import { SelectMenu } from "@interfaces";
import { info } from "@helpers/logger";
import { MessageEditOptions, MessageInteraction } from "discord.js";
import textureComparison from "@functions/textureComparison";

export const menu: SelectMenu = {
	selectMenuId: "compareSelect",
	execute: async (client: Client, interaction: SelectMenuInteraction) => {
		if (client.verbose) console.log(`${info}Texture selected!`);

		const messageInteraction: MessageInteraction = interaction.message
			.interaction as MessageInteraction;
		const message: Message = interaction.message as Message;

		if (interaction.user.id !== messageInteraction.user.id)
			return interaction.reply({
				content: (
					await interaction.getEphemeralString({ string: "Error.Interaction.Reserved" })
				).replace("%USER%", `<@!${messageInteraction.user.id}>`),
				ephemeral: true,
			});

		interaction.deferUpdate();

		const [id, display] = interaction.values[0].split("__");
		const editOptions: MessageEditOptions = await textureComparison(
			interaction.client as Client,
			id,
			display,
		);

		message.edit(editOptions).then((message: Message) => message.deleteButton());
	},
};
