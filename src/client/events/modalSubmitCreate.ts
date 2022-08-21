import { IEvent } from '@interfaces';
import { Client } from '@client';
import { Logger, Strings } from '@utils';
import {
  ModalSubmitInteraction,
  CacheType,
} from 'discord.js';

export default {
  id: 'modalSubmitCreate',
  run: async (client: Client, interaction: ModalSubmitInteraction<CacheType>) => {
    Logger.log('debug', `Modal submitted ${interaction.customId} used by ${interaction.user.username}`);
    client.log('modal', interaction);

    if (!client.modals.has(interaction.customId)) {
      Logger.log('error', `Modal ${interaction.customId} not found.`);
      return;
    }

    const modal = client.modals.get(interaction.customId)!;

    try {
      modal.run(interaction, client);
    } catch (error) {
      Logger.log('error', `An error occurred while executing the modal: ${interaction.customId}`, error);
      interaction.reply({
        content: Strings.get('errors_modal_not_responding', interaction.locale),
        ephemeral: true,
      });
    }
  },
} as IEvent;
