import { Client, Message, SelectMenuInteraction } from '@client';
import { zipToMA } from '@functions/zipToMessageAttachments';
import { info } from '@helpers/logger';
import { SelectMenu } from '@interfaces';
import { MessageAttachment } from 'discord.js';
import { processFiles } from '@/src/events/textureSubmitted';

const menu: SelectMenu = {
  selectMenuId: 'submitTextureSelect',
  execute: async (client: Client, interaction: SelectMenuInteraction): Promise<void> => {
    if (client.verbose) console.log(`${info}Submitted Texture selected!`);

    const message: Message = interaction.message as Message;
    const ref: Message = await message.fetchReference();

    if (interaction.user.id !== ref.author.id) {
      return interaction.reply({
        content: (
          await interaction.getEphemeralString({
            string: 'Error.Interaction.Reserved',
          })
        ).replace('%USER%', `<@!${ref.author.id}>`),
        ephemeral: true,
      });
    }
    interaction.deferReply();

    const [textureId, fileIndex] = interaction.values[0].split('__');

    let files: Array<MessageAttachment> = [];
    const currAttach = [...ref.attachments.values()];
    for (let i = 0; i < currAttach.length; i += 1) {
      const attachment = currAttach[i];

      // attachments that are non zip archives
      if (attachment.contentType !== 'application/zip') files.push(attachment);
      else {
        const zipFiles: Array<MessageAttachment> = await zipToMA(attachment.url);
        files = [...files, ...zipFiles];
      }
    }

    const doDelete: boolean = await processFiles(client, ref, files, parseInt(fileIndex, 10), textureId);

    try {
      interaction.deleteReply();
      message.delete();
      if (doDelete) ref.delete();
    } catch {
      /* messages already deleted */
    }

    return Promise.resolve();
  },
};

export default menu;
