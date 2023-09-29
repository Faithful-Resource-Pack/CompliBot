import {
	SlashCommandSubcommandsOnlyBuilder,
	SlashCommandBuilder,
	Collection,
	Interaction,
} from "discord.js";
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

/**
 * used for generating dynamic properties (e.g. /missing version list)
 */
export interface AsyncSlashCommandBuilder {
	(...args: any): Promise<SyncSlashCommandBuilder>;
}
export interface SlashCommandI {
	(interaction: Interaction, client?: Client): void;
}
