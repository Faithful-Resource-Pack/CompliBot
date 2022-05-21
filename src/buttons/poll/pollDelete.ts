import { Button } from '@interfaces';
import { info } from '@helpers/logger';
import { Client, Message, ButtonInteraction } from '@client';
import { MessageInteraction } from 'discord.js';

export const button: Button = {
  buttonId: 'pollDelete',
  execute: async (client: Client, interaction: ButtonInteraction) => {
    if (client.verbose) console.log(`${info}Poll Message deleted!`);

    const messageInteraction: MessageInteraction = interaction.message.interaction as MessageInteraction;
    const message: Message = interaction.message as Message;
    const pid: string = interaction.message.embeds[0].footer.text.split(' | ')[0];

    if (messageInteraction != undefined && interaction.user.id != messageInteraction.user.id)
      return interaction.reply({
        content: await interaction.getEphemeralString({
          string: 'Error.Interaction.Reserved',
          placeholders: {
            USER: `<@!${messageInteraction.user.id}>`,
          },
        }),
        ephemeral: true,
      });

    try {
      message.delete();
    } catch (err) {
      interaction.reply({
        content: await interaction.getEphemeralString({
          string: 'Error.Message.Deleted',
        }),
        ephemeral: true,
      });
    }

    // try deleting poll from json file if pid is valid
    try {
      client.polls.delete(pid);
    } catch {
      /* pid not valid */
    }

    return;
  },
};
