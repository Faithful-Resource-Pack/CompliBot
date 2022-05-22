import config from '@json/config.json';
import { APIEmbed } from 'discord-api-types/v10';
import { MessageEmbed, MessageEmbedOptions } from 'discord.js';

class ExtendedEmbed extends MessageEmbed {
  constructor(data?: MessageEmbed | MessageEmbedOptions | APIEmbed) {
    super(data);
    if (data) return; // do not override existing data

    this.setColor('BLURPLE');
    this.setFooter({
      text: 'CompliBot',
      iconURL: config.icon,
    });
  }
}

// eslint-disable-next-line import/prefer-default-export
export { ExtendedEmbed };
