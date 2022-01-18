import Client from '@src/Client';
import Message from '@src/Client/message';

interface Run {
	(client: Client, message: Message, args: string[]);
}

export interface Command {
	name: string;
	description: string;
	usage: string[];
	aliases?: string[];
	run: Run;
}
