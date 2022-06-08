import { Button } from '@interfaces';
import { info } from '@helpers/logger';
import { Client, Message, ButtonInteraction } from '@client';
import { MessageInteraction } from 'discord.js';

const button: Button = {
  buttonId: 'deleteInteraction',
  execute: async (client: Client, interaction: ButtonInteraction) => {
    if (client.verbose) console.log(`${info}Interaction Message deleted!`);

    const messageInteraction: MessageInteraction = interaction.message.interaction as MessageInteraction;
    const message: Message = interaction.message as Message;

    if (messageInteraction && interaction.user.id !== messageInteraction.user.id) {
      interaction.reply({
        content: await interaction.getEphemeralString({
          string: 'Error.Interaction.Reserved',
          placeholders: {
            USER: `<@!${messageInteraction.user.id}>`,
          },
        }),
        ephemeral: true,
      });
      return;
    }

    let fetchedRef: boolean = false;
    try {
      fetchedRef = (await message.fetchReference()).author.id !== interaction.user.id;
    } catch {
      // ref deleted or author not matching
    }

    if (message.reference !== undefined && fetchedRef) {
      interaction.reply({
        content: await interaction.getEphemeralString({
          string: 'Error.Interaction.Reserved',
          placeholders: {
            USER: `<@!${(await message.fetchReference()).author.id}>`,
          },
        }),
        ephemeral: true,
      });
      return;
    }

    try {
      await message.delete();
    } catch (err) {
      interaction.reply({
        content: await interaction.getEphemeralString({
          string: 'Error.Message.Deleted',
        }),
        ephemeral: true,
      });
    }
  },
};

export default button;
