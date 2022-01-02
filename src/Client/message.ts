import { Message, DiscordAPIError, MessageEmbed } from 'discord.js';

class ExtendedMessage extends Message {

  /**
   * Reply to a user with an embed, used to warn that user about something
   *  @author Juknum
   */
  public warn(text: string) {
    const embed = new MessageEmbed()
      .setColor(this.client.config.colors.red)
      .setThumbnail('https://database.compliancepack.net/images/bot/warning.png')
      .setTitle('Action failed')
      .setDescription(text)
      .setFooter(`Type ${this.client.config.prefix}help to get more information about commands`, this.client.user.displayAvatarURL());

    if (this.deleted) this.channel.send({ embeds: [embed] });
    else this.reply({ embeds: [embed] });

    // todo: add delete reaction
  }
}

export default ExtendedMessage;