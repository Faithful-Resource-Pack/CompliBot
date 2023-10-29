import { Client } from "@client";
import { ClientEvents } from "discord.js";

interface AllEvents extends ClientEvents {
	slashCommandUsed: string;
	buttonUsed: string;
	selectMenuUsed: string;
	modalSubmit: string;
}

interface Execute {
	(client: Client, ...args: any[]);
}

export interface Event {
	name: keyof AllEvents;
	execute: Execute;
}
