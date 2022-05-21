import { Client, Message, SelectMenuInteraction } from '@client';
import { SelectMenu } from '@interfaces';
import { info } from '@helpers/logger';
import { imageButtons } from '@helpers/buttons';
import { MessageInteraction } from 'discord.js';
import { getTextureMessageOptions } from '@functions/getTexture';
import axios from 'axios';

export const menu: SelectMenu = {
  selectMenuId: 'textureSelect',
  execute: async (client: Client, interaction: SelectMenuInteraction) => {
    if (client.verbose) console.log(`${info}Texture selected!`);

    const messageInteraction: MessageInteraction = interaction.message.interaction as MessageInteraction;
    const message: Message = interaction.message as Message;

    if (interaction.user.id !== messageInteraction.user.id)
      return interaction.reply({
        content: (
          await interaction.getEphemeralString({
            string: 'Error.Interaction.Reserved',
          })
        ).replace('%USER%', `<@!${messageInteraction.user.id}>`),
        ephemeral: true,
      });
    else interaction.deferReply();

    const [id, pack] = interaction.values[0].split('__');
    const [embed, files] = await getTextureMessageOptions({
      texture: (await axios.get(`${(interaction.client as Client).config.apiUrl}textures/${id}/all`)).data,
      pack: pack,
    });
    embed.setFooter({
      iconURL: embed.footer.iconURL,
      text: `${embed.footer.text} | ${interaction.user.id}`,
    });

    try {
      message.delete();
    } catch (err) {
      interaction.editReply({
        content: await interaction.getEphemeralString({
          string: 'Error.Message.Deleted',
        }),
      });
    }

    interaction
      .editReply({
        embeds: [embed],
        files: files,
        components: [imageButtons],
      })
      .then((message: Message) => message.deleteButton(true));
  },
};
