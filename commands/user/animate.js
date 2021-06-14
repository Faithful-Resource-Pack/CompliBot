const prefix = process.env.PREFIX

const Discord    = require('discord.js')
const strings    = require('../../ressources/strings')
const colors     = require('../../ressources/colors')
const asyncTools = require('../../helpers/asyncTools')

const { animate }   = require('../../functions/textures/animate')
const { warnUser }  = require('../../helpers/warnUser')
const { parseArgs } = require('../../helpers/parseArgs')
const { jsonContributionsJava, jsonContributionsBedrock } = require('../../helpers/fileHandler')

module.exports = {
	name: 'animate',
	aliases: ['play'],
	description: strings.HELP_DESC_ANIMATE,
	guildOnly: false,
	uses: strings.COMMAND_USES_ANYONE,
	syntax: `${prefix}animate [-c | -m] [-u | file attached]`,
	flags: '-c | --custom : Boolean, set to false by default, set true if you want to give custom mcmeta settings.\n-m | --mcmeta : String, give texture name to find mcmeta, if none exist, default settings will be applied.',
	example: `${prefix}animate + file attached\n${prefix}animate --mcmeta=true + file attached\n${prefix}play -u=https://discord.com/channels/.../.../...`,
	async execute(client, message, args) {

		let valURL;
		if (message.attachments.size > 0) valURL = message.attachments.first().url;

		args = parseArgs(message, args);

		let haveMCMETA = false;
		let haveCustom = false;
		let valMCMETA;
		let valCustom;
		let mcmetaMessage;
		let mcmeta = {};
		
		for (var i in args) {
			if (args[i].startsWith('-c=') || args[i].startsWith('--custom=')) {
				valCustom = args[i].replace('-c=', '').replace('--custom=', '');
				if (typeof valCustom === 'string' && valCustom.toLowerCase() == 'true') haveCustom = true;
			}
			if (args[i].startsWith('-m=') || args[i].startsWith('--mcmeta=')) {
				haveMCMETA = true;
				valMCMETA  = args[i].replace('-m=', '').replace('--mcmeta=', '');
			}
		}

		if (haveMCMETA && !haveCustom) {
			let index  = -1;
			let textures;
			let fileHandle;

			fileHandle = jsonContributionsJava;
			textures   = await fileHandle.read();

			console.log(valMCMETA);

			for (const i in textures) {
				if (textures[i].version[settings.LATEST_MC_JE_VERSION].includes(valMCMETA)) {
					index = i;
					break;
				}
			}

			fileHandle.release();

			// not found in java
			if (index == -1) {
				fileHandle = jsonContributionsBedrock;
				textures   = await fileHandle.read();

				for (const i in textures) {
					if (textures[i].version[settings.LATEST_MC_BE_VERSION].includes(valMCMETA)) {
						index = i;
						break;
					}
				}
			}


			if (index != -1 && textures[index].animated) {
				if (valURL) return animate(message, textures[index].mcmeta, valURL);
				else return previousImage(message, textures[index].mcmeta);
			}
			else if (index == -1) return warnUser(message, 'Texture not found.');
			else if (!textures[index].animated) return warnUser(message, 'This texture is not animated by default, please use -c=true instead and provide a MCMETA config.');

		}
		else if (haveCustom && !haveMCMETA) {
			let embed = new Discord.MessageEmbed()
				.setColor(colors.BLUE)
				.setTitle('Waiting for MCMETA config:')
				.setDescription('Please, send a message following this example:\n\\`\\`\\`json //mcmeta file content here \\`\\`\\`\nYou should obtain something like this: ```//mcmeta file content here```')
				.setFooter('The bot stop searching for message if 🚫 is added to this message.');

			const embedMessage = await message.inlineReply(embed);

			const msgFilter = m => m.author.id === message.author.id;

			embedMessage.channel.awaitMessages(msgFilter, { max: 1, time: 60000, errors: ['time'] })
				.then(async msg => {
					mcmetaMessage = msg.first();

					if ((mcmetaMessage.content.startsWith('```json') || mcmetaMessage.content.startsWith('```')) && mcmetaMessage.content.endsWith('```')) {
						if (!embedMessage.deleted) await embedMessage.delete();

						try {
							mcmeta = JSON.parse(mcmetaMessage.content.replace('```json', '').replace('```', '').replace('```', ''))
						}
						catch (err) {
							warnUser(mcmetaMessage, 'This is not a valid JSON Object.').then(async () => {
								if (!message.deleted) asyncTools.react(message,'❌');
								if (!embedMessage.deleted) await embedMessage.delete();
							});
							return;
						}

						asyncTools.react(mcmetaMessage, '⌛');
						if (valURL) return animate(message, mcmeta, valURL);
						else return previousImage(message, mcmeta);
					} else {
						warnUser(mcmetaMessage, 'Wrong format given!').then(async () => {
							if (!message.deleted) asyncTools.react(message, '❌');
							if (!embedMessage.deleted) await embedMessage.delete();
						});	
					}
				})
				.catch(() => {
					if (!embedMessage.deleted && !mcmetaMessage) asyncTools.react(embedMessage, '🚫');
				})

		}
		else if (haveCustom && haveMCMETA) {
			return warnUser(message, 'You can\'t specify both args at once.');
		}
		else if(valURL) return animate(message, mcmeta, valURL);
		else return previousImage(message, mcmeta);
	}
}

async function previousImage(message, mcmeta) {
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

	if (found) await animate(message, mcmeta, url);
	else return warnUser(message, strings.COMMAND_NO_IMAGE_FOUND);
}