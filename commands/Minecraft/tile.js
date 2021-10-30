const prefix = process.env.PREFIX;

const { string } = require('../../resources/strings');

const { tile } = require('../../functions/textures/tile');
const { warnUser } = require('../../helpers/warnUser');

module.exports = {
	name: 'tile',
	aliases: ['t'],
	description: string('command.description.tile'),
	category: 'Minecraft',
	guildOnly: false,
	uses: string('command.use.anyone'),
	syntax: `${prefix}tile [vertical/horizontal/grid/round/plus] + attach a file`,
	async execute(client, message, args) {
		const tileArgs = ['grid', 'g', 'vertical', 'v', 'horizontal', 'h', 'round', 'r', 'plus', 'p'];
		var DATA;

		if (!tileArgs.includes(args[0]) && args[0] != undefined) return warnUser(message, string('command.args.invalid.generic'));

		// <data>
		// image attached
		if ((args[0] == undefined || tileArgs.includes(args[0])) && message.attachments.size > 0) {
			DATA = message.attachments.first().url;
			return tile(message, DATA, args[0]);
		}

		// replying to message
		else if (message.reference) {
			message.channel.messages.fetch(message.reference.messageId).then(msg => {
				if (msg.attachments.size > 0) {
					DATA = msg.attachments.first().url;
					return tile(message, DATA, args[0]);
				}
				else return warnUser(message, string('ccommand.image.no_reply_attachment'));
			}).catch(error => {
				return warnUser(message, error);
			})
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
				else return warnUser(message, `The message from the provided URL does not have any image attached.`);
			}).catch(error => { return warnUser(message,error + ' The message URL needs to be from the same channel') });
		}

		// Image URL
		else if (args[0].startsWith('https://') || args[0].startsWith('http://')) {
			if (args[0].endsWith('.png') || args[0].endsWith('.jpeg') || args[0].endsWith('.jpg')) {
				DATA = args[0];
				return tile(message, DATA);
			} else return warnUser(message, `Image extension is not supported`)
		}*/

		async function PreviousImage(type) {
			/**
			 * DO NOT DELETE THE COMMENTS IN THIS FUNCTION!
			 * Right now this function is using a workaround for something that was broken by discord.js v13 and may possibly work again in the future.
			 */

			if (type == undefined) type = 'grid'; // security

			var found = false;
			//var messages = [];
			var list_messages = await message.channel.messages.fetch({ limit: 10 });
			var lastMsg = list_messages.sort((a, b) => b.createdTimestamp - a.createdTimestamp).filter((m) => m.attachments.size > 0 || m.embeds[0] != undefined).first();
			//messages.push(...list_messages.array());

			//for (var i in messages) {
			//var msg = messages[i]
			var url = '';
			try {
				if (lastMsg.attachments.size > 0) {
					found = true;
					url = lastMsg.attachments.first().url;
					//break;
				}
				else if (lastMsg.embeds[0] != undefined && lastMsg.embeds[0] != null && lastMsg.embeds[0].image) {
					found = true;
					url = lastMsg.embeds[0].image.url;
					//break;
				}
				else if (lastMsg.content.startsWith('https://') || lastMsg.content.startsWith('http://')) {
					if (lastMsg.content.endsWith('.png') || lastMsg.content.endsWith('.jpeg') || lastMsg.content.endsWith('.jpg') || lastMsg.content.endsWith('.gif')) {
						found = true;
						url = lastMsg.content;
						//break;
					}
				}
			} catch (e) {
				return warnUser(message, string('command.image.not_found_in_10_last'));
			}
			//}

			if (found) await tile(message, url, type);
			else return warnUser(message, string('command.image.not_found_in_10_last'));
		}
	}
}
