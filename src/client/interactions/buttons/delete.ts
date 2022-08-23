import { Emojis } from '@enums';
import { ButtonBuilder, ButtonStyle } from 'discord.js';

export const buttonDelete = new ButtonBuilder()
  .setDisabled(true)
  .setCustomId('delete')
  .setStyle(ButtonStyle.Danger)
  .setEmoji(Emojis.delete);

export interface IButton {}

export default {} as IButton;
