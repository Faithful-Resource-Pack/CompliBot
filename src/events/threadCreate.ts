import { ThreadChannel } from 'discord.js';
import { Client } from '@client';
import { Event } from '@interfaces';

export const event: Event = {
  name: 'threadCreate',
  run: async (client: Client, thread: ThreadChannel) => {
    if (thread.joinable) await thread.join().catch(console.error);
  },
};
