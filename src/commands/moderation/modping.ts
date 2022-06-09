import { SlashCommand } from '@interfaces';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { MessageEmbed, TextOptions } from '@client';
import getRolesIds from '@helpers/roles';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('modping')
    .setDescription('Ping all online moderators.')
    .addBooleanOption((option) => option
      .setName('urgent')
      .setDescription("Does it require all moderator's attention? Consequences will be handed for misuse.")
      .setRequired(false)),
  execute: async (interaction: CommandInteraction) => {
    const urgent = interaction.options.getBoolean('urgent') ?? false;

    // get moderators roles ids from the config file
    const moderatorsRolesIds = getRolesIds({ name: ['moderators', 'trial_moderators'], discords: 'all', teams: 'all' });

    // get the corresponding role within the guild where the interaction took place
    const moderatorsRoles = interaction.guild.roles.cache.filter((role) => moderatorsRolesIds.includes(role.id));
    const existingModeratorsRolesIds = interaction.guild.roles.cache.filter((role) => moderatorsRolesIds.includes(role.id)).map((role) => role.id);

    // no moderators role found
    if (moderatorsRoles.size === 0) {
      return interaction.reply({
        content: await interaction.getEphemeralString({ string: 'Command.Modping.NoRole' }),
        ephemeral: true,
      });
    }

    // directly ping the role if 'urgent' is set
    if (urgent) {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
            .setDescription(await interaction.getString({ string: 'Command.Modping.Urgent' })),
        ],
        content: existingModeratorsRolesIds.map((id) => `<@&${id}>`).join(' '),
      });
    }

    // get all users ids from those roles
    const moderatorsIds = moderatorsRoles.map((role) => role.members.map((member) => member.id)).flat();
    const onlineModeratorsIds = [];
    const dndModeratorsIds = [];

    // dispatch moderators ids to their respective status arrays
    moderatorsIds.forEach((moderatorId) => {
      const moderator = interaction.guild.members.cache.get(moderatorId);

      if (moderator?.presence?.status === 'online') onlineModeratorsIds.push(moderatorId);
      else if (moderator?.presence?.status === 'dnd') dndModeratorsIds.push(moderatorId);
      else if (moderator?.presence?.status === 'idle') dndModeratorsIds.push(moderatorId); // idle people are merge into dnd
    });

    // generic response (written to remove duplicated code)
    const genericReply = async (arr: String[], str: TextOptions['string'], user: boolean = true) => interaction.reply({
      content: arr.map((id) => (user ? `<@!${id}>` : `<@&${id}>`)).join(' '),
      embeds: [
        new MessageEmbed()
          .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
          .setDescription(await interaction.getString({
            string: str,
            placeholders: {
              VERB: arr.length > 1 ? await interaction.getString({ string: 'General.Are' }) : await interaction.getString({ string: 'General.Is' }),
              NUMBER: `**${arr.length}**`,
              S: `${arr.length > 1 ? 's' : ''}`,
              IGNORE_MISSING: 'true',
            },
          })),
      ],
    });

    if (onlineModeratorsIds.length > 0) return genericReply(onlineModeratorsIds, 'Command.Modping.Online');
    if (dndModeratorsIds.length > 0) return genericReply(dndModeratorsIds, 'Command.Modping.AfkDnd');

    // if nobody is online/dnd ping roles
    return genericReply(existingModeratorsRolesIds, 'Command.Modping.Offline', false);
  },
};

export default command;
