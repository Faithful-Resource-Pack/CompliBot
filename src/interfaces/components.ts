import { Interaction } from "discord.js";
import { Client } from "@client";

// same interface is used for buttons, select menus, modals, etc so they can be added to the bot much more easily

export interface Component {
	id: string;
	execute: ComponentExecute;
}

export interface ComponentExecute {
	(client: Client, interaction: Interaction): void;
}
