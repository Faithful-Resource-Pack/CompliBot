import { Button } from "@interfaces";
import { Client, Message, ButtonInteraction, MessageEmbed } from "@client";
import { Submission } from "@class/submissions";

export const button: Button = {
	buttonId: "submissionDownvote",
	execute: async (client: Client, interaction: ButtonInteraction) => {
		const message: Message = interaction.message as Message;
		const embed: MessageEmbed = message.embeds[0];

		// get submission, update it
		const sid: string = embed.footer.text.split(" | ")[0];
		const submission: Submission = new Submission(client.submissions.get(sid));

		submission.addDownvote(interaction.user.id);
		await submission.updateSubmissionMessage(client, interaction.user.id);
		client.submissions.set(submission.id, submission);

		try {
			interaction.update({});
		} catch {}
	},
};
