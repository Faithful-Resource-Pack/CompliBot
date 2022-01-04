import { MessageActionRow, MessageEmbed, MessageSelectMenu } from 'discord.js';
import Message from '~/Client/message';
import { Config } from '~/Interfaces';
import ConfigJson from '@/config.json';
import { ids, parseId } from './emojis';

class Menu {
  private message: Message;
  private embed: MessageEmbed = new MessageEmbed();
  private menu: MessageSelectMenu = new MessageSelectMenu();
  private choiceType: 'texture' | 'imageOptions';
  private config: Config = ConfigJson;

  constructor(message: Message, choiceType: 'texture' | 'imageOptions', id: string) {
    this.message = message;
    this.choiceType = choiceType;
    this.menu.setCustomId(id);
  }

  public addOption(title: string, path: string, value: string): void {
    if (this.choiceType == 'imageOptions') return;
    this.menu.addOptions([{ label: title, description: path, value: value }]);
  }

  public build(): void {
    switch (this.choiceType) {
      case 'texture':
        this.menu.setPlaceholder('Select an image manipulation option');
        this.embed.setTitle('Select a texture with the menu below')
        break;

      case 'imageOptions':
      default:
        this.menu.setPlaceholder('Select an image manipulation option');
        this.embed.setTitle('Select an image manipulation option using the menu below');

        this.menu.addOptions([
          {
            label: 'magnify',
            value: 'magnify',
            default: true,
            emoji: parseId(ids.magnify),
            description: 'Magnifies the image by a factor.',
          },
          {
            label: 'palette',
            value: 'palette',
            emoji: parseId(ids.palette),
            description: 'Gets all colors used in the image',
          },
          {
            label: 'tile',
            value: 'tile',
            emoji: parseId(ids.tile),
            description: 'Tiles an image in a 3x3 grid',
          },
          {
            label: 'rotate',
            value: 'rotate',
            emoji: parseId(ids.next_res),
            description: 'Rotates an image by a random angle',
          },
        ]);
        break;
    }

    this.message.reply({ embeds: [this.embed], components: [new MessageActionRow().addComponents(this.menu)] });
  }

}

export default Menu;