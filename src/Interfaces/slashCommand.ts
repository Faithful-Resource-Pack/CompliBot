import { Interaction } from 'discord.js';
import { SlashCommandBuilder } from "@discordjs/builders";
import Client from '~/Client';

export interface SlashCommand {
  dev?: boolean,
  data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">,
  execute(interaction: Interaction, client?: Client): void
}
