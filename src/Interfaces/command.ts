import { Message } from 'discord.js';
import Client from '../Client';

interface Run {
	(client: Client, message: Message, args: string[]);
}

export interface Command {
	name: string;
	description: string;
	usage: string;
	aliases?: string[];
	run: Run;
}
