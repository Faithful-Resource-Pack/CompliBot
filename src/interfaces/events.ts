import { Client } from "@client";
import { ClientEvents } from "discord.js";

interface AllEvents extends ClientEvents {
	slashCommandUsed: string;
	buttonUsed: string;
	selectMenuUsed: string;
	modalSubmit: string;
	autocomplete: string;
}

export interface Event {
	name: keyof AllEvents;
	execute: EventExecute;
}

export type EventExecute = (client: Client<true>, ...args: any[]) => Promise<any>;
