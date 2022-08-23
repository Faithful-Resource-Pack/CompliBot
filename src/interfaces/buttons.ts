import { Client } from '@client';
import { ButtonInteraction, CacheType } from 'discord.js';

export interface IButton {
  id: string;
  run: (interaction: ButtonInteraction<CacheType>, client?: Client) => Promise<any>;
}
