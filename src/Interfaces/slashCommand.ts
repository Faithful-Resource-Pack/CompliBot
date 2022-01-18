import { Collection, Interaction } from 'discord.js';
import { SlashCommandBuilder } from "@discordjs/builders";
import Client from '@src/Client';

export interface SlashCommand {
  data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup" | any>,
  execute: Collection<string, SlashCommandI> | SlashCommandI;
}

export interface SlashCommandI {
  (interaction: Interaction, client?: Client): void;
}