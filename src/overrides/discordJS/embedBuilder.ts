import { Colors } from '@enums';
import { Images } from '@utils';
import { EmbedBuilder, EmbedData, APIEmbed } from 'discord.js';

class ExtendedEmbedBuilder extends EmbedBuilder {
  constructor(data?: EmbedData | APIEmbed) {
    super(data);
    // If data is provided, don't override it.
    if (data) return;

    this.setColor(Colors.BLUE);
    this.setFooter({
      text: `CompliBot © ${new Date().getFullYear()}`,
      iconURL: Images.getAsEmbedFooterOrAuthor('branding/logos/transparent/64/bot_logo.png'),
    });
  }
}

export { ExtendedEmbedBuilder as EmbedBuilder };
