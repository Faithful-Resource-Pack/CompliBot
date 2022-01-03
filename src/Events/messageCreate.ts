import * as emojis from '~/Helpers/emojis';
import { Event, Command } from '~/Interfaces';
import { increase } from '~/Functions/commandProcess';
import Message from '~/Client/message';
import ExtendedClient from '~/Client';

export const event: Event = {
	name: 'messageCreate',
	run: async (client, message: Message) => {
		if (message.author.bot) return;

		if (!message.content.startsWith(client.config.prefix)) {
			switch (message.content.toLocaleLowerCase()) {
				case 'engineer gaming':
					return message.react('👷');
				case 'test':
					return message.react(emojis.parseId(emojis.ids.delete));
				case 'rip':
				case 'f':
					return message.react('🇫');
				case 'band':
					return ['🎤', '🎸', '🥁', '🪘', '🎺', '🎷', '🎹', '🪗', '🎻'].forEach(async (emoji) => {
						await message.react(emoji);
					});
				case 'monke': //cases can do this, they can overlap. Very useful
				case 'monkee':
				case 'monkey':
					return ['🎷', '🐒'].forEach(async (emoji) => {
						await message.react(emoji);
					});
			}
			return;
		}

		const args = message.content.slice(client.config.prefix.length).trim().split(/ +/);

		const cmd = args.shift().toLowerCase();
		if (!cmd) return;

		const command = client.commands.get(cmd) || client.aliases.get(cmd);
		if (command) {
			let _ = ((message as Message) instanceof Message); // do not remove, 'force' message to be casted (break if removed)
			(command as Command).run(client, message, args);
			increase((command as Command).name);
		}
	},
};