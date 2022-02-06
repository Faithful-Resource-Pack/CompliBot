import { Client, Message } from "@src/Extended Discord";
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
