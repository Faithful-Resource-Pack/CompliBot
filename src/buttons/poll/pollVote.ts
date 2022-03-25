import { Button } from "@interfaces";
import { Client, Message, ButtonInteraction, MessageEmbed } from "@client";
import { Poll } from "@class/poll";

export const button: Button = {
	buttonId: "pollVote",
	execute: async (client: Client, interaction: ButtonInteraction) => {
		await interaction.deferUpdate();
		const message: Message = interaction.message as Message;
		const embed: MessageEmbed = message.embeds[0];

		// get poll, update it
		const pid: string = embed.footer.text.split(" | ")[0];
		const poll: Poll = new Poll(client.polls.get(pid));

		poll.addVote(interaction.customId.replace("pollVote__", ""), interaction.user.id);
		await poll.updateEmbed(client);
		client.polls.set(pid, poll);
	},
};
