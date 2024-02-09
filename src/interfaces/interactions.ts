import {
	SlashCommandSubcommandsOnlyBuilder,
	SlashCommandBuilder,
	Collection,
	CacheType,
} from "discord.js";
import {
	Client,
	ChatInputCommandInteraction,
	ButtonInteraction,
	ModalSubmitInteraction,
	StringSelectMenuInteraction,
} from "@client";

export type AnyInteraction<Cached extends CacheType = CacheType> =
	| ChatInputCommandInteraction<Cached>
	| ButtonInteraction<Cached>
	| ModalSubmitInteraction<Cached>
	| StringSelectMenuInteraction<Cached>;

export interface SlashCommand {
	servers?: string[];
	data: SyncSlashCommandBuilder | AsyncSlashCommandBuilder;
	execute: Collection<string, SlashCommandI> | SlashCommandI;
}

export type SlashCommandI = (interaction: ChatInputCommandInteraction) => Promise<any>;

export type SyncSlashCommandBuilder =
	| SlashCommandSubcommandsOnlyBuilder
	| Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;

/** Used for generating dynamic properties (e.g. /missing version list) */
export type AsyncSlashCommandBuilder = (client: Client) => Promise<SyncSlashCommandBuilder>;
