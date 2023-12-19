import { Component } from "@interfaces/components";
import { Client, ButtonInteraction, EmbedBuilder } from "@client";
import { Poll } from "@helpers/poll";
import { colors } from "@utility/colors";

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
					embeds: [
						new EmbedBuilder()
							.setTitle(interaction.strings().command.poll.ended)
							.setDescription(interaction.strings().command.poll.suggestion)
							.setColor(colors.red),
					],
					ephemeral: true,
				});
			const userVoteStatus = poll.hasVotedFor(type, id) ? "counted" : "removed";
			interaction.followUp({
				embeds: [
					new EmbedBuilder()
						.setTitle(interaction.strings().command.poll.vote[userVoteStatus])
						.setDescription(
							interaction.strings().command.poll.vote[`${userVoteStatus}_suggestion`],
						),
				],
				ephemeral: true,
			});
		}

		client.polls.set(pid, poll);
	},
} as Component;
