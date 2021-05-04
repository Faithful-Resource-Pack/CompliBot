const prefix = process.env.PREFIX;

const Discord = require('discord.js');
const fs      = require('fs');
const fetch   = require('node-fetch');
const strings = require('../../res/strings');
const colors  = require('../../res/colors');
const settings = require('../../settings.js');

const { date }      = require('../../functions/utility/date.js');
const { warnUser }  = require('../../functions/warnUser.js');
const { doPush }    = require('../../functions/doPush.js');
const { jsonContributionsJava, jsonContributionsBedrock } = require('../../helpers/fileHandler');

const BE_BRANCHES = [ '1.16.210' ];
const JE_BRANCHES = [ '1.12.2', '1.13.2', '1.14.4', '1.15.2', '1.16.5', '1.17' ];

module.exports = {
	name: 'instapass',
	description: strings.HELP_DESC_INSTAPASS,
	guildOnly: true,
	uses: strings.COMMAND_USES_MODS,
	syntax: `${prefix}instapass <message URL>`,
	flags: 'No flags',
	example: `${prefix}instapass https://discord.com/channels/.../.../...`,
	async execute(client, message, args) {

		if(!message.member.hasPermission('ADMINISTRATOR')) return warnUser(message, strings.COMMAND_NO_PERMISSION);

		if(!args || !args[0]) return warnUser(message, `${strings.COMMAND_WRONG_ARGUMENTS_GIVEN}\nMissing Discord message URL as first argument.`)

		let valURL = args[0];

		if (valURL.startsWith('https://discord.com/channels')) {
			message.channel.messages.fetch(valURL.split('/').pop()).then(async msg => {
				if (msg.attachments.size > 0) {

					let folder;
					let name;
					let textures;
					let valSize;
					let valType;
					let valRepo;
					let valIndex;

					args = msg.content.split(/ +/);
					
					folder = args[1].split('[').pop().split(']')[0];
					name   = args[0];

					if (msg.channel.id === settings.C32_SUBMIT_1 || msg.channel.id === settings.C64_SUBMIT_1) valType = 'java';
					else if (msg.channel.id === settings.C32_SUBMIT_1B || msg.channel.id === settings.C64_SUBMIT_1B) valType = 'bedrock';

					if (name === undefined || name == '') name = 'Not Provided';
					if (!valType) valType = 'java';

					if (message.guild.id === settings.C32_ID) {
						valSize = 32;
						if (valType == 'java') valRepo = 'Compliance-Java-32x';
						if (valType == 'bedrock') valRepo = 'Compliance-Bedrock-32x';
					}
					if (message.guild.id === settings.C64_ID) {
						valSize = 64;
						if (valType == 'java') valRepo = 'Compliance-Java-64x';
						if (valType == 'bedrock') valRepo = 'Compliance-Bedrock-64x';
					}

					let valPath = `${folder}/${name}.png`;

					if (valType == 'java') {
						textures = await jsonContributionsJava.read();

						for (const i in textures) {
							if (textures[i].version[strings.LATEST_MC_JE_VERSION].includes(valPath)) {
								valIndex = i;
								break;
							}
						}

						jsonContributionsJava.release();
					}
					else if (valType == 'bedrock') {
						textures = await jsonContributionsBedrock.read();

						for (const i in textures) {
							if (textures[i].version[strings.LATEST_MC_BE_VERSION].includes(valPath)) {
								valIndex = i;
								break;
							}
						}

						jsonContributionsBedrock.release();
					}

					if (!valIndex) return warnUser(message, `Can't find ${valPath} inside JSON.`);

					await setAuthor(valType, valIndex, `${msg.author.id}`, valSize);
					await download(msg, valType, valIndex, valRepo, valSize);
					await doPush(`Instapass for ${valPath.split('/').pop()} executed by: ${message.author.username}`);
					await msg.reactions.cache.get('⬆️').remove();
					await msg.reactions.cache.get('⬇️').remove();
					await msg.react('⏩');

					const embed = new Discord.MessageEmbed()
						.setTitle(`Instapassed texture:`)
						.setColor(colors.COUNCIL)
						.setDescription(`The council has decided to instapass this [texture](${valURL})`);

					await message.channel.send(embed);
					if (!message.deleted) message.delete();

				} else return warnUser(message, strings.COMMAND_MESSAGE_IMAGE_NOT_ATTACHED);
			}).catch(error => {
				console.log('\n\n ------------------ INSTAPASS ERROR ------------------\n');
				console.error(error);
				console.log('\n -----------------------------------------------------');
				return warnUser(message, `${error}.\nI can only fetch images from the same channel. Don\'t ask why, I don\'t know myself.`)
			});
		}

	}
}

async function download(message, valType, valIndex, valRepo, valSize) {
	let fileHandle;
	let textures;

	if (valType == 'java') {
		fileHandle = jsonContributionsJava;
		textures = await fileHandle.read();

		for (const i in JE_BRANCHES) {
			await download_branch(message.attachments.first().url, textures[valIndex].version[JE_BRANCHES[i]], valRepo, JE_BRANCHES[i]);
		}

		// Also download to bedrock repo if it's also a bedrock texture;
		if (textures[valIndex].isBedrock) {
			for (const i in BE_BRANCHES) {
				await download_branch(message.attachments.first().url, textures[valIndex].bedrock[BE_BRANCHES[i]], `Compliance-Bedrock-${valSize}x`, BE_BRANCHES[i])
			}
		}
	}

	if (valType == 'bedrock') {
		fileHandle = jsonContributionsBedrock;
		textures = await fileHandle.read();
	
		for (const i in BE_BRANCHES) {
			await download_branch(message.attachments.first().url, textures[valIndex].version[BE_BRANCHES[i]], valRepo, BE_BRANCHES[i]);
		}
	}
	
	fileHandle.release();
}

async function download_branch(valURL, valPath, valRepo, valBranch) {
	if (valPath == null || valPath == undefined) return;

	let valPathLocal;
	if      (valRepo == 'Compliance-Java-32x')    valPathLocal = `./texturesPush/Compliance-Java-32x/${valBranch}/assets/${valPath}`;
	else if (valRepo == 'Compliance-Java-64x')    valPathLocal = `./texturesPush/Compliance-Java-64x/${valBranch}/assets/${valPath}`;
	else if (valRepo == 'Compliance-Bedrock-32x') valPathLocal = `./texturesPush/Compliance-Bedrock-32x/${valBranch}/${valPath}`;
	else if (valRepo == 'Compliance-Bedrock-64x') valPathLocal = `./texturesPush/Compliance-Bedrock-64x/${valBranch}/${valPath}`;

	const response = await fetch(valURL);
	const buffer   = await response.buffer();
	await fs.promises.mkdir(valPathLocal.substr(0, valPathLocal.lastIndexOf('/')), {recursive: true}).catch(console.error);
	await fs.writeFile(valPathLocal, buffer, () => console.log(`ADDED: ${valPath.split('/').pop()}\nTO: ${valPathLocal}\n`));
}

async function setAuthor(valType, valIndex, valAuth, valSize) {
	let fileHandle;
	let fileHandle2;
	let textures;

	if (valType == 'java')    fileHandle = jsonContributionsJava;
	if (valType == 'bedrock') fileHandle = jsonContributionsBedrock;

	textures = await fileHandle.read();

	if (valSize == 32) {
		if (!textures[valIndex].c32.date) textures[valIndex].c32.date = date();
		if (!textures[valIndex].c32.author) textures[valIndex].c32.author = [valAuth];
		else if (!textures[valIndex].c32.author.includes(valAuth)) textures[valIndex].c32.author.push(valAuth);
	}
	if (valSize == 64) {
		if (!textures[valIndex].c64.date) textures[valIndex].c64.date = date();
		if (!textures[valIndex].c64.author) textures[valIndex].c64.author = [valAuth];
		else if (!textures[valIndex].c64.author.includes(valAuth)) textures[valIndex].c64.author.push(valAuth);
	}

	if (valType == 'java' && textures[valIndex].isBedrock) {
		fileHandle2 = jsonContributionsBedrock;
		texturesBedrock = await fileHandle2.read();

		for (const i in texturesBedrock) {
			if (texturesBedrock[i].version[strings.LATEST_MC_BE_VERSION].includes(textures[valIndex].bedrock[strings.LATEST_MC_BE_VERSION])) {
				fileHandle2.release(); // need to be before recursive to avoid infinite task
				await setAuthor('bedrock', i, valAuth, valSize)
				break;
			}
		}
	}

	if (valType == 'java')    await jsonContributionsJava.write(textures);
	if (valType == 'bedrock') await jsonContributionsBedrock.write(textures);

	fileHandle.release();

}