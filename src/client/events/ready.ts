import { ActivityType } from 'discord.js';
import { IEvent } from '@interfaces';
import { Logger } from '@utils';
import { Client } from '@client';

export default {
  id: 'ready',
  run: (client: Client) => {
    Logger.log('info', 'Client is ready!');
    client.user?.setActivity('with the bot!', { type: ActivityType.Playing });
  },
} as IEvent;
