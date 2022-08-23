import { ButtonInteraction, userMention } from 'discord.js';
import { Client } from '@client';
import { IEvent } from '@interfaces';
import { Logger } from '@utils';

export default {
  id: 'buttonCreate',
  run: async (client: Client, interaction: ButtonInteraction) => {
    Logger.log('debug', `Button '${interaction.customId}' used by ${interaction.user.username}`);
    client.log('button', interaction);

    if (!client.buttons.has(interaction.customId)) {
      Logger.log('error', `Button '${interaction.customId}' not found.`);
      return;
    }

    const button = client.buttons.get(interaction.customId)!;

    // check permissions
    const { message } = interaction;
    const parentInteraction = message.interaction;

    // if the user is the same as the interaction submitter, he can use the button
    if (parentInteraction && interaction.user.id !== parentInteraction.user.id) {
      Logger.log('debug', `User ${interaction.user.username} tried to use the button '${interaction.customId}' but was reserved to ${parentInteraction.user.username}.`);
      interaction.reply({
        content: String.get('errors_button_reserved', interaction.locale, { keys: { USER: userMention(parentInteraction.user.id) } }),
        ephemeral: true,
      });
      return;
    }

    try {
      button.run(interaction, client);
    } catch (error) {
      Logger.log('error', `An error occurred while executing the button: ${interaction.customId}`, error);
      interaction.reply({
        content: String.get('errors_button_not_responding', interaction.locale),
        ephemeral: true,
      });
    }
  },
} as IEvent;
