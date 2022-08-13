import { Button } from '@interfaces';
import {
  Client, Message, ButtonInteraction, MessageEmbed, Automation,
} from '@client';
import { Submission } from '@class/TimedEmbed/Submission';

const button: Button = {
  buttonId: 'submissionUpvote',
  execute: async (client: Client, interaction: ButtonInteraction) => {
    await interaction.deferUpdate();
    const message: Message = interaction.message as Message;
    const embed: MessageEmbed = message.embeds[0];

    // get submission, update it
    const sid: string = embed.footer.text.split(' | ')[0];
    const submission: Submission = new Submission(client.submissions.get(sid));
    const { id } = interaction.user;

    if (submission.hasVotedFor('upvote', id)) submission.removeVote('upvote', id);
    else submission.addVote('upvote', id);

    await submission.updateSubmissionMessage(client, interaction.user.id);
    client.submissions.set(submission.id, Automation.cleanedSubmission(submission));

    interaction.followUp({
      ephemeral: true,
      content: submission.hasVotedFor('upvote', interaction.user.id)
        ? 'Your vote has been counted.'
        : 'Your vote has been removed.',
    });
  },
};

export default button;
