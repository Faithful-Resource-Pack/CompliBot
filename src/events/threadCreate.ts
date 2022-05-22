import { ThreadChannel } from 'discord.js';
import { Client } from '@client';
import { Event } from '@interfaces';

const event: Event = {
  name: 'threadCreate',
  run: async (client: Client, thread: ThreadChannel) => {
    if (thread.joinable) await thread.join().catch(console.error);
  },
};

export default event;
