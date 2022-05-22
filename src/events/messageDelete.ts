/* eslint-disable @typescript-eslint/no-unused-vars */

import { Event } from '@interfaces';
import { Client, Message, MessageEmbed } from '@client';
import { TextChannel } from 'discord.js';
import { colors } from '@helpers/colors';
import { getSubmissionsChannels } from '@helpers/channels';
import getTeamsIds from '@helpers/teams';

const event: Event = {
  name: 'messageDelete',
  run: async (client: Client, message: Message) => {
    //! do not remove, 'force' message to be casted (break if removed)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const _ = (message as Message) instanceof Message;

    // loose reference to message: create unique instance of the message for the logger (ask @Juknum)
    client.storeAction('message', { ...message, author: message.author, isDeleted: true } as Message);

    if (message.author && message.author.bot) return;

    if (
      (client.tokens.dev
        || getTeamsIds({
          name: 'faithful',
        }).includes(message.guild.id))
      && !getSubmissionsChannels(client).includes(message.channelId)
    ) {
      const embed = new MessageEmbed()
        .setAuthor({
          name: `${message.author.tag} deleted a message`,
        })
        .setColor(colors.red)
        .setThumbnail(
          message.author.displayAvatarURL({
            dynamic: true,
          }),
        )
        .addFields([
          {
            name: 'Server',
            value: message.guild.name,
            inline: true,
          },
          {
            name: 'Channel',
            value: `<#${message.channel.id}>`,
            inline: true,
          },
          {
            name: 'Message Content',
            value: `\`\`\`${message.content.replaceAll('```', "'''")}\`\`\``,
          },
        ])
        .setDescription(`[Jump to location](${message.url})\n`)
        .setTimestamp();

      const logChannelId = client.tokens.dev
        ? client.config.discords.filter((d) => d.name === 'dev')[0].channels.moderation
        : client.config.teams.filter((t) => t.name === 'faithful')[0].channels.logs;

      const logChannel = client.channels.cache.get(logChannelId) as TextChannel;
      await logChannel.send({
        embeds: [embed],
      });
    }
  },
};

export default event;
