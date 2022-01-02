import { Message, MessageEmbed } from 'discord.js';
import { Config } from '~/Interfaces';
import ConfigJson from '@/config.json';

declare module 'discord.js' {
  interface Message {
    config: Config;
    warn(text: string): void;
  }
}

// access to config file trough the message
Message.prototype.config = ConfigJson;

/**
 *  Warn the message by replying to it with an embed
 *  @author Juknum
 */
Message.prototype.warn = function(text: string) {
  const embed = new MessageEmbed()
    .setColor(this.config.colors.red)
    .setThumbnail('https://database.compliancepack.net/images/bot/warning.png')
    .setTitle('Action failed')
    .setDescription(text)
    .setFooter(`Type ${this.config.prefix}help to get more information about commands`, this.client.user.displayAvatarURL()); // todo : deprecated

  if (this.deleted) this.channel.send({ embeds: [embed] });
  else this.reply({ embeds: [embed] });
}

export default Message;