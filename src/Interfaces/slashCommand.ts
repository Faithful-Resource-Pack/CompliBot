import { Interaction } from 'discord.js';
import { SlashCommandBuilder } from "@discordjs/builders";
import Client from '~/Client';

export interface SlashCommand {
  dev?: boolean,
  data: SlashCommandBuilder,
  execute(interaction: Interaction, client?: Client): void
}
