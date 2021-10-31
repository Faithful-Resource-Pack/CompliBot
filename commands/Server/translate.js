const prefix = process.env.PREFIX;

const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;
const uidD = process.env.UIDD;

const strings = require('../../resources/strings.json');

const { translate } = require('../../functions/translate');
const { warnUser } = require('../../helpers/warnUser');

module.exports = {
	name: 'translate',
	description: strings.command.description.translate,
	category: 'Server',
	guildOnly: false,
	uses: strings.command.use.devs,
	syntax: `${prefix}translate`,
	example: `${prefix}translate de Hello world!`,
	async execute(client, message, args) {
		if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD) {
			if (args[0].length < 2) return warnUser(message, 'This language doesn\'t exist!');

			else if ((args[1] == undefined || args[1] == '' || args[1] == 'up' || args[1] == '^' || args[1] == 'last')) {
				return PreviousMessage();
			}

			return await translate(message, args.slice(1), args);
		} else warnUser(message, strings.command.testing);

		async function PreviousMessage() {
			var found = false;
			var messages = [];
			var list_messages = await message.channel.messages.fetch({ limit: 10 });
			messages.push(...list_messages.array());

			for (var i in messages) {
				var msg = messages[i]
				var content = '';
				try {
					if (msg.content && !msg.content.startsWith(prefix)) {
						found = true;
						content = msg.content.trim().split(/ +/)
						break;
					}
				} catch (e) {
					return warnUser(message, strings.command.translate.no_message);
				}
			}

			if (found) await translate(message, content, args);
			else return warnUser(message, strings.command.translate.no_message);
		}

	}
}

