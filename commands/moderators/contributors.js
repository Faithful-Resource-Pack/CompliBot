const prefix  = process.env.PREFIX;

const strings = require('../../ressources/strings');

const { parseArgs }    = require('../../helpers/parseArgs');
const { pushToGitHub } = require('../../functions/pushToGitHub');
const { warnUser }     = require('../../helpers/warnUser');
const { date }         = require('../../helpers/date');
const { jsonContributionsJava, jsonContributionsBedrock } = require('../../helpers/fileHandler');

const uidT = process.env.UIDT;
const NO_TEXTURE_FOUND = -1

module.exports = {
	name: 'contributor',
	aliases: [ 'contributors' ],
	description: strings.HELP_DESC_CONTRIBUTORS,
	guildOnly: false,
	uses: strings.COMMAND_DISABLED,
	//uses: strings.COMMAND_USES_MODS,
	syntax: `${prefix}contributor -p -t -s -a [-A] [-u]\n${prefix}contributor update`,
	flags: '-p | --path:\nTexture path (folder + texture name)\n-t | --type:\nTexture type (java or bedrock)\n-s | --size:\nTexture Resolution (c32 or c64)\n-a | --author:\nTexture author (discord tag)\n-A | -Add:\nBoolean, true by default, remove author if set to false\n-u | --update:\nBoolean, false by default, push JSON to GitHub if set to true.',
	example: `${prefix}contributor -p=entity/slime/magmacube -t=java -s=c32 -a=Someone#1234 -u=true\n${prefix}contributor -p=entity/slime/magmacube -t=java -s=c32 -a=Someone#1234 -A=false`,
	async execute(client, message, args) {
		if (!message.member.hasPermission('ADMINISTRATOR') && message.author.id !== uidT) return warnUser(message, strings.COMMAND_NO_PERMISSION)

		return warnUser(message, 'NOT UPDATED TO THE NEW DATABASE SYSTEM')

		if (args[0] == 'update') {
			pushToGitHub('Compliance-Resource-Pack', 'JSON', 'main', `Manual Update executed by: ${message.author.username}`, `./json`);
			return await message.react('✅');
		}

		args = parseArgs(message, args);

		let havePath     = false;
		let haveType     = false;
		let haveSize     = false;
		let haveAuth     = false;
		let haveToAdd    = true;
		let haveToUpdate = false;

		let valPath;
		let valType;
		let valSize;
		let valAuth;
		let valToAdd;
		let valToUpdate;

		for (let i = 0; i < args.length; i++) {
			if (args[i].startsWith('-p=') || args[i].startsWith('--path=')) {
				havePath = true;
				valPath  = args[i].replace('-p=', '').replace('--path=', '');
			}
			if (args[i].startsWith('-t=') || args[i].startsWith('--type=')) {
				valType  = args[i].replace('-t=', '').replace('--type=', '');
				if (valType != 'java' && valType != 'bedrock') haveType = false;
				else haveType = true;
			}
			if (args[i].startsWith('-s=') || args[i].startsWith('--size=')) {
				valSize  = args[i].replace('-s=', '').replace('--size=', '');
				if (valSize != 'c32' && valSize != 'c64') haveType = false;
				else haveSize = true;
			}
			if (args[i].startsWith('-a=') || args[i].startsWith('--author=')) {
				valAuth  = args[i].replace('-a=', '').replace('--author=', '');
				if (!valAuth.includes('#')) haveAuth = false;
				else haveAuth = true;
			}
			if (args[i].startsWith('-A=') || args[i].startsWith('--Add=')) {
				valToAdd  = args[i].replace('-A=', '').replace('--Add=', '');
				if (valToAdd.toLowerCase() == 'false') haveToAdd = false;
				else haveToAdd = true;
			}
			if (args[i].startsWith('-u=') || args[i].startsWith('--update=')) {
				valToUpdate  = args[i].replace('-u=', '').replace('--update=', '');
				if (valToUpdate.toLowerCase() == 'true') haveToUpdate = true;
				else haveToUpdate = false;
			}
		}

		let warnMessage = '';
		if (!havePath) warnMessage += 'You must specify the texture path. ';
		if (!haveType) warnMessage += 'You must specify texture type (java or bedrock). ';
		if (!haveSize) warnMessage += 'You must specify the resolution of the pack (c32 or c64). ';
		if (!haveAuth) warnMessage += 'You must specify the author. ';
		if (warnMessage != '') return warnUser(message, warnMessage);

		// try to find user
		try {
			valAuth = client.users.cache.find(u => u.tag === valAuth).id;
		} catch(error) {
			return warnUser(message, strings.COMMAND_USER_DOESNT_EXIST);
		}

		// will be used later
		let textures;
		let textureFileHandle;

		let valIndex = NO_TEXTURE_FOUND;

		if (valType == 'java') {
			textureFileHandle = jsonContributionsJava;
			textures = await textureFileHandle.read();

			for (let i = 0; i < textures.length; i++) {
				if (textures[i].version[strings.LATEST_MC_JE_VERSION].includes(valPath)) {
					valIndex = i;
					break;
				}
			}

			textureFileHandle.release();
		} else {
			textureFileHandle = jsonContributionsBedrock;
			textures = await textureFileHandle.read();

			// find texture index
			for (let i = 0; i < textures.length; i++) {
				if (textures[i].version[strings.LATEST_MC_BE_VERSION].includes(valPath)) {
					valIndex = i;
					break;
				}
			}

			textureFileHandle.release();
		}

		if (valIndex == NO_TEXTURE_FOUND) return warnUser(message, strings.CONTRIBUTORS_UNKNOWN_TEXTURE);

		if (haveToAdd) setAuthor(valType, valIndex, valAuth, valSize);
		else {
			if (valType == 'java')    textureFileHandle = jsonContributionsJava;
			if (valType == 'bedrock') textureFileHandle = jsonContributionsBedrock;
			
			if (textures[valIndex][valSize].author == undefined) return warnUser(message, strings.CONTRIBUTORS_TEXTURE_NO_AUTHOR);
				
			// warn if user not in this texture
			if(!textures[valIndex][valSize].author.includes(valAuth)) return warnUser(message, strings.CONTRIBUTORS_AUTHOR_DOESNT_EXIST);
				
			// remove this bad boy
			if (textures[valIndex][valSize].author.length > 1) textures[valIndex][valSize].author = textures[valIndex][valSize].author.filter(item => item !== valAuth);
			else textures[valIndex][valSize] = {};

			await textureFileHandle.write(textures);
			textureFileHandle.release();
		}
		
		if (haveToUpdate) {
			pushToGitHub('Compliance-Resource-Pack', 'JSON', 'main', `Manual Update executed by: ${message.author.username}`, `./json`);
			return await message.react('✅');
		} else return await message.react('☑️');
	}
}

async function setAuthor(valType, valIndex, valAuth, valSize) {
	let fileHandle;
	let fileHandle2;
	let textures;

	if (valType == 'java')    fileHandle = jsonContributionsJava;
	if (valType == 'bedrock') fileHandle = jsonContributionsBedrock;

	textures = await fileHandle.read();

	if (valSize == 'c32') {
		if (!textures[valIndex].c32.date) textures[valIndex].c32.date = date();
		if (!textures[valIndex].c32.author) textures[valIndex].c32.author = [valAuth];
		else if (!textures[valIndex].c32.author.includes(valAuth)) textures[valIndex].c32.author.push(valAuth);
	}
	if (valSize == 'c64') {
		if (!textures[valIndex].c64.date) textures[valIndex].c64.date = date();
		if (!textures[valIndex].c64.author) textures[valIndex].c64.author = [valAuth];
		else if (!textures[valIndex].c64.author.includes(valAuth)) textures[valIndex].c64.author.push(valAuth);
	}

	if (valType == 'java' && textures[valIndex].isBedrock) {
		fileHandle2 = jsonContributionsBedrock;
		let texturesBedrock = await fileHandle2.read();

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