import { Button } from '@interfaces';
import { info } from '@helpers/logger';
import { Client, Message, ButtonInteraction, MessageEmbed } from '@client';
import { magnifyAttachment } from '@functions/canvas/magnify';
import { palette } from '@helpers/buttons';
import { getImageFromMessage } from '@functions/slashCommandImage';
import { MessageActionRow } from 'discord.js';
import { getSubmissionsChannels } from '@helpers/channels';

export const button: Button = {
  buttonId: 'magnify',
  execute: async (client: Client, interaction: ButtonInteraction) => {
    if (client.verbose) console.log(`${info}Image was magnified!`);

    const message: Message = interaction.message as Message;
    const url = await getImageFromMessage(message);
    const attachment = (
      await magnifyAttachment({
        url: url,
        name: url.split('/').at(-1),
      })
    )[0];

    if (attachment == null)
      return interaction.reply({
        content: await interaction.getEphemeralString({
          string: 'Command.Images.TooBig',
        }),
        ephemeral: true,
      });

    if (getSubmissionsChannels(interaction.client as Client).includes(interaction.channelId))
      return interaction.reply({
        embeds: [new MessageEmbed().setImage(`attachment://${attachment.name}`).setTimestamp()],
        files: [attachment],
        components: [new MessageActionRow().addComponents(palette)],
        ephemeral: true,
      });
    else
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
        .then((message: Message) => {
          message.deleteButton(true);
        });
  },
};
