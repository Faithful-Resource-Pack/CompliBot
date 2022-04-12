import { Button } from "@interfaces";
import { Client, Message, ButtonInteraction, MessageEmbed } from "@client";
import { Submission } from "@class/submissions";
import { GuildMember, Role } from "discord.js";
import { getRolesIds } from "@helpers/roles";

export const button: Button = {
	buttonId: "submissionUpvoteCouncil",
	execute: async (client: Client, interaction: ButtonInteraction) => {
		await interaction.deferUpdate();
		const message: Message = interaction.message as Message;
		const embed: MessageEmbed = message.embeds[0];
		const member: GuildMember = interaction.member as GuildMember;

		// check if member is council
		if (
			member.roles.cache.find((role: Role) =>
				getRolesIds({ name: "council", teams: ["faithful"] }).includes(role.id),
			) === undefined
		)
			return interaction.reply({
				content: "Only council members can vote while the texture is in council!",
				ephemeral: true,
			});

		// get submission, update it
		const sid: string = embed.footer.text.split(" | ")[0];
		const submission: Submission = new Submission(client.submissions.get(sid));

		submission.addUpvote(interaction.user.id);
		await submission.updateSubmissionMessage(client, interaction.user.id);
		client.submissions.set(submission.id, submission);
	},
};
