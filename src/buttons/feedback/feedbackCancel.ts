import { Client, ButtonInteraction, Message } from '@client';
import { Button } from '@interfaces';
import { MessageInteraction } from 'discord.js';

export const button: Button = {
  buttonId: 'feedbackCancel',
  execute: async (client: Client, interaction: ButtonInteraction) => {
    const messageInteraction: MessageInteraction = interaction.message.interaction as MessageInteraction;
    const message: Message = interaction.message as Message;

    if (interaction.user.id !== messageInteraction.user.id)
      return interaction.reply({
        content: (
          await interaction.getEphemeralString({
            string: 'Error.Interaction.Reserved',
          })
        ).replace('%USER%', `<@!${messageInteraction.user.id}>`),
        ephemeral: true,
      });

    await interaction.reply({
      content: (
        await interaction.getEphemeralString({
          string: 'Success.Cancel',
        })
      ).replace(
        '%ACTION%',
        await interaction.getEphemeralString({
          string: 'Command.Feedback.Title',
        }),
      ),
      ephemeral: true,
    });

    try {
      message.delete();
    } catch (_err) {
      /* message already deleted */
    }
  },
};
