import { Colors } from '@enums';
import { EmbedBuilder, EmbedData, APIEmbed } from 'discord.js';

class ExtendedEmbedBuilder extends EmbedBuilder {
  constructor(data?: EmbedData | APIEmbed) {
    super(data);
    // If data is provided, don't override it.
    if (data) return;

    this.setColor(Colors.BLUE);
    this.setFooter({
      text: `CompliBot © ${new Date().getFullYear()}`,
      iconURL: 'https://database.faithfulpack.net/images/branding/logos/transparent/512/bot_logo.png',
    });
  }
}

export { ExtendedEmbedBuilder as EmbedBuilder };
