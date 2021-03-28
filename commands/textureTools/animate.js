const prefix = process.env.PREFIX;

const Discord = require('discord.js');
const strings = require('../../res/strings');
const colors  = require('../../res/colors');

const { animate }   = require('../../functions/animate.js');
const { warnUser }  = require('../../functions/warnUser.js');
const { parseArgs } = require('../../functions/utility/parseArgs.js');
const asyncTools    = require('../../helpers/asyncTools.js');

module.exports = {
	name: 'animate',
	aliases: ['play'],
	description: strings.HELP_DESC_ANIMATE,
	guildOnly: false,
	uses: strings.COMMAND_USES_ANYONE,
	syntax: `${prefix}animate [-m] + file attached`,
	flags: '-m | --mcmeta : Boolean, set to false by default, set true if you want to give mcmeta information.',
	example: `${prefix}animate + file attached\n${prefix}animate --mcmeta=true + file attached`,
	async execute(client, message, args) {
		if (message.attachments.size == 0) return warnUser(message, 'You did not attach a texture.');

		args = parseArgs(args);

		let haveMCMETA = false;
		let mcmetaMessage;
		let mcmeta = {};
		
		for (var i in args) {
			if (args[i].startsWith('-m=') || args[i].startsWith('--mcmeta=')) {
				haveMCMETA = args[i].replace('-m=', '').replace('--mcmeta=', '');
				break;
			}
		}

		if (typeof haveMCMETA === 'string' && haveMCMETA.toLowerCase() == 'true') {
			haveMCMETA = true;

			let embed = new Discord.MessageEmbed()
				.setColor(colors.BLUE)
				.setTitle('Waiting MCMETA:')
				.setDescription('Please, send a message following this example:\n\\`\\`\\`json //mcmeta file content here \\`\\`\\`\nYou should obtain something like this: ```//mcmeta file content here```')
				.setFooter('The bot stop searching for message if 🚫 is added to this message.');

			const embedMessage = await message.channel.send(embed);

			const msgFilter = m => m.author.id === message.author.id;

			embedMessage.channel.awaitMessages(msgFilter, { max: 1, time: 60000, errors: ['time'] })
				.then(async msg => {
					mcmetaMessage = msg.first();

					if (mcmetaMessage.content.startsWith('```json') && mcmetaMessage.content.endsWith('```')) {
						if (!embedMessage.deleted) await embedMessage.delete();

						try {
							mcmeta = JSON.parse(mcmetaMessage.content.replace('```json', '').replace('```', ''))
						}
						catch (err) {
							warnUser(mcmetaMessage, 'This is not a valid JSON Object.').then(async () => {
								if (!message.deleted) asyncTools.react(message,'❌');
								if (!embedMessage.deleted) await embedMessage.delete();
							});
							return;
						}

						asyncTools.react(mcmetaMessage, '⌛');
						return animate(message, mcmeta, message.attachments.first().url);
					} else {
						warnUser(mcmetaMessage, 'Wrong format given!').then(async () => {
							if (!message.deleted) asyncTools.react(message, '❌');
							if (!embedMessage.deleted) await embedMessage.delete();
						});	
					}
				})
				.catch(collected => {
					if (!embedMessage.deleted && !mcmetaMessage) asyncTools.react(embedMessage, '🚫');
				})

		}
		else return animate(message, mcmeta, message.attachments.first().url);
	}
}