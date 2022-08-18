import '@overrides';

import { Client } from '@client';
import { Logger } from '@utils';
import { GatewayIntentBits } from 'discord.js';

/**
 * Start the client & load all the modules.
 */
export default function main() {
  Logger.printHeader();
  const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent] });
  client.start();
}

main();
