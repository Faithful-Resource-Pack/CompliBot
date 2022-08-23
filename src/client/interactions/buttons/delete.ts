import { Emojis } from '@enums';
import { IButton } from '@interfaces';
import { Logger } from '@utils';
import {
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
} from 'discord.js';

export const buttonDelete = new ButtonBuilder()
  .setCustomId('delete')
  .setStyle(ButtonStyle.Danger)
  .setEmoji(Emojis.delete);

export default {
  id: 'delete',
  run: async (interaction: ButtonInteraction) => {
    try {
      await interaction.message.delete();
    } catch (error) {
      Logger.log('error', 'An error occurred while deleting the message.', error);
      interaction.reply({
        content: String.get('errors_button_not_responding', interaction.locale),
        ephemeral: true,
      });
    }
  },
} as IButton;
