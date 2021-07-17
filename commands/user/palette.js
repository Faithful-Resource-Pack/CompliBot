const prefix = process.env.PREFIX;

const strings = require('../../resources/strings');

const { palette }  = require('../../functions/textures/palette');
const { warnUser } = require('../../helpers/warnUser');

module.exports = {
	name: 'palette',
	aliases: ['p', 'colors', 'colormap', 'colours'],
	description: strings.HELP_DESC_PALETTE,
	guildOnly: false,
	uses: strings.COMMAND_USES_ANYONE,
	syntax: `${prefix}palette attach an image\n${prefix}palette <Discord message url>\n${prefix}palette <image URL>\n${prefix}palette <message ID>\n${prefix}palette [up/^/last]`,
	async execute(client, message, args) {
		var DATA;

		// <data>
		// image attached
		if ((args[0] == undefined || args[0] == '') && message.attachments.size > 0) {
			DATA = message.attachments.first().url;
			return palette(message, DATA);
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
					return palette(message, DATA);
				}
				else return warnUser(message, strings.COMMAND_MESSAGE_IMAGE_NOT_ATTACHED);
			}).catch(() => { return warnUser(message, strings.COMMAND_URL_ONLY_SAME_CHANNEL) });
		}

		// Image URL
		else if (args[0].startsWith('https://') || args[0].startsWith('http://')) {
			if (args[0].endsWith('.png') || args[0].endsWith('.jpeg') || args[0].endsWith('.jpg') || args[0].endsWith('.gif')) {
				DATA = args[0];
				return palette(message, DATA);
			} else return warnUser(message, strings.COMMAND_INVALID_EXTENSION)
		}

		// Discord message ID
		else if (!isNaN(args[0])) {
			message.channel.messages.fetch(args[0]).then(msg => {
				if (msg.attachments.size > 0) {
					DATA = msg.attachments.first().url;
					return palette(message, DATA);
				}
				else return warnUser(message, strings.COMMAND_ID_IMAGE_NOT_ATTACHED);
			}).catch(error => {
				return warnUser(message, error);
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
					else if (msg.content.startsWith('https://') || msg.content.startsWith('http://')) {
						if (msg.content.endsWith('.png') || msg.content.endsWith('.jpeg') || msg.content.endsWith('.jpg') || msg.content.endsWith('.gif')) {
							found = true;
							url = msg.content;
							break;
						}
					}
				} catch(e) {
					return warnUser(message, strings.COMMAND_NO_IMAGE_FOUND);
				}
			}

			if (found) await palette(message, url);
			else return warnUser(message, strings.COMMAND_NO_IMAGE_FOUND);
		}
	}
}