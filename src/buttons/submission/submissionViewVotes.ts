import { Button } from '@interfaces';
import {
  Client, Message, ButtonInteraction, MessageEmbed,
} from '@client';
import { Submission } from '@class/submissions';
import { ids, parseId } from '@helpers/emojis';

const button: Button = {
  buttonId: 'submissionViewVotes',
  execute: async (client: Client, interaction: ButtonInteraction) => {
    const message: Message = interaction.message as Message;
    const authorId: string = interaction.message.embeds[0].footer.text.split(' | ')[1]; // splits by | to remove stuff before author id
    const sid: string = interaction.message.embeds[0].footer.text.split(' | ')[0];

    if (interaction.user.id !== authorId && !message.reference) {
      interaction.reply({
        content: await interaction.getEphemeralString({
          string: 'Error.Interaction.Reserved',
          placeholders: {
            USER: `<@!${authorId}>`,
          },
        }),
        ephemeral: true,
      });
      return;
    }

    if (client.submissions.get(sid) === undefined) {
      interaction.reply({
        content:
          'This submission as already reached the end of the process, people who have voted has been sent to your DMs!\n> DM closed? The vote list has been sent to the private Art Director Council channel. Please ask a Council member for the list..',
        ephemeral: true,
      });
      return;
    }

    const submission = new Submission(client.submissions.get(sid));
    const [up, down] = submission.getVotesCount();
    const [upvoters, downvoters] = submission.getVotes();
    const embed = new MessageEmbed().setTitle('Votes for your submission').addFields(
      {
        name: 'Upvotes',
        value: `${parseId(ids.upvote)} ${up > 0 ? `<@!${upvoters.join('>,\n<@!')}>` : 'None'}`,
      },
      {
        name: 'Downvotes',
        value: `${parseId(ids.downvote)} ${down > 0 ? `<@!${downvoters.join('>,\n<@!')}>` : 'None'}`,
      },
    );

    try {
      interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    } catch (err) {
      console.error(err);
    }
  },
};

export default button;
