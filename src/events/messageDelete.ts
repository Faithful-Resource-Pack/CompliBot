/* eslint-disable @typescript-eslint/no-unused-vars */

import { Event } from '@interfaces';
import { Client, Message, MessageEmbed } from '@client';
import { TextChannel, User } from 'discord.js';
import { colors } from '@helpers/colors';
import { getSubmissionsChannels } from '@helpers/submissionConfig';
import getTeamsIds from '@helpers/teams';

const event: Event = {
  name: 'messageDelete',
  run: async (client: Client, message: Message) => {
    /**
     * ! You cannot fetch deleted data from the API !
     * @see https://discordjs.guide/popular-topics/partials.html
     *
     * -> For message deletions, @this messageDelete will only emit with the ID,
     * which you cannot use to fetch the complete message containing content, author,
     * or other information, as it is already inaccessible by the time you receive the event.
     */

    // if the message has an author object (not partial then) & the author is a bot then return
    if (message.author && message.author.bot) return;

    /**
     * ? Current behavior:
     * - We load the last 6 logs of the guild
     * - We filter the logs to only keep the logs with:
     *   1. The corresponding channel ID
     *   2. The somewhat corresponding message author ID (can't be known if the message is partial)
     *
     * * discord doesn't log the message deletion if the delete author is the same as the author of the message *
     *
     * ! known issue ! (may only happen with partial messages)
     * - if authored A message is deleted, author A is logged as the author of the message
     * - if authored B message is deleted, author B is logged as the author of the message
     * -> but if authored A message is deleted again, author B is logged as the author of the message
     * >> As recent logs stacks together, and as we pick the latest one from that channel
     * >> The gap is ~5 minutes (not tested)
     */

    // get discord audit logs
    const fetchedLogs = await message.guild.fetchAuditLogs({
      limit: 6,
      type: 'MESSAGE_DELETE',
    });

    // not the best approach, but it "kinda" works (see the known issue above)
    const auditEntry = fetchedLogs.entries.find((a) => a.extra.channel.id === message.channelId && (message.partial || a.target.id === message.author.id));

    const executor = auditEntry ? auditEntry.executor ?? 'Unknown User' : message.author;
    const target = auditEntry ? auditEntry.target ?? 'Unknown Target' : message.author;

    // BOT LOG: loose reference to message: create unique instance of the message for the logger (ask @Juknum)
    client.storeAction('message', {
      ...message, author: typeof target === 'string' ? null : target, isDeleted: true, whoDeleted: typeof executor === 'string' ? null : executor,
    } as Message);

    // if the message is in a channel that is not a submission channel && the message is in the faithful team
    if ((client.tokens.dev || getTeamsIds({ name: 'faithful' }).includes(message.guildId)) && !getSubmissionsChannels(client).includes(message.channelId)) {
      const embed = new MessageEmbed()
        .setColor(colors.red)
        .setAuthor({ name: typeof executor === 'string' ? 'Message deleted' : `${executor.tag} deleted a message` })
        .setThumbnail(typeof executor === 'string' ? null : executor.displayAvatarURL({ dynamic: true }))
        .addFields([
          {
            name: 'Server',
            value: message.guild.name,
            inline: true,
          },
          {
            name: 'Channel',
            value: `<#${message.channelId}>`,
            inline: true,
          },
          {
            name: 'Message author',
            value: typeof target === 'string' ? target : `<@${target.id}>`,
            inline: true,
          },
        ])
        .setDescription(`[Jump to location](${message.url})\n`)
        .setTimestamp();

      // if we have the full message object (not partial) we can add the content of it
      if (!message.partial) embed.addField('Message content', message.content.length > 0 ? `\`\`\`${message.content}\`\`\`` : 'No content');
      else embed.setFooter({ text: 'Message was not fully loaded (probably too old: blame discord API)' });

      // get the output channel
      const logChannelId = client.tokens.dev
        ? client.config.discords.filter((d) => d.name === 'dev')[0].channels.moderation
        : client.config.teams.filter((t) => t.name === 'faithful')[0].channels.logs;

      // send the log embed
      const logChannel = client.channels.cache.get(logChannelId) as TextChannel;
      await logChannel.send({ embeds: [embed] });
    }
  },
};

export default event;
