import { Client } from "@src/Extended Discord";
import { ClientEvents } from "discord.js";

interface CustomEvents extends ClientEvents {
	slashCommandUsed: any;
	buttonUsed: any;
	selectMenuUsed: any;
	/** @deprecated slash commands interaction should be used */
	oldCommandUsed: any;
	textureSubmitted: any;
}

interface Run {
	(client: Client, ...args: any[]);
}

export interface Event {
	name: keyof CustomEvents;
	run: Run;
}
