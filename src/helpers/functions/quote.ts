import { Message, MessageEmbed } from '@client';
import { TextChannel } from 'discord.js';

export default async function quote(message: Message) {
  const embed = new MessageEmbed();

  /**
   * Will match following Discord links:
   * https://discord.com/channels/{guildID}/{channelID}/{messageID}
   * https://discordapp.com/channels/{guildID}/{channelID}/{messageID}
   * https://canary.discord.com/channels/{guildID}/{channelID}/{messageID}
   * https://canary.discordapp.com/channels/{guildID}/{channelID}/{messageID}
   * https://ptb.discord.com/channels/{guildID}/{channelID}/{messageID}
   * https://ptb.discordapp.com/channels/{guildID}/{channelID}/{messageID}
   */
  const matches = /https:\/\/(canary\.|ptb\.)?discord(app)?\.com\/channels\/([0-9]+)\/([0-9]+)\/([0-9]+)/g.exec(
    message.content,
  );

  if (matches === null) return;

  const ids = [matches[3], matches[4], matches[5]];

  let channel: TextChannel;
  let quotedMsg: Message;
  try {
    channel = (await message.guild.channels.fetch(ids[1])) as TextChannel;
    quotedMsg = await channel.messages.fetch(ids[2]);
  } catch {
    return; // can't fetch channel or quotedMsg : abort mission
  }

  if (quotedMsg.embeds[0] !== undefined) {
    embed.setAuthor({
      name: `Embed sent by ${quotedMsg.author.tag}`,
      iconURL: 'https://database.faithfulpack.net/images/bot/quote.png',
    });

    if (quotedMsg.embeds[0].title !== undefined) embed.setTitle(quotedMsg.embeds[0].title);
    if (quotedMsg.embeds[0].url !== undefined) embed.setURL(quotedMsg.embeds[0].url);
    if (quotedMsg.embeds[0].description !== undefined) embed.setDescription(quotedMsg.embeds[0].description);
    if (quotedMsg.embeds[0].image !== undefined) embed.setImage(quotedMsg.embeds[0].image.url);
    if (quotedMsg.embeds[0].fields !== undefined) embed.addFields(quotedMsg.embeds[0].fields);

    if (quotedMsg.embeds[0].thumbnail !== undefined) {
      embed.setThumbnail(quotedMsg.embeds[0].thumbnail.url);
      embed.setAuthor({
        name: `Embed sent by ${quotedMsg.author.tag}`,
        iconURL: quotedMsg.author.displayAvatarURL({ dynamic: true }),
      });
    } else embed.setThumbnail(quotedMsg.author.displayAvatarURL({ dynamic: true }));
  } else {
    if (quotedMsg.attachments.size > 0) {
      if (quotedMsg.attachments.first().url.match(/\.(jpeg|jpg|png|webp|gif)$/)) embed.setImage(quotedMsg.attachments.first().url);
      else embed.addField('Attachment', `[${quotedMsg.attachments.first().name}](${quotedMsg.attachments.first().url})`);
    }

    embed
      .setAuthor({
        name: `Message sent by ${quotedMsg.author.tag}`,
        iconURL: 'https://database.faithfulpack.net/images/bot/quote.png',
      })
      .setThumbnail(quotedMsg.author.displayAvatarURL({ dynamic: true }))
      .setDescription(quotedMsg.content);
  }

  embed
    .setFooter({
      text: `Quoted by ${message.author.tag} | ${message.author.id}`,
      iconURL: message.author.displayAvatarURL({ dynamic: true }),
    })
    .setTimestamp(quotedMsg.createdTimestamp);
  message
    .reply({ embeds: [embed] })
    .then((m: Message) => m.deleteButton(true));
}
