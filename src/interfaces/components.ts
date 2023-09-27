import { SlashCommandSubcommandsOnlyBuilder, SlashCommandBuilder, ButtonInteraction, Collection, Interaction, StringSelectMenuInteraction } from "discord.js";
import { Client } from "@client";

// slash commands

export interface SlashCommand {
	servers?: string[];
	data: SyncSlashCommandBuilder | AsyncSlashCommandBuilder;
	execute: Collection<string, SlashCommandI> | SlashCommandI;
}

export type SyncSlashCommandBuilder =
	| SlashCommandSubcommandsOnlyBuilder
	| Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;

export interface AsyncSlashCommandBuilder {
	(...args: any): Promise<SyncSlashCommandBuilder>;
}
export interface SlashCommandI {
	(interaction: Interaction, client?: Client): void;
}

// same interface is used for buttons, select menus, modals, etc so they can be added to the bot much more easily

export interface Component {
	id: string;
	execute: ComponentExecute;
}

export interface ComponentExecute {
	(client: Client, interaction: ButtonInteraction): void;
}