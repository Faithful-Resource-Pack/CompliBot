import axios from 'axios';
import MinecraftSorter from '@helpers/sorter';
import getTextureMessageOptions from '@functions/getTexture';
import { SlashCommand } from '@interfaces';
import { SlashCommandBuilder } from '@discordjs/builders';
import {
  Client, CommandInteraction, Message, MessageEmbed,
} from '@client';
import { MessageActionRow, MessageSelectMenu, MessageSelectOptionData } from 'discord.js';
import { imageButtons } from '@helpers/buttons';

const command: SlashCommand = {
  servers: ['faithful', 'faithful_extra', 'classic_faithful'],
  data: new SlashCommandBuilder()
    .setName('texture')
    .setDescription('Displays a specified texture from either vanilla Minecraft or Faithful.')
    .addStringOption((option) => option.setName('name').setDescription('Name of the texture you are searching for.').setRequired(true))
    .addStringOption((option) => option
      .setName('pack')
      .setDescription('Resource pack of the texture you are searching for.')
      .addChoices(
        {
          name: 'Vanilla 16x',
          value: 'default',
        },
        {
          name: 'Faithful 32x',
          value: 'faithful_32x',
        },
        {
          name: 'Faithful 64x',
          value: 'faithful_64x',
        },
        {
          name: 'Classic Faithful 32x',
          value: 'classic_faithful_32x',
        },
        {
          name: 'Classic Faithful 64x',
          value: 'classic_faithful_64x',
        },
        {
          name: 'Classic Faithful 32x Programmer Art',
          value: 'classic_faithful_32x_progart',
        },
      )
      .setRequired(true)),
  execute: async (interaction: CommandInteraction) => {
    await interaction.deferReply();

    let name = interaction.options.getString('name');
    if (name.includes('.png')) name = name.replace('.png', '');
    name = name.replace(/ /g, '_');
    if (name.length < 3) {
      // textures like "bed" exist :/
      try {
        interaction.deleteReply();
      } catch {
        // noop
      }
      interaction.followUp({
        content: 'The minimum length for a texture name search is 3, please search with a longer name.',
        ephemeral: true,
      });
      return;
    }

    /**
     * TODO: find a fix for this Error: connect ETIMEDOUT 172.67.209.9:443 at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1161:16)
     */
    const results: Array<any> = (await axios.get(`${(interaction.client as Client).config.apiUrl}textures/${name}/all`))
      .data;

    // only 1 result
    if (results.length === 1) {
      const [embed, files] = await getTextureMessageOptions({
        texture: results[0],
        pack: interaction.options.getString('pack', true),
      });
      interaction
        .editReply({
          embeds: [embed],
          files,
          components: [imageButtons],
        })
        .then((message: Message) => message.deleteButton());
      return;
    }

    // multiple results
    if (results.length > 1) {
      const components: Array<MessageActionRow> = [];
      const rlen: number = results.length;
      const MAX: number = 4; // actually 5 but - 1 because we are adding a delete button to it (the 5th one)
      let max: number = 0;

      // parsing everything correctly
      for (let i = 0; i < results.length; i += 1) {
        results[i] = {
          label: `[#${results[i].id}] (${results[i].paths[0].versions.sort(MinecraftSorter).reverse()[0]}) ${
            results[i].name
          }`,
          description: results[i].paths[0].name,
          value: `${results[i].id}__${interaction.options.getString('pack', true)}`,
        };
      }

      const emojis: Array<string> = [
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

      // dividing into maximum of 25 choices per menu
      // 4 menus max
      do {
        const options: Array<MessageSelectOptionData> = [];

        for (let i = 0; i < 25; i += 1) {
          if (results[0] !== undefined) {
            const t = results.shift();
            t.emoji = emojis[i % emojis.length];
            options.push(t);
          }
        }

        const menu = new MessageSelectMenu()
          .setCustomId(`textureSelect_${max}`)
          .setPlaceholder('Select a texture!')
          .addOptions(options);

        const row = new MessageActionRow().addComponents(menu);

        components.push(row);
        max += 1;
      } while (results.length !== 0 && max < MAX);

      const embed = new MessageEmbed().setTitle(`${rlen} results`).setFooter({
        text: "Some results may be hidden, if you don't see them, be more specific",
      });

      await interaction
        .editReply({
          embeds: [embed],
          components,
        })
        .then((message: Message) => message.deleteButton());
      return;
    }

    // no results
    interaction.editReply({
      content: await interaction.getString({
        string: 'Command.Texture.NotFound',
        placeholders: {
          TEXTURENAME: `\`${name}\``,
        },
      }),
    }).then((m: Message) => m.deleteButton());
  },
};

export default command;
