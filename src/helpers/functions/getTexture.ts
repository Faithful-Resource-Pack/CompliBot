import axios from 'axios';
import ConfigJson from '@json/config.json';
import MinecraftSorter from '@helpers/sorter';
import { MessageEmbed } from '@client';
import { Config } from '@interfaces';
import { MessageAttachment } from 'discord.js';
import { ISizeCalculationResult } from 'image-size/dist/types/interface';
import { colors } from '@helpers/colors';
import { fromTimestampToHumanReadable } from '@helpers/dates';
import { MCMETA, Texture } from '@helpers/interfaces/firestorm';
import MCAnimation from '@class/MCAnimation';
import Magnify from '@class/Magnify';
import getMeta from './canvas/getMeta';

export interface Options {
  texture: Texture;
  pack: string;
}

export default async function getTextureMessageOptions(options: Options): Promise<[MessageEmbed, Array<MessageAttachment>]> {
  const config: Config = ConfigJson;
  const { texture } = options;
  const { pack } = options;
  const { uses } = texture;
  const { paths } = texture;
  const { contributions } = texture;

  let animated: boolean = false;
  let mcmeta: MCMETA;

  try {
    mcmeta = (await axios.get(`${config.apiUrl}textures/${texture.id}/mcmeta`)).data;
    animated = !!mcmeta.animation;
  } catch { /* no MCMETA file found for this texture */ }

  let strPack: string;
  let strIconURL: string;

  // TODO: use API here
  switch (pack) {
    case 'faithful_32x':
      strPack = 'Faithful 32x';
      strIconURL = `${config.images}branding/logos/transparent/512/f32_logo.png`;
      break;
    case 'faithful_64x':
      strPack = 'Faithful 64x';
      strIconURL = `${config.images}branding/logos/transparent/512/f64_logo.png`;
      break;

    case 'classic_faithful_32x':
      strPack = 'Classic Faithful 32x';
      strIconURL = 'https://raw.githubusercontent.com/ClassicFaithful/Branding/main/Logos/32x%20Scale/Main%2032x.png';
      break;
    case 'classic_faithful_32x_progart':
      strPack = 'Classic Faithful 32x Programmer Art';
      strIconURL = 'https://raw.githubusercontent.com/ClassicFaithful/Branding/main/Logos/32x%20Scale/Programmer%20Art%2032x.png';
      break;
    case 'classic_faithful_64x':
      strPack = 'Classic Faithful 64x';
      strIconURL = 'https://raw.githubusercontent.com/ClassicFaithful/Branding/main/Logos/32x%20Scale/Main%2032x.png';
      break;

    case 'default':
    default:
      strPack = 'Minecraft Default';
      strIconURL = `${config.images}bot/texture_16x.png`;
      break;
  }

  const files: Array<MessageAttachment> = [];
  const embed = new MessageEmbed().setTitle(`[#${texture.id}] ${texture.name}`).setFooter({
    text: `${strPack}`,
    iconURL: strIconURL,
  });

  let textureURL: string;
  try {
    textureURL = (await axios.get(`${config.apiUrl}textures/${texture.id}/url/${pack}/latest`)).request.res.responseUrl;
  } catch {
    textureURL = '';
  }

  embed.setThumbnail(textureURL);
  embed.setImage(`attachment://magnified.${animated ? 'gif' : 'png'}`);

  // test if url isn't a 404
  let validURL: boolean = false;
  let dimensions: ISizeCalculationResult;
  try {
    dimensions = await getMeta(textureURL);
    validURL = true;
  } catch (err) {
    textureURL = 'https://raw.githubusercontent.com/Faithful-Resource-Pack/App/main/resources/transparency.png';
    embed.addField('Image not found', "This texture hasn't been made yet or is blacklisted!");
    embed.setColor(colors.red);
  }

  if (validURL) {
    embed.addField('Resolution', `${dimensions.width}×${dimensions.height}`, true);
	embed.addField('\u200B', `[View texture online](https://webapp.faithfulpack.net/#/gallery/java/32x/latest/all/?show=${texture.id})`, true);

    const displayedContributions = [
      contributions
        .filter((c) => strPack.includes(c.resolution.toString()) && pack === c.pack)
        .sort((a, b) => (a.date > b.date ? -1 : 1))
        .map((c) => {
          const strDate: string = `<t:${Math.trunc(c.date / 1000)}:d>`;
          const authors = c.authors.map((authorId: string) => `<@!${authorId}>`);
          return `${strDate} — ${authors.join(', ')}`;
        })[0],
    ];

    if (displayedContributions[0] !== undefined && contributions.length && pack !== 'default') embed.addField('Latest Author(s)', displayedContributions.join('\n'));
  }

  const tmp = {};
  uses.forEach((use) => {
    paths
      .filter((el) => el.use === use.id)
      .forEach((p) => {
        const versions = p.versions.sort(MinecraftSorter);
        if (tmp[use.edition]) {
          tmp[use.edition].push(
            `\`[${versions.length > 1 ? `${versions[0]} — ${versions[versions.length - 1]}` : versions[0]}]\` ${
              use.assets !== null && use.assets !== 'minecraft' ? `${use.assets}/` : ''
            }${p.name}`,
          );
        } else {
          tmp[use.edition] = [
            `\`[${versions.length > 1 ? `${versions[0]} — ${versions[versions.length - 1]}` : versions[0]}]\` ${
              use.assets !== null && use.assets !== 'minecraft' ? `${use.assets}/` : ''
            }${p.name}`,
          ];
        }
      });
  });

  Object.keys(tmp).forEach((edition) => {
    if (tmp[edition].length > 0) {
      embed.addField(
        edition.charAt(0).toLocaleUpperCase() + edition.slice(1),
        tmp[edition].join('\n').replaceAll(' textures/', '../'),
        false,
      );
    }
  });

  // magnifying the texture in thumbnail
  if (animated) {
    embed.addField('MCMETA', `\`\`\`json\n${JSON.stringify(mcmeta)}\`\`\``, false);
    const buffer = await (new MCAnimation({ url: textureURL, mcmeta, magnify: true }).createGIF());
    files.push(new MessageAttachment(buffer, 'magnified.gif'));
  } else {
    files.push(await (new Magnify({ textureURL })).getAsAttachment('magnified.png', false) as MessageAttachment);
  }

  return [embed, files];
}
