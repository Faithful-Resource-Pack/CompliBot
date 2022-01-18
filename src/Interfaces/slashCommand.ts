import { Collection, Interaction } from 'discord.js';
import { SlashCommandBuilder } from "@discordjs/builders";
import Client from '@src/Client';

export interface SlashCommand {
  permissions: Permissions | undefined;
  data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup" | any>;
  execute: Collection<string, SlashCommandI> | SlashCommandI;
}

export interface SlashCommandI {
  (interaction: Interaction, client?: Client): void;
}

/**
 * important: When using permissions, please do ".setDefaultPermission(false)" to the slash command builder!
 * otherwise the command will stay available for everybody else
 */
export interface Permissions {
  roles: Array<string> | undefined;
  users: Array<string> | undefined;
}