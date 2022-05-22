import { SlashCommand } from '@interfaces';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { MessageEmbed } from '@client';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('modping')
    .setDescription('Ping all online moderators.')
    .addBooleanOption((option) => option
      .setName('urgent')
      .setDescription("Does it require all moderator's attention? Consequences will be handed for misuse.")
      .setRequired(false)),
  execute: async (interaction: CommandInteraction) => {
    const urgent = interaction.options.getBoolean('urgent');
    let modRole = interaction.guild.roles.cache.find((role) => role.name.toLocaleLowerCase().includes('mod'));

    // sorts by role hierarchy
    interaction.guild.roles.cache
      .filter((role) => role.name.toLocaleLowerCase().includes('mod'))
      .forEach((role) => {
        if (role.id === modRole.id) return false;
        if (role.position > modRole.position) {
          modRole = role;
          return true;
        }
        return false;
      });

    if (modRole === undefined) {
      return interaction.reply({
        content: await interaction.getEphemeralString({
          string: 'Command.Modping.NoRole',
        }),
        ephemeral: true,
      });
    }

    const moderatorIDs = modRole.members.map((member) => member.user.id);
    const embed = new MessageEmbed().setAuthor({
      name: interaction.user.tag,
      iconURL: interaction.user.avatarURL(),
    });

    if (urgent) {
      embed.setDescription(
        await interaction.getEphemeralString({
          string: 'Command.Modping.Urgent',
        }),
      );
      return interaction.reply({
        embeds: [embed],
        content: `<@&${modRole.id}>`,
      });
    }

    if (moderatorIDs.length > 0) {
      const onlineModIDs: string[] = [];
      const dndModIDs: string[] = [];

      moderatorIDs.forEach((id) => {
        const mod = interaction.guild.members.cache.get(id);
        const status = mod.presence ? mod.presence.status : 'offline';

        if (status !== 'offline') {
          switch (status) {
            case 'dnd':
            case 'idle':
              dndModIDs.push(`<@!${id}>`);
              break;
            case 'online':
            default:
              onlineModIDs.push(`<@!${id}>`);
              break;
          }
        }
      });
      if (onlineModIDs.length > 0) {
        embed.setDescription(
          await interaction.getEphemeralString({
            string: 'Command.Modping.Online',
            placeholders: {
              NUMBER: `${
                moderatorIDs.length === 1
                  ? await interaction.getEphemeralString({
                    string: 'General.Is',
                  })
                  : await interaction.getEphemeralString({
                    string: 'General.Are',
                  })
              } **${onlineModIDs.length}**`,
            },
          }),
        );
        return interaction.reply({
          embeds: [embed],
          content: onlineModIDs.join(', '),
        });
      }
      if (dndModIDs.length > 0) {
        embed.setDescription(
          await interaction.getEphemeralString({
            string: 'Command.Modping.AfkDnd',
            placeholders: {
              NUMBER: `${
                moderatorIDs.length === 1
                  ? await interaction.getEphemeralString({
                    string: 'General.Is',
                  })
                  : await interaction.getEphemeralString({
                    string: 'General.Are',
                  })
              } **${moderatorIDs.length}**`,
            },
          }),
        );
        return interaction.reply({
          embeds: [embed],
          content: dndModIDs.join(', '),
        });
      }
      if (dndModIDs.length + onlineModIDs.length === 0) {
        embed.setDescription(
          await interaction.getEphemeralString({
            string: 'Command.Modping.Offline',
          }),
        );
        return interaction.reply({
          embeds: [embed],
          content: `<@&${modRole.id}>`,
        });
      }
    }
    // if no one has the role somehow lol
    embed.setDescription(
      await interaction.getEphemeralString({
        string: 'Command.Modping.Offline',
      }),
    );
    return interaction.reply({
      embeds: [embed],
      content: `<@&${modRole.id}>`,
    });
  },
};

export default command;
