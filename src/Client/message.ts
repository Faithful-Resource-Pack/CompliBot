import { Message, MessageEmbed } from 'discord.js';
import { Config } from '~/Interfaces';
import ConfigJson from '@/config.json';
import Menu from '~/Helpers/menu';

declare module 'discord.js' {
	interface Message {
		config: Config;
		menu: Menu;
		setMenu(choiceType: 'texture' | 'imageOptions', id: string): Menu;
		warn(text: string): void;
	}
}

Message.prototype.menu = undefined;
Message.prototype.setMenu = function (choiceType: 'texture' | 'imageOptions', id: string) {
	this.menu = new Menu(this, choiceType, id)
	return this.menu;
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
		.setThumbnail('https://database.compliancepack.net/images/bot/warning.png')
		.setTitle('Action failed')
		.setDescription(text)
		.setFooter({ text: `Type ${this.config.prefix}help to get more information about commands`, iconURL: this.client.user.displayAvatarURL() });

	try { // test if message is deleted or not
		this.reply({ embeds: [embed] });
	} catch (err) { this.channel.send({ embeds: [embed] }) };
}

export default Message;