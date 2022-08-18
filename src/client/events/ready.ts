import { ActivityType } from 'discord.js';
import { IEvent } from '@interfaces';
import { Logger } from '@utils';
import { Client } from '@client';

export default {
  name: 'ready',
  run: async (client: Client) => {
    Logger.log('info', 'Client is ready!', false);
    client.user?.setActivity('with the bot!', { type: ActivityType.Playing });
  },
} as IEvent;
