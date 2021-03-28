const prefix = process.env.PREFIX;

const strings = require('../../res/strings');

const { tile }     = require('../../functions/tile.js');
const { warnUser } = require('../../functions/warnUser.js');

module.exports = {
	name: 'tile',
	aliases: ['t'],
	description: strings.HELP_DESC_TILE,
	guildOnly: false,
	uses: strings.COMMAND_USES_ANYONE,
	syntax: `${prefix}tile [vertical/horizontal/grid/round/plus] + attach a file`,
	async execute(client, message, args) {
		const tileArgs = ['grid', 'g', 'vertical', 'v', 'horizontal', 'h', 'round', 'r', 'plus', 'p'];
		var DATA;

		if (!tileArgs.includes(args[0]) && args[0] != undefined) return warnUser(message, strings.COMMAND_WRONG_ARGUMENTS_GIVEN);

		// <data>
		// image attached
		if ((args[0] == undefined || tileArgs.includes(args[0])) && message.attachments.size > 0) {
			DATA = message.attachments.first().url;
			return tile(message, DATA, args[0]);
		}

		// previous image with tiling options
		else if ((args[0] == undefined || tileArgs.includes(args[0])) && message.attachments.size == 0) {
			return PreviousImage(args[0]);
		}

		// Discord message URL
		/*else if (args[0].startsWith('https://discord.com/channels')) {
			message.channel.messages.fetch(args[0].split('/').pop()).then(msg => {
				if (msg.attachments.size > 0) {
					DATA = msg.attachments.first().url;
					return tile(message, DATA);
				}
				else return warnUser(message,`The message from the provided URL does not have any image attached.`);
			}).catch(error => { return warnUser(message,error + ' The message URL needs to be from the same channel') });
		}

		// Image URL
		else if (args[0].startsWith('https://') || args[0].startsWith('http://')) {
			if (args[0].endsWith('.png') || args[0].endsWith('.jpeg') || args[0].endsWith('.jpg')) {
				DATA = args[0];
				return tile(message, DATA);
			} else return warnUser(message,`Image extension is not supported`)
		}*/

		async function PreviousImage(type) {
			if (type == undefined) type = 'grid'; // security

			var found = false;
			var messages = [];
			var list_messages = await message.channel.messages.fetch({ limit: 10 });
			messages.push(...list_messages.array());

			for (var i in messages) {
				var msg = messages[i]
				var url = '';
				try {
					if (msg.attachments.size > 0) {
						found = true;
						url = msg.attachments.first().url;
						break;
					}
					else if (msg.embeds[0] != undefined && msg.embeds[0] != null && msg.embeds[0].image) {
						found = true;
						url = msg.embeds[0].image.url;
						break;
					}
				} catch (e) {
					return warnUser(message, strings.COMMAND_NO_IMAGE_FOUND);
				}
			}

			if (found) await tile(message, url, type);
			else return warnUser(message, strings.COMMAND_NO_IMAGE_FOUND);
		}
	}
}
