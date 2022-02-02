import Client from "@src/Client";
import { ButtonInteraction } from "discord.js";

interface Execute {
	(client: Client, interaction: ButtonInteraction): void;
}

export interface Button {
	buttonId: string;
	execute: Execute;
}
