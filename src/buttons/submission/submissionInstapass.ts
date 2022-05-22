import { Button } from '@interfaces';
import {
  Client, Message, ButtonInteraction, MessageEmbed,
} from '@client';
import { GuildMember, Role } from 'discord.js';
import { Submission } from '@class/submissions';
import getRolesIds from '@helpers/roles';

const button: Button = {
  buttonId: 'submissionInstapass',
  execute: async (client: Client, interaction: ButtonInteraction) => {
    const message: Message = interaction.message as Message;
    const embed: MessageEmbed = message.embeds[0];
    const member: GuildMember = interaction.member as GuildMember;

    // check if member is council
    if (
      member.roles.cache.find((role: Role) => getRolesIds({
        name: 'council',
        teams: ['faithful'],
        discords: ['dev'],
      }).includes(role.id)) === undefined
    ) {
      interaction.reply({
        content: 'This interaction is reserved to council members',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferUpdate();

    // get submission, update it, delete it (no needs to keep it in memory since it has ended the submission process)
    const sid: string = embed.footer.text.split(' | ')[0];
    const submission: Submission = new Submission(client.submissions.get(sid));

    submission.setStatus('instapassed', client);
    await submission.updateSubmissionMessage(client, interaction.user.id);
    await submission.createContribution(client);
    client.submissions.set(submission.id, submission);
  },
};

export default button;
