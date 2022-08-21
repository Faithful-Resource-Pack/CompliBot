import { Client } from '@client';
import { ModalSubmitInteraction, CacheType } from 'discord.js';

export interface IModal {
  id: string;
  run: (interaction: ModalSubmitInteraction<CacheType>, client?: Client) => Promise<any>;
}
