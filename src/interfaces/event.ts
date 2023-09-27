import { Client } from "@client";
import { ClientEvents } from "discord.js";

interface AllEvents extends ClientEvents {
	slashCommandUsed: any;
	buttonUsed: any;
	selectMenuUsed: any;
}

interface Execute {
	(client: Client, ...args: any[]);
}

export interface Event {
	name: keyof AllEvents;
	execute: Execute;
}
