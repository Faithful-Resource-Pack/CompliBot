import Client from '~/Client';
import ExtendedMessage from '~/Client/message';

interface Run {
	(client: Client, message: ExtendedMessage, args: string[]);
}

export interface Command {
	name: string;
	description: string;
	usage: string[];
	aliases?: string[];
	run: Run;
}
