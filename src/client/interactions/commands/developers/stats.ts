import { Client } from '@client';
import { ICommand, IHandler } from '@interfaces';
import { EmbedBuilder } from '@overrides';
import {
  getCommandsNames,
  getCommandsUses,
  getCommandsUsesOrdered,
  getCommandUses,
  Images,
} from '@utils';
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  CacheType,
  Collection,
  time,
  TimestampStyles,
  version,
} from 'discord.js';

import { releaseInfo } from 'linux-release-info';

export default {
  config: () => ({
    ...JSON.configLoad('commands/stats.json'),
  }),
  data: () => {
    const commands = getCommandsNames();

    return new SlashCommandBuilder()
      .setName(String.get('stats_command_name'))
      .setDescription(String.get('stats_command_description'))

      // stats bot
      .addSubcommand((subcommand) => subcommand
        .setName(String.get('stats_subcommand_bot_name'))
        .setDescription(String.get('stats_subcommand_bot_description')))

      // stats commands [command]
      .addSubcommand((subcommand) => subcommand
        .setName(String.get('stats_subcommand_commands_name'))
        .setDescription(String.get('stats_subcommand_commands_description'))
        .addStringOption((option) => option
          .setName(String.get('stats_subcommand_commands_argument_name'))
          .setDescription(String.get('stats_subcommand_commands_argument_description'))
          .addChoices(...commands)
          .setRequired(false)));
  },
  handler: new Collection<string, IHandler>()
    .set(String.get('stats_subcommand_bot_name'), (interaction: ChatInputCommandInteraction<CacheType>, client: Client) => {
      const commandsUsed = getCommandsUses();
      const osInfo: { type: string, arch: string } = releaseInfo({ mode: 'sync' }) as any;
      const membersCount = client.guilds.cache.mapValues((guild) => guild.memberCount).reduce((a, b) => a + b, 0);

      const titles = String.get('stats_subcommand_bot_embed_fields_titles', interaction.locale);
      const embed = new EmbedBuilder()
        .setTitle(`${client.user?.username} ${String.get('stats_command_name', interaction.locale)}`)
        .setThumbnail(client.user?.displayAvatarURL() ?? null)
        .setFooter({ text: String.get('stats_subcommand_bot_embed_footer'), iconURL: Images.get('bot/heart.png') })
        .addFields(
          {
            name: titles[0],
            value: time(new Date(Date.now() + client.uptime!), TimestampStyles.ShortDateTime),
            inline: true,
          },
          {
            name: titles[1],
            value: client.guilds.cache.size.toString(),
            inline: true,
          },
          {
            name: titles[2],
            value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
            inline: true,
          },
          {
            name: titles[3],
            value: `discord.js ${version}`,
            inline: true,
          },
          {
            name: titles[4],
            value: `${process.version}`,
            inline: true,
          },
          {
            name: titles[5],
            value: `${client.commands.size}`,
            inline: true,
          },
          {
            name: titles[6],
            value: `${commandsUsed.global}`,
            inline: true,
          },
          {
            name: titles[7],
            value: `${membersCount}`,
            inline: true,
          },
          {
            name: titles[8],
            value: `${osInfo.type} ${osInfo.arch}`,
            inline: true,
          },
        );

      interaction.reply({ embeds: [embed], ephemeral: true });
    })
    .set(String.get('stats_subcommand_commands_name'), (interaction: ChatInputCommandInteraction<CacheType>) => {
      const command = interaction.options.getString(String.get('stats_subcommand_commands_argument_name'));

      if (command !== null) {
        const uses = getCommandUses(command, interaction.guildId ?? undefined);
        const embed = new EmbedBuilder()
          .setTimestamp()
          .addFields(
            {
              name: String.get('stats_subcommand_commands_embed_field_1', interaction.locale),
              value: uses.global.toString(),
              inline: true,
            },
            {
              name: String.get('stats_subcommand_commands_embed_field_2', interaction.locale),
              value: uses.guild?.toString() ?? '0',
              inline: true,
            },
          )
          .setTitle(String.get('stats_subcommand_commands_embed_title', interaction.locale, {
            keys: {
              COMMAND: command,
            },
          }));

        interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      const uses = getCommandsUsesOrdered(interaction.guildId ?? undefined);
      const digits: number = uses[0].uses.global.toString().length;

      const embed = new EmbedBuilder()
        .setTimestamp()
        .setTitle(String.get('stats_subcommand_commands_embed_title_top10', interaction.locale))
        .setDescription(`${
          String.get('stats_subcommand_commands_embed_description_top10', interaction.locale, { keys: { GUILD: interaction.guild?.name ?? '' } })}\n${uses
          .slice(0, 10)
          .map((stat, index) => {
            const place = `${index + 1 < 10 ? ` ${index + 1}` : index + 1}.`;
            const name = stat.name.padEnd(20, ' ');
            const global = stat.uses.global.toString().padStart(digits, ' ');
            const guild = stat.uses.guild?.toString().padStart(digits, ' ') ?? '0'.padStart(digits, ' ');

            return `\`${place}\` \`/${name}\` - \`${global}\` - \`${guild}\``;
          })
          .join('\n')}`);

      interaction.reply({ embeds: [embed], ephemeral: true });
    }),
} as ICommand;
