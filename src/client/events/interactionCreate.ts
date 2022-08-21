import { Client } from '@client';
import { IEvent } from '@interfaces';
import { Interaction } from 'discord.js';

export default {
  id: 'interactionCreate',
  run: async (client: Client, interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      client.emit('chatInputCommandCreate', (client as Client, interaction));
    }

    if (interaction.isModalSubmit()) {
      client.emit('modalSubmitCreate', (client as Client, interaction));
    }

    return Promise.resolve();
  },
} as IEvent;
