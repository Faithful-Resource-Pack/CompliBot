import '@overrides';

import { Client } from '@client';
import { Logger } from '@utils';
import { GatewayIntentBits } from 'discord.js';

export default function main() {
  Logger.printHeader();
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  client.start();
}

main();
