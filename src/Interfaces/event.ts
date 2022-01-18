import Client from '@src/Client';
import { ClientEvents } from 'discord.js';

interface Run {
	(client: Client, ...args: any[]);
}

export interface Event {
	name: keyof ClientEvents;
	run: Run;
}
