import { MessageEmbed, Client, Message } from '@client';
import {
  Collection, CommandInteraction, InteractionReplyOptions, MessageAttachment,
} from 'discord.js';
import { SlashCommand, SlashCommandI } from '@interfaces';
import { SlashCommandBuilder } from '@discordjs/builders';
import ColorManager from '@helpers/class/colors';
import axios from 'axios';

async function constructResponse(
  client: Client,
  color: ColorManager,
): Promise<
  InteractionReplyOptions & {
    fetchReply: true;
  }
  > {
  const name = await axios
    .get(`https://www.thecolorapi.com/id?format=json&hex=${color.toHEX().value}`)
    .then((res) => res.data.name.value)
    .catch(() => 'unknown (an error occurred).');

  const embed = new MessageEmbed()
    .setColor(`#${color.toHEX().value}`)
    .setThumbnail('attachment://color.png')
    .setTitle('Color Preview')
    .setURL(`https://coolors.co/${color.toHEX().value}`);

  const options = {
    url: `${client.config.images}bot/monochrome_logo.png`,
    color: color.toRGBA(),
    target: {
      r: 255,
      g: 255,
      b: 255,
      a: 1,
    },
  };
  const thumbnail = new MessageAttachment(await color.swapPixel(options), 'color.png');

  embed.addFields(
    {
      name: 'Color Name',
      value: `\`${name}\``,
    },
    {
      name: 'HEXa',
      value: `\`#${color.toHEXA().value}\``,
      inline: true,
    },
    {
      name: 'RGBa',
      value: `\`rgba(${Object.values(color.toRGBA()).join(', ')})\``,
      inline: true,
    },
    {
      name: 'HSL',
      value: `\`hsl(${Object.values(color.toHSL()).join(', ')})\``,
      inline: true,
    },
    {
      name: 'HSV',
      value: `\`hsv(${Object.values(color.toHSV()).join(', ')})\``,
      inline: true,
    },
    {
      name: 'CMYK',
      value: `\`cmyk(${Object.values(color.toCMYK()).join(', ')})\``,
      inline: true,
    },
  );

  return {
    embeds: [embed],
    files: [thumbnail],
    fetchReply: true,
  };
}

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('color')
    .setDescription('Get the information about a specified color.')
    .addSubcommand((subcommand) => subcommand
      .setName('hex')
      .setDescription('Get the information about a HEX color.')
      .addStringOption((option) => option
        .setName('value')
        .setDescription('Hexadecimal value (ex: #000, #0000, #abcdef, #aeaeff00)')
        .setRequired(true)))
    .addSubcommand((subcommand) => subcommand
      .setName('rgb-a')
      .setDescription('Get the information about a RGBa color.')
      .addNumberOption((option) => option.setName('red').setDescription('Red value [0-255]').setRequired(true))
      .addNumberOption((option) => option.setName('green').setDescription('Green value [0-255]').setRequired(true))
      .addNumberOption((option) => option.setName('blue').setDescription('Blue value [0-255]').setRequired(true))
      .addNumberOption((option) => option.setName('alpha').setDescription('Alpha value [0-1]')))
    .addSubcommand((subcommand) => subcommand
      .setName('hsl')
      .setDescription('Get the information about a HSL color.')
      .addNumberOption((option) => option.setName('hue').setDescription('Hue value [0-360]').setRequired(true))
      .addNumberOption((option) => option.setName('saturation').setDescription('Saturation value [0-100]').setRequired(true))
      .addNumberOption((option) => option.setName('lightness').setDescription('Lightness/Brightness value [0-100]').setRequired(true)))
    .addSubcommand((subcommand) => subcommand
      .setName('hsv')
      .setDescription('Get the information about a HSV color.')
      .addNumberOption((option) => option.setName('hue').setDescription('Hue value [0-360]').setRequired(true))
      .addNumberOption((option) => option.setName('saturation').setDescription('Saturation value [0-100]').setRequired(true))
      .addNumberOption((option) => option.setName('value').setDescription('Color value [0-100]').setRequired(true)))
    .addSubcommand((subcommand) => subcommand
      .setName('cmyk')
      .setDescription('Get the information about a CMYK color.')
      .addNumberOption((option) => option.setName('cyan').setDescription('Cyan color [0-100]').setRequired(true))
      .addNumberOption((option) => option.setName('magenta').setDescription('Magenta color [0-100]').setRequired(true))
      .addNumberOption((option) => option.setName('yellow').setDescription('Yellow color [0-100]').setRequired(true))
      .addNumberOption((option) => option.setName('key').setDescription('Black key color [0-100]').setRequired(true))),
  execute: new Collection<string, SlashCommandI>()
    .set('hex', async (interaction: CommandInteraction, client: Client) => {
      await interaction.deferReply();

      const c = new ColorManager({
        hex: interaction.options.getString('value'),
      });
      interaction.editReply(await constructResponse(client, c)).then((message: Message) => message.deleteButton());
    })
    .set('rgb-a', async (interaction: CommandInteraction, client: Client) => {
      await interaction.deferReply();

      const c = new ColorManager({
        rgb: {
          r: interaction.options.getNumber('red', true),
          g: interaction.options.getNumber('green', true),
          b: interaction.options.getNumber('blue', true),
          a: interaction.options.getNumber('alpha', false),
        },
      });
      interaction.editReply(await constructResponse(client, c)).then((message: Message) => message.deleteButton());
    })
    .set('hsl', async (interaction: CommandInteraction, client: Client) => {
      await interaction.deferReply();

      const c = new ColorManager({
        hsl: {
          h: interaction.options.getNumber('hue', true),
          s: interaction.options.getNumber('saturation', true),
          l: interaction.options.getNumber('lightness', true),
        },
      });
      interaction.editReply(await constructResponse(client, c)).then((message: Message) => message.deleteButton());
    })
    .set('hsv', async (interaction: CommandInteraction, client: Client) => {
      await interaction.deferReply();

      const c = new ColorManager({
        hsv: {
          h: interaction.options.getNumber('hue', true),
          s: interaction.options.getNumber('saturation', true),
          v: interaction.options.getNumber('value', true),
        },
      });
      interaction.editReply(await constructResponse(client, c)).then((message: Message) => message.deleteButton());
    })
    .set('cmyk', async (interaction: CommandInteraction, client: Client) => {
      await interaction.deferReply();

      const c = new ColorManager({
        cmyk: {
          c: interaction.options.getNumber('cyan', true),
          m: interaction.options.getNumber('magenta', true),
          y: interaction.options.getNumber('yellow', true),
          k: interaction.options.getNumber('key', true),
        },
      });
      interaction.editReply(await constructResponse(client, c)).then((message: Message) => message.deleteButton());
    }),
};

export default command;
