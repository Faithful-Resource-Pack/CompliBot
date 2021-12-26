import { ColorResolvable } from 'discord.js';

export interface Config {
	colors: { [name: string]: ColorResolvable };
	token: string;
	prefix: string;
}
