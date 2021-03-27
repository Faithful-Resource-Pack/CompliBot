const prefix = process.env.PREFIX;

const strings = require('../../res/strings');

const { magnify }  = require('../../functions/magnify.js');
const { warnUser } = require('../../functions/warnUser.js');

module.exports = {
	name: 'magnify',
	aliases: ['zoom', 'scale', 'resize', 'm'],
	description: strings.HELP_DESC_MAGNIFY,
	guildOnly: false,
	uses: strings.COMMAND_USES_ANYONE,
	syntax: `${prefix}magnify <factor> & attach an image\n${prefix}magnify <factor> <Discord message url>\n${prefix}magnify <factor> <image URL>\n${prefix}magnify <factor> <message ID>\n${prefix}magnify <factor> [up/^/last]`,
	async execute(client, message, args) {
		let FACTOR;
		let DATA;

		if (args != '') {

			// <factor>
			if (!isNaN(args[0]) && args[0] > 1) {
				FACTOR = args[0];
			} else return warnUser(message,'The factor must be greater than 1.')

			// <data>
			// image attached
			if ((args[1] == undefined || args[1] == '') && message.attachments.size > 0) {
				DATA = message.attachments.first().url;
				return magnify(message, FACTOR, DATA);
			}

			// previous image
			else if ((args[1] == undefined || args[1] == '' || args[1] == 'up' || args[1] == '^' || args[1] == 'last') && message.attachments.size == 0) {
				return PreviousImage(FACTOR);
			}

			// Discord message URL
			else if (args[1].startsWith('https://discord.com/channels')) {
				message.channel.messages.fetch(args[1].split('/').pop()).then(msg => {
					if (msg.attachments.size > 0) {
						DATA = msg.attachments.first().url;
						return magnify(message, FACTOR, DATA);
					}
					else return warnUser(message,`The message from the provided URL does not have any image attached.`);
				}).catch(error => { return warnUser(message,error + '. I can only magnify images from the same channel. Don\'t ask why, I don\'t know myself.') });
			}

			// Image URL
			else if (args[1].startsWith('https://') || args[1].startsWith('http://')) {
				if (args[1].endsWith('.png') || args[1].endsWith('.jpeg') || args[1].endsWith('.jpg') || args[1].endsWith('.gif')) {
					DATA = args[1];
					return magnify(message, FACTOR, DATA);
				} else return warnUser(message,`Image extension is not supported`)
			}

			// Discord message ID
			else if (!isNaN(args[1])) {
				message.channel.messages.fetch(args[1]).then(msg => {
					if (msg.attachments.size > 0) {
						DATA = msg.attachments.first().url;
						return magnify(message, FACTOR, DATA);
					}
					else return warnUser(message,`The message from the provided ID does not have any image attached.`);
				}).catch(error => {
					return warnUser(message,error);
				})
			}
		} else return warnUser(message,`You did not provide any arguments.`);

		async function PreviousImage(FACTOR) {
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
				} catch(e) {
					return warnUser(message,'No image found in the 10 previous messages.');
				}
			}

			if (found) await magnify(message, FACTOR, url);
			else return warnUser(message,'No image found in the 10 previous messages.');
		}
	}
}
