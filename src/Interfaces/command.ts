import Client from '~/Client';
import Message from '~/Client/message';

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
