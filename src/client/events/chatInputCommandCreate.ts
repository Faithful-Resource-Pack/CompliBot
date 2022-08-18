import { Client } from '@client';
import { IHandler, IEvent } from '@interfaces';
import { Logger, checkPermissions, Strings } from '@utils';

import {
  Collection, ChatInputCommandInteraction, CacheType, GuildMemberRoleManager,
} from 'discord.js';

export default {
  name: 'chatInputCommandCreate',
  run: async (client: Client, interaction: ChatInputCommandInteraction<CacheType>) => {
    Logger.log('debug', `(/) command '${interaction.commandName}' used by ${interaction.user.username}`);

    if (!client.commands.has(interaction.commandName)) {
      Promise.reject(new Error(`Command ${interaction.commandName} not found.`));
      return;
    }

    const command = client.commands.get(interaction.commandName)!;
    const config = command.config();

    try {
      await checkPermissions(
        config,
        interaction.guild!.id,
        interaction.user.id,
        interaction.channel!.id,
        interaction.member!.roles as GuildMemberRoleManager,
        interaction.locale,
      );
    } catch (error) {
      interaction.reply({
        content: `${(error as Error).message}`,
        ephemeral: true,
      });
      return;
    }

    try {
    // test if there is a subcommand
      const subcommandName = interaction.options.getSubcommand();
      // if there is a subcommand, find it & run the subcommand
      const subcommand = (command!.handler as Collection<string, IHandler>).get(subcommandName);
      if (subcommand) subcommand(interaction, client);
    } catch {
      // not a subcommand, run the command
      try {
        (command!.handler as IHandler)(interaction, client);
      } catch (error) {
        Logger.log('error', `An error occurred while executing the (/) command: ${interaction.commandName}`, error);
        interaction.reply({
          content: Strings.get('errors_slash_command_not_responding', interaction.locale),
          ephemeral: true,
        });
      }
    }
  },

} as IEvent;
