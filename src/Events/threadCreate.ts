import { ThreadChannel } from 'discord.js';
import Client from '~/Client';
import { Event } from '~/Interfaces';

export const event: Event = {
  name: 'threadCreate',
  run: async (client: Client, thread: ThreadChannel) => {
    if (thread.joinable) await thread.join().catch(console.error);
  }
}; 