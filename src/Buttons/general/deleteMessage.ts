import { Button } from "@src/Interfaces";
import { info } from "@src/Helpers/logger";
import { Client, Message, ButtonInteraction } from "@src/Extended Discord";
import { Interaction, MessageInteraction } from "discord.js";
import { InteractionType } from "discord-api-types";

export const button: Button = {
	buttonId: "deleteMessage",
	execute: async (client: Client, interaction: ButtonInteraction) => {
		if (client.verbose) console.log(`${info}Message deleted!`);

		const message: Message = interaction.message as Message;
		// as we can't fetch the interaction to detect who is the owner of the message/interaction, we uses the stored id inside the footer
		const authorid: string = interaction.message.embeds[0].footer.text.split("|")[1]; //splits by | to remove sid

		if (interaction.user.id != authorid)
			return interaction.reply({
				content: await interaction.text({
					string: "Error.Interaction.Reserved",
					placeholders: { USER: `<@!${authorid}>` },
				}),
				ephemeral: true,
			});

		if (message.reference != undefined && (await message.fetchReference()).author.id != interaction.user.id)
			return interaction.reply({
				content: await interaction.text({
					string: "Error.Interaction.Reserved",
					placeholders: { USER: `<@!${(await message.fetchReference()).author.id}>` },
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
