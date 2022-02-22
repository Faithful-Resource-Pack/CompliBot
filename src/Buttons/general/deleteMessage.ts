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
		const authorId: string = interaction.message.embeds[0].footer.text.split(" | ")[1]; //splits by | to remove stuff before author id

		console.log(authorId)

		if (!authorId) return interaction.reply({
			content: await interaction.text({
				string: "Error.NotFound",
				placeholders: { THING: `Author ID in footer` }
			}),
			ephemeral: true
		})

		if (interaction.user.id != authorId)
			return interaction.reply({
				content: await interaction.text({
					string: "Error.Interaction.Reserved",
					placeholders: { USER: `<@!${authorId}>` },
				}),
				ephemeral: true,
			});

		let fetchedRef: boolean = false;
		try {
			fetchedRef =(await message.fetchReference()).author.id != interaction.user.id
		} catch {} // ref deleted or author not matching

		if (message.reference !== undefined && fetchedRef)
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