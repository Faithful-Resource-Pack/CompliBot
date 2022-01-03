import { Message, MessageEmbed, ReactionCollector, ReactionCollectorOptions, ReactionEmoji, ReactionManager, ReactionUserManager, User } from 'discord.js';
import { Config } from '~/Interfaces';
import ConfigJson from '@/config.json';
import Menu from '~/Helpers/menu';
import { ids } from '~/Helpers/emojis';

declare module 'discord.js' {
	interface Message {
		config: Config;
		menu: Menu;
		setMenu(choiceType: 'texture' | 'imageOptions', id: string): Menu;
		warn(text: string): void;
		deleteReact(options: { authorMessage: Message, previousMessage?: Message, deleteAuthorMessage: boolean }): void;
	}
}

/**
 * Add a trash can emote and await of user interaction, if used, the message is deleted
 * - does nothing if it's DM
 */
Message.prototype.deleteReact = async function (options: { authorMessage: Message, previousMessage?: Message, deleteAuthorMessage: boolean }) {
	if (this.channel.type === 'DM') return;

	// react using the trash can emoji
	await this.react(ids.delete).catch((err) => { console.trace(err) })

	// filter to get the right user
	const filter = (reaction, user) => {
		if (options.previousMessage) return !user.bot && ids.delete === reaction.emoji.id && user.id === options.previousMessage.author.id
		else return !user.bot && ids.delete === reaction.emoji.id && user.id === options.authorMessage.author.id
	}

	// await for reaction for 1 minute long
	this.awaitReactions({ filter: filter, max: 1, time: 60000, errors: ['time'] })
		.then(async () => {
			await this.delete().catch((err) => { console.trace(err) })

			if (options.deleteAuthorMessage === true) {
				if (options.previousMessage) await options.previousMessage.delete().catch((err) => { console.trace(err) })
				else await options.authorMessage.delete().catch((err) => { console.trace(err) })
			}
		})
		.catch(async () => {
			// on timeout:
			const reaction = this.reactions.cache.get(ids.delete)
			if (reaction) await reaction.remove().catch((err) => { console.trace(err) });
		})
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
		.setThumbnail(`${this.config.images}warning.png`)
		.setTitle('Action failed')
		.setDescription(text)
		.setFooter({ text: `Type ${this.config.prefix}help to get more information about commands`, iconURL: this.client.user.displayAvatarURL() });

	this.reply({ embeds: [embed] })
		.then((sentMessage: Message) => { sentMessage.deleteReact({ authorMessage: this, deleteAuthorMessage: true }) })
		.catch(err => { this.channel.send({ embeds: [embed] }) })

}

export default Message;