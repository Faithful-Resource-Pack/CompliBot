import { Client } from "@client";
import { StringSelectMenuInteraction } from "discord.js";

interface Execute {
	(client: Client, interaction: StringSelectMenuInteraction): void;
}

export interface SelectMenu {
	selectMenuId: string;
	execute: Execute;
}
