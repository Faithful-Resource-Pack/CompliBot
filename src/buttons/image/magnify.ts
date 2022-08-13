import { Button } from '@interfaces';
import { info } from '@helpers/logger';
import {
  Client, Message, ButtonInteraction, MessageEmbed,
} from '@client';
import { palette } from '@helpers/buttons';
import { getImageFromMessage } from '@functions/slashCommandImage';
import { MessageActionRow, MessageAttachment } from 'discord.js';
import { getSubmissionsChannels } from '@helpers/submissionConfig';
import Magnify from '@class/Magnify';

const button: Button = {
  buttonId: 'magnify',
  execute: async (client: Client, interaction: ButtonInteraction) => {
    if (client.verbose) console.log(`${info}Image was magnified!`);

    const message: Message = interaction.message as Message;
    const url = await getImageFromMessage(message);
    const attachment: MessageAttachment | string = await (new Magnify({ textureURL: url })).getAsAttachment(url.split('/').at(-1));

    if (typeof attachment === 'string') {
      return interaction.reply({
        content: attachment,
        ephemeral: true,
      });
    }

    if (getSubmissionsChannels(interaction.client as Client).includes(interaction.channelId)) {
      return interaction.reply({
        embeds: [new MessageEmbed().setImage(`attachment://${attachment.name}`).setTimestamp()],
        files: [attachment],
        components: [new MessageActionRow().addComponents(palette)],
        ephemeral: true,
      });
    }
    return interaction
      .reply({
        embeds: [
          new MessageEmbed()
            .setImage(`attachment://${attachment.name}`)
            .setFooter({
              text: `${interaction.user.username} | ${interaction.user.id}`,
            })
            .setTimestamp(),
        ],
        files: [attachment],
        components: [new MessageActionRow().addComponents(palette)],
        fetchReply: true,
      })
      .then((m: Message) => {
        m.deleteButton(true);
      });
  },
};

export default button;
