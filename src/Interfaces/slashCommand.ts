import { Collection, Interaction } from "discord.js";
import { SlashCommandSubcommandsOnlyBuilder, SlashCommandBuilder } from "@discordjs/builders";
import { Client } from "@src/Extended Discord";

export interface SlashCommand {
	permissions?: Permissions | undefined;
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

/**
 * important: When using permissions, please do ".setDefaultPermission(false)" to the slash command builder!
 * otherwise the command will stay available for everybody else
 */
export interface Permissions {
	roles?: Array<string> | undefined;
	users?: Array<string> | undefined;
}
