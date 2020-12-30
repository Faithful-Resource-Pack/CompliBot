const prefix = process.env.PREFIX;

const { tile } = require('../functions/tile.js');
const { warnUser } = require('../functions/warnUser.js');

module.exports = {
	name: 'tile',
	description: 'Tile an image,\nImage URL needs to end with ``.png`` or ``.jpeg/jpg``,\nMessage ID needs to be from the same channel',
	uses: 'Anyone',
	syntax: `${prefix}tile attach an image\n${prefix}tile <Discord message url>\n${prefix}tile <image URL>\n${prefix}tile <message ID>\n${prefix}tile [up/^/last]`,
	async execute(client, message, args) {
		var DATA;

		// <data>
		// image attached
		if ((args[0] == undefined || args[0] == '') && message.attachments.size > 0) {
			DATA = message.attachments.first().url;
			return tile(message, DATA);
		}

		// previous image
		else if ((args[0] == undefined || args[0] == '' || args[0] == 'up' || args[0] == '^' ||  args[0] == 'last') && message.attachments.size == 0) {
			return PreviousImage();
		}

		// Discord message URL
		else if (args[0].startsWith('https://discord.com/channels')) {
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
		}

		// Discord message ID
		else if (!isNaN(args[0])) {
			message.channel.messages.fetch(args[0]).then(msg => {
				if (msg.attachments.size > 0) {
					DATA = msg.attachments.first().url;
					return tile(message, DATA);
				}
				else return warnUser(message,`The message from the provided ID does not have any image attached.`);
			}).catch(error => {
				return warnUser(message,error);
			})
		}

		async function PreviousImage() {
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
				if (msg.embeds[0] !== undefined) {
					found = true;
					url = msg.embeds[0].image.url;
					break;
				}
			}

			if (found) await tile(message, url);
			else return warnUser(message,'No image found in the 10 previous messages.');
		}
	}
}
