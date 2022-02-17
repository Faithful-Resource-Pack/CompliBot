import { Button } from "@src/Interfaces";
import { info } from "@src/Helpers/logger";
import { Client, Message, ButtonInteraction } from "@src/Extended Discord";
import { Interaction, MessageInteraction } from "discord.js";
import { InteractionType } from "discord-api-types";

export const button: Button = {
	buttonId: "deleteMessage",
	execute: async (client: Client, interaction: ButtonInteraction) => {
		if (client.verbose) console.log(`${info}Message deleted!`);

		const messageInteraction: MessageInteraction = interaction.message.interaction as MessageInteraction;
		const message: Message = interaction.message as Message;

		if (messageInteraction != undefined && interaction.user.id != messageInteraction.user.id)
			return interaction.reply({
				content: await interaction.text({
					string: "Error.Interaction.Reserved",
					placeholders: { USER: `<@!${messageInteraction.user.id}>` },
				}),
				ephemeral: true,
			});
		if ((interaction.message as Message).reference != undefined && (await (interaction.message as Message).fetchReference()).author.id != interaction.user.id)
			return interaction.reply({
				content: await interaction.text({
					string: "Error.Interaction.Reserved",
					placeholders: { USER: `<@!${(await (interaction.message as Message).fetchReference()).author.id}>` },
				}),
				ephemeral: true,
			});

		try {
			return message.delete();
		} catch (err) {
			return interaction.reply({
				content: await interaction.text({ string: "Error.Message.Deleted" }),
				ephemeral: true,
			});
		}
	},
};