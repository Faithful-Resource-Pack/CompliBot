import { SlashCommandSubcommandsOnlyBuilder, SlashCommandBuilder, Collection } from "discord.js";
import {
	Client,
	ChatInputCommandInteraction,
	ButtonInteraction,
	ModalSubmitInteraction,
	StringSelectMenuInteraction,
} from "@client";

export type AnyInteraction =
	| ChatInputCommandInteraction
	| ButtonInteraction
	| ModalSubmitInteraction
	| StringSelectMenuInteraction;

export interface SlashCommand {
	servers?: string[];
	data: SyncSlashCommandBuilder | AsyncSlashCommandBuilder;
	execute: Collection<string, SlashCommandI> | SlashCommandI;
}

export type SlashCommandI = (interaction: ChatInputCommandInteraction) => any;

export type SyncSlashCommandBuilder =
	| SlashCommandSubcommandsOnlyBuilder
	| Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;

/** Used for generating dynamic properties (e.g. /missing version list) */
export type AsyncSlashCommandBuilder = (client: Client) => Promise<SyncSlashCommandBuilder>;
