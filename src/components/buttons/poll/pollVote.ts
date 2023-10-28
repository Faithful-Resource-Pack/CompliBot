import { Component } from "@interfaces";
import { Client, ButtonInteraction } from "@client";
import { Poll } from "@helpers/poll";

export default {
	id: "pollVote",
	async execute(client: Client, interaction: ButtonInteraction) {
		await interaction.deferUpdate();
		const message = interaction.message;
		const embed = message.embeds[0];

		// get poll, update it
		const pid = embed.footer.text.split(" | ")[0];
		const poll = new Poll(client.polls.get(pid));

		const type = interaction.customId.replace("pollVote__", "");
		const id = interaction.user.id;

		if (poll.hasVotedFor(type, id)) poll.removeVote(type, id);
		else poll.addVote(type, id);

		await poll.updateEmbed(client);

		if (poll.isAnonymous()) {
			if (poll.getStatus() === "ended")
				return interaction.followUp({
					ephemeral: true,
					content: "This poll has exceeded its timeout and has ended.",
				});
			interaction.followUp({
				ephemeral: true,
				content: poll.hasVotedFor(type, id)
					? "Your vote has been counted."
					: "Your vote has been removed.",
			});
		}

		client.polls.set(pid, poll);
	},
} as Component;
