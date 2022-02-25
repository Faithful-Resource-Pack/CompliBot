import { Button } from "@src/Interfaces";
import { Client, Message, ButtonInteraction, MessageEmbed } from "@src/Extended Discord";
import { Submission } from "@helpers/class/submissions";

export const button: Button = {
  buttonId: "submissionDownvote",
  execute: async (client: Client, interaction: ButtonInteraction) => {
    const message: Message = interaction.message as Message;
    const embed: MessageEmbed = message.embeds[0];

		// get submission, update it, delete it (no needs to keep it in memory since it has ended the submission process)
		const sid: string = embed.footer.text.split(" | ")[0];
		const submission: Submission = new Submission(client.submissions.get(sid));
    
    submission.addDownvote(interaction.user.id);
    await submission.updateSubmissionMessage(client, interaction.user.id);
    client.submissions.set(submission.id, submission);

    try {
      interaction.update({});
    } catch {}
  }
}