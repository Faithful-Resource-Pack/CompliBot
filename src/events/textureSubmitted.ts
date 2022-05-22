import { Event } from '@interfaces';
import { Client, Message, MessageEmbed } from '@client';
import { info } from '@helpers/logger';
import {
  MessageActionRow, MessageAttachment, MessageSelectMenu, MessageSelectOptionData,
} from 'discord.js';
import { zipToMA } from '@functions/zipToMessageAttachments';
import axios, { AxiosResponse } from 'axios';
import { Submission } from '@class/submissions';

export const processFiles = async (
  client: Client,
  message: Message,
  files: MessageAttachment[],
  INDEX: number = 0,
  id?: string,
): Promise<boolean> => {
  for (let index = INDEX; index < files.length; index += 1) {
    const file: MessageAttachment = files[index];

    let req: AxiosResponse<any, any>;
    try {
      req = await axios.get(`${client.config.apiUrl}textures/${id || file.name.replace('.png', '')}/all`);
    } catch (_err) {
      message.warn(
        `An API error occurred for \`${id ? `the ID ${id}` : file.name.replace('.png', '')}\`:\n\`\`\`(${
          _err.response.data.status
        }) ${_err.response.data.message}\`\`\``,
      );

      return false;
    }

    id = undefined; // reset id for next iteration (id would come from selectMenu)
    const textures = req.data; // could be multiple textures (an array) or a single texture (an object then)

    // no results
    if (textures.length < 1) {
      message.warn(`No textures found for \`${file.name.replace('.png', '')}\``, true);
      return true;
    }

    // multiple results
    if (textures.length > 1) {
      const components: MessageActionRow[] = [];
      const rlen: number = textures.length;
      const MAX: number = 4;
      let max: number = 0;

      for (let i = 0; i < textures.length; i += 1) {
        textures[i] = {
          label: `[#${textures[i].id}] (${textures[i].paths[0].versions[0]}) ${textures[i].name}`,
          description: textures[i].paths[0].name,
          value: `${textures[i].id}__${index}`,
        };
      }

      const emojis: string[] = [
        '1️⃣',
        '2️⃣',
        '3️⃣',
        '4️⃣',
        '5️⃣',
        '6️⃣',
        '7️⃣',
        '8️⃣',
        '9️⃣',
        '🔟',
        '🇦',
        '🇧',
        '🇨',
        '🇩',
        '🇪',
        '🇫',
        '🇬',
        '🇭',
        '🇮',
        '🇯',
        '🇰',
        '🇱',
        '🇲',
        '🇳',
        '🇴',
      ];

      do {
        const options: MessageSelectOptionData[] = [];
        for (let i = 0; i < 25; i += 1) {
          if (textures[0] !== undefined) {
            const t = textures.shift();
            t.emoji = emojis[i % emojis.length];
            options.push(t);
          }
        }

        const menu = new MessageSelectMenu()
          .setCustomId(`submitTextureSelect_${max}`)
          .setPlaceholder('Select a texture')
          .addOptions(options);

        const row = new MessageActionRow().addComponents(menu);

        components.push(row);
        max += 1;
      } while (textures.length !== 0 && max < MAX);

      const embed = new MessageEmbed()
        .setTitle(`Multiple textures found for \`${file.name.replace('.png', '')}\` (${rlen} results)`)
        .setThumbnail(file.url)
        .setFooter({
          text: 'Select the texture that correspond to your submission',
        });

      message
        .reply({
          embeds: [embed],
          components,
        })
        .then((msg: Message) => msg.deleteButton(true));

      return false;
    }

    // 1 result (instance of Object OR an array of length 1) (depends if it's from ID or name)
    const submission = new Submission();
    await submission.postSubmissionMessage(client, message, file, textures.length ? textures[0] : textures);
  }

  return true;
};

const event: Event = {
  name: 'textureSubmitted',
  run: async (client: Client, message: Message): Promise<void> => {
    if (!client.tokens.dev) return Promise.resolve(); //! only for devs now

    client.storeAction('textureSubmitted', message);
    if (client.verbose) console.log(`${info}Texture submitted!`);

    if (message.attachments.size === 0) return message.warn('No images/zip files were attached!', true);

    let files: Array<MessageAttachment> = [];
    const currAttach = [...message.attachments.values()];

    for (let i = 0; i < currAttach.length; i += 1) {
      const attachment = currAttach[i];

      // attachments that are non zip archives
      if (attachment.contentType !== 'application/zip') files.push(attachment);
      else {
        const zipFiles: Array<MessageAttachment> = await zipToMA(attachment.url);
        files = [...files, ...zipFiles];
      }
    }

    const doDelete: boolean = await processFiles(client, message, files);

    try {
      if (doDelete) message.delete(); // delete only if all textures were processed (and selected)
    } catch {
      /* message already deleted */
    }

    return Promise.resolve();
  },
};

export default event;
