import { BaseGuild, EmojiResolvable, Message, MessageActionRow, MessageEmbed, MessageSelectMenu } from 'discord.js';
import { Config } from '~/Interfaces';
import ConfigJson from '@/config.json';
import { config } from 'process';
import { ids, parseId } from '~/Helpers/emojis';

declare module 'discord.js' {
	interface Message {
		config: Config;
		warn(text: string): void;
		choiceMenu: any; //TODO: should be choiceMenuI so that it gives proper docs. really unusable otherwise
	}
}

interface choiceMenuI {
	addOption(title: string, path: string, value: string): void;
	build(): void;
}

// access to config file trough the message
Message.prototype.config = ConfigJson;

/**
 *  Warn the message by replying to it with an embed
 *  @author Juknum
 */
Message.prototype.warn = function (text: string) {
	const embed = new MessageEmbed()
		.setColor(this.config.colors.red)
		.setThumbnail(`${this.config.botImages}warning.png`)
		.setTitle('Action failed')
		.setDescription(text)
		.setFooter({ text: `Type ${this.config.prefix}help to get more information about commands`, iconURL: this.client.user.displayAvatarURL() }); //* fixed deprecated
	//.setFooter(`Type ${this.config.prefix}help to get more information about commands`, this.client.user.displayAvatarURL()); // todo : deprecated

	if (this.deleted) this.channel.send({ embeds: [embed] });
	else this.reply({ embeds: [embed] });
};

/**
 * @description Useful for creating embeds.
 * @see the todo at the startabove
 * @author nick
 */
Message.prototype.choiceMenu = class implements choiceMenuI {
	// Certified Object Oriented Programing Moment
	private embed: MessageEmbed;
	private menu: MessageSelectMenu;
	private choiceType: 'texture' | 'imageOptions';

	constructor(title: string, type: 'texture' | 'imageOptions', id: string) {
		this.choiceType = type;
		this.embed = new MessageEmbed();
		this.embed.setTitle(title);
		this.menu.setCustomId(id);
		this.embed.setColor(Message.prototype.config.colors.blue); //i dont know
		if (this.choiceType == 'texture') {
			this.menu.setPlaceholder('Select a texture');
			this.embed.setTitle('Select a texture with the menu below');
		} else {
			this.menu.setPlaceholder('Select an image manipulation option');
			this.embed.setTitle('Select an image manipulation option using the menu below');
		}
	}

	public addOption = (title: string, path: string, value: string) => {
		if (this.choiceType == 'imageOptions') return;
		this.menu.addOptions([{ label: title, description: path, value: value }]);
	};

	public build = () => {
		if (this.choiceType == 'imageOptions') {
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
		}
		Message.prototype.reply({ embeds: [this.embed], components: [new MessageActionRow().addComponents(this.menu)] });
	};
};
export default Message;
