const prefix = process.env.PREFIX;

const { tile } = require('../../functions/tile.js');
const { warnUser } = require('../../functions/warnUser.js');

module.exports = {
	name: 'tile',
	aliases: ['t'],
	description: 'Tile an image, if no arguments are given, grid shape is selected by default & the bot search in the last 10 message for an image.',
	uses: 'Anyone',
	syntax: `${prefix}tile [vertical/horizontal/grid/round/plus] + attach a file`,
	async execute(client, message, args) {
		var DATA;

		// <data>
		// image attached
		if ((args[0] == undefined || args[0] == '' || args[0] == 'grid' || args[0] == 'g') && message.attachments.size > 0) {
			DATA = message.attachments.first().url;
			return tile(message, DATA, 'grid');
		}
		else if ((args[0] == 'vertical' || args[0] == 'v') && message.attachments.size > 0) {
			DATA = message.attachments.first().url;
			return tile(message, DATA, 'vertical');
		}
		else if ((args[0] == 'horizontal' || args[0] == 'h') && message.attachments.size > 0) {
			DATA = message.attachments.first().url;
			return tile(message, DATA, 'horizontal');
		}
		else if ((args[0] == 'round' || args[0] == 'r') && message.attachments.size > 0) {
			DATA = message.attachments.first().url;
			return tile(message, DATA, 'round');
		}

		// previous image with tiling options
		else if (args[0] == undefined && message.attachments.size == 0) {
			return PreviousImage('grid');
		}
		else if ((args[0] == 'vertical' || args[0] == 'v') && message.attachments.size == 0) {
			return PreviousImage('vertical');
		}
		else if ((args[0] == 'horizontal' || args[0] == 'h') && message.attachments.size == 0) {
			return PreviousImage('horizontal');
		}
		else if ((args[0] == 'round' || args[0] == 'r') && message.attachments.size == 0) {
			return PreviousImage('round');
		}
		else if ((args[0] == 'plus' || args[0] == 'p') && message.attachments.size == 0) {
			return PreviousImage('plus');
		}

		async function PreviousImage(type) {
			if (type == undefined) type = 'grid'; // security

			var found = false;
			var messages = [];
			var list_messages = await message.channel.messages.fetch({ limit: 10 });
			messages.push(...list_messages.array());

			for (var i in messages) {
				var msg = messages[i]
				var url = '';
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
			}

			if (found) await tile(message, url, type);
			else return warnUser(message,'No image found in the 10 previous messages.');
		}
	}
}
