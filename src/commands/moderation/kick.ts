import { SlashCommand } from '@interfaces';
import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CommandInteraction, Guild, GuildMember, TextChannel,
} from 'discord.js';
import { Client, Message, MessageEmbed } from '@client';
import { colors } from '@helpers/colors';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server.')
    .addUserOption((option) => option.setName('user').setDescription('User you want to kick.').setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription('The reason behind the kick.')),
  execute: async (interaction: CommandInteraction) => {
    if (
      await interaction.perms({
        type: 'mod',
      })
    ) return;

    const reason: string = interaction.options.getString('reason');
    const guild = await interaction.client.guilds.fetch(interaction.guildId);
    const user = await guild.members.fetch(interaction.options.getUser('user').id);

    // check for team guilds & apply the kick to all teamed guilds
    // if there is no "team", only apply to the guild were the command is made
    let guildsToKick: Array<string> = [];
    const { team } = (interaction.client as Client).config.discords.filter((d) => d.id === interaction.guildId)[0];

    if (team) guildsToKick = (interaction.client as Client).config.discords.filter((d) => d.team === team).map((d) => d.id);
    else guildsToKick = [(interaction.client as Client).config.discords.filter((d) => d.id === interaction.guildId)[0].id];

    // test if user can be kicked (check for permissions)
    if (!user.kickable) {
      interaction.reply({
        content: 'An error occurred:\n> Can\'t kick people above the bot!',
        ephemeral: true,
      });
      return;
    }

    guildsToKick.forEach(async (guildId: string) => {
      let currentGuild: Guild;
      let member: GuildMember;

      try {
        currentGuild = await interaction.client.guilds.fetch(guildId);
        member = await currentGuild.members.fetch(user.id);
      } catch {
        return;
      }

      await member.kick(reason);
    });

    const embed: MessageEmbed = new MessageEmbed()
      .setTitle(`${user.displayName} has been kicked.`)
      .setColor(colors.black)
      .addFields([
        {
          name: 'User',
          value: `<@!${user.id}>`,
        },
        {
          name: 'Reason',
          value: reason || 'No reason given.',
          inline: true,
        },
      ]);

    await interaction.reply({
      content: '\u200B',
    });
    await interaction.deleteReply();
    const message: Message = (await interaction.channel.send({
      embeds: [embed],
    })) as any;

    // construct logs
    const logEmbed: MessageEmbed = new MessageEmbed()
      .setTitle('Kicked someone')
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.avatarURL({
          dynamic: true,
        }),
      })
      .setColor(colors.red)
      .addFields([
        {
          name: 'Server',
          value: `\`${interaction.guild.name}\``,
          inline: true,
        },
        {
          name: 'Channel',
          value: `${interaction.channel}`,
          inline: true,
        },
        {
          name: 'Message',
          value: `[Jump to message](${message.url})`,
          inline: true,
        },
        {
          name: 'User',
          value: `<@!${user.id}>`,
          inline: true,
        },
        {
          name: 'Reason',
          value: reason || 'No reason given.',
          inline: true,
        },
      ])
      .setTimestamp();

    // send log into the addressed logs channel
    let logChannel: TextChannel;
    try {
      if (team) {
        logChannel = (await interaction.client.channels.fetch(
          (interaction.client as Client).config.teams.filter((t) => t.name === team)[0].channels.moderation,
        )) as any;
      } else {
        logChannel = (await interaction.client.channels.fetch(
          (interaction.client as Client).config.discords.filter((d) => d.id === interaction.guildId)[0].channels
            .moderation,
        )) as any;
      }
      logChannel.send({
        embeds: [logEmbed],
      });
    } catch {
      // can't fetch log channel;
    }
  },
};

export default command;
