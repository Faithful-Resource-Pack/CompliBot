import { Button } from '@interfaces';
import {
  Client, Message, ButtonInteraction, MessageEmbed, Automation,
} from '@client';
import { Submission } from '@class/TimedEmbed/Submission';
import { GuildMember, Role } from 'discord.js';
import getRolesIds from '@helpers/roles';

const button: Button = {
  buttonId: 'submissionDownvoteCouncil',
  execute: async (client: Client, interaction: ButtonInteraction) => {
    await interaction.deferUpdate();
    const message: Message = interaction.message as Message;
    const embed: MessageEmbed = message.embeds[0];
    const member: GuildMember = interaction.member as GuildMember;

    // check if member is council
    if (
      member.roles.cache.find((role: Role) => getRolesIds({
        name: 'council',
        teams: ['faithful'],
      }).includes(role.id)) === undefined
    ) {
      interaction.followUp({
        content: 'Only council members can vote while the texture is in council!',
        ephemeral: true,
      });
      return;
    }

    // get submission, update it
    const sid: string = embed.footer.text.split(' | ')[0];
    const submission: Submission = new Submission(client.submissions.get(sid));
    const { id } = interaction.user;

    if (submission.hasVotedFor('downvote', id)) submission.removeVote('downvote', id);
    else submission.addVote('downvote', id);

    await submission.updateSubmissionMessage(client, interaction.user.id);
    client.submissions.set(submission.id, Automation.cleanedSubmission(submission));

    interaction.followUp({
      ephemeral: true,
      content: submission.hasVotedFor('downvote', interaction.user.id)
        ? 'Your vote has been counted.'
        : 'Your vote has been removed.',
    });
  },
};

export default button;
