import { SlashCommand } from '@interfaces';
import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CommandInteraction, GuildMember, Message, User,
} from 'discord.js';
import { MessageEmbed } from '@client';
import getRolesIds from '@helpers/roles';
import moment from 'moment';

const command: SlashCommand = {
  permissions: {
    roles: getRolesIds({
      name: ['moderators', 'trial_moderators'],
      discords: 'all',
      teams: 'all',
    }),
  },
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get detailed information on a specified user.')
    .addUserOption((option) => option.setName('user').setDescription('The User to get information of.').setRequired(true)),
  execute: async (interaction: CommandInteraction) => {
    if (
      await interaction.perms({
        type: 'mod',
      })
    ) return;

    const user = interaction.options.getUser('user') as User;
    const guildUser = interaction.guild.members.cache.get(user.id) as GuildMember;

    const embed = new MessageEmbed()
      .setAuthor({
        name: user.username,
        iconURL: user.avatarURL({
          dynamic: true,
        }),
      })
      .setThumbnail(
        user.avatarURL({
          dynamic: true,
        }),
      )
      .addFields(
        {
          name: 'Name & Tag',
          value: user.tag,
          inline: true,
        },
        {
          name: 'Nickname',
          value: guildUser.nickname ? guildUser.nickname : 'none',
          inline: true,
        },
        {
          name: 'ID',
          value: user.id,
          inline: true,
        },
        {
          name: 'Status',
          value: guildUser.presence?.status ? guildUser.presence?.status : 'offline',
          inline: true,
        },
        {
          name: 'Joined at',
          value: `<t:${moment(guildUser.joinedAt).utc().unix()}>\n<t:${moment(guildUser.joinedAt).utc().unix()}:R>`,
          inline: true,
        },
        {
          name: 'Created at',
          value: `<t:${moment(user.createdTimestamp).utc().unix()}>\n<t:${moment(user.createdTimestamp)
            .utc()
            .unix()}:R>`,
          inline: true,
        },
        {
          name: 'Boost status',
          value: guildUser.premiumSince
            ? `Since <t:${moment(guildUser.premiumSince).utc().unix()}>\n<t:${moment(guildUser.premiumSince)
              .utc()
              .unix()}:R>`
            : 'Not boosting',
          inline: true,
        },
        {
          name: 'Warns',
          value: 'no clue',
          inline: true,
        },
        {
          name: 'Notes',
          value: 'no clue',
          inline: true,
        },
      );
    interaction
      .reply({
        embeds: [embed],
        fetchReply: true,
      })
      .then((message: Message) => message.deleteButton());
  },
};

export default command;
