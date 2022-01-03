import { Intents } from 'discord.js';
import Client from './Client';
import ExtendedMessage from './Client/message';

const client = new Client({
	allowedMentions: { parse: ['users', 'roles'], repliedUser: false }, // remove this line to die instantly ~JackDotJS 2021
	restTimeOffset: 0,
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
}).init();
