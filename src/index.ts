import { Intents } from 'discord.js';
import Client from '~/Client';
const client = new Client({
	allowedMentions: { parse: ['users', 'roles'], repliedUser: false }, // remove this line to die instantly ~JackDotJS 2021
	restTimeOffset: 0,
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
}).init();
