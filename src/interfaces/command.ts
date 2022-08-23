import { ChatInputCommandInteraction } from '@overrides';
import { Collection } from 'discord.js';
import { SlashCommandSubcommandsOnlyBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { Client } from '@client';

export interface ICommand {
  config: { (): ICommandConfig };
  data: (TSyncData | IAsyncData) | (() => TSyncData | IAsyncData);
  handler: Collection<string, IHandler> | IHandler;
}

export type TSyncData = SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
export interface IAsyncData { (...args: any): Promise<TSyncData>; }

export interface IHandler { (interaction: ChatInputCommandInteraction, client: Client): void | Promise<void>; }

export interface ICommandConfig {
  devOnly?: boolean; // If true, only developers server can use this command.

  whitelisted?: ICommandPermissions; // If defined, only users with the given permissions can use this command.
  blacklisted?: ICommandPermissions; // If defined, only users without the given permissions can use this command.
}

export interface ICommandPermissions {
  // where the key is the guild id
  [key: string]: {
    roles?: Array<string>;
    users?: Array<string>;
    channels?: Array<string>;
  };
}

export interface ICommandsUses {
  [key: string]: {
    global: number;
    guilds: { [key: string]: number };
  }
}
