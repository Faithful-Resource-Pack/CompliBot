import { Client, Message, SelectMenuInteraction } from "@client";
import { SelectMenu } from "@interfaces";
import { info } from "@helpers/logger";
import { MessageInteraction } from "discord.js";
import { cycleComparison } from "@images/cycle";

export const menu: SelectMenu = {
	selectMenuId: "cycleSelect",
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

		const [id, display, framerate] = interaction.values[0].split("__");
		const editOptions = await cycleComparison(
			interaction.client as Client,
			id,
			display,
			Number(framerate),
		);

		message
			.edit(editOptions)
			.then((message: Message) => message.deleteButton());
	},
};
