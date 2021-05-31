const prefix  = process.env.PREFIX;
const fs      = require('fs');
const fetch   = require('node-fetch');
const strings = require('../../ressources/strings');

const REPOSITORIES = [
	'Compliance-Java-32x',
	'Compliance-Java-64x',
	'Compliance-Bedrock-32x',
	'Compliance-Bedrock-64x'
]

const BE_BRANCHES = [ '1.16.210' ];
const JE_BRANCHES = [ '1.12.2', '1.13.2', '1.14.4', '1.15.2', '1.16.5', '1.17' ];

const { parseArgs } = require('../../helpers/parseArgs.js');
const { date }      = require('../../helpers/date.js');
const { warnUser }  = require('../../helpers/warnUser.js');
const { doPush }    = require('../../functions/doPush.js');
const { jsonContributionsJava, jsonContributionsBedrock } = require('../../helpers/fileHandler');

module.exports = {
	name: 'push',
	description: strings.HELP_DESC_PUSH,
	guildOnly: false,
	uses: strings.COMMAND_USES_MODS,
	syntax: `${prefix}push -r -p -a + file attached`,
	flags: '-r | --repo :\n\tCompliance-[Java|Bedrock]-[32x-64x]\n-p | --path :\n\tTexture path \n-a | --author :\n\tDiscord tag of texture\'s author.',
	example: `${prefix}push -r=Compliance-Java-32x -p=textures/block/stone.png -a=Someone#1234`,
	async execute(client, message, args) {

		if(!message.member.hasPermission('ADMINISTRATOR')) return warnUser(message, strings.COMMAND_NO_PERMISSION);

		args = parseArgs(message, args);
		//console.log(args)

		var haveAuth = false;
		var havePath = false;
		var haveRepo = false;

		let valAuth;
		let valPath;
		let valRepo;
		let valIndex;
		let valType;
		let valSize;

		let fileHandle;
		let textures;

		// Check args:
		for (var i in args) {
			if (args[i].startsWith('-a=') || args[i].startsWith('--author=')) {
				haveAuth = true; 
				valAuth = args[i].replace('-a=', '').replace('--author=', '');
			}
			if (args[i].startsWith('-p=') || args[i].startsWith('--path=')) {
				havePath = true; 
				valPath = args[i].replace('-p=', '').replace('--path=', '');
			}
			if (args[i].startsWith('-r=') || args[i].startsWith('--repo=')) {
				haveRepo = true;
				valRepo = args[i].replace('-r=', '').replace('--repo=');
			}
		}

		var warnMessage = '';
		if (!haveAuth) warnMessage += strings.PUSH_ARG1_INVALID;
		if (!havePath) warnMessage += strings.PUSH_ARG2_INVALID;
		if (!haveRepo) warnMessage += strings.PUSH_ARG3_INVALID;
		if (message.attachments.size == 0) warnMessage += strings.PUSH_NOT_ATTACHED;
		if (warnMessage != '') return warnUser(message, warnMessage);

		// Check repository:
		if (!REPOSITORIES.includes(valRepo)) return warnUser(message, strings.PUSH_INVALID_REPO);
		if (REPOSITORIES.indexOf(valRepo) == 0 || REPOSITORIES.indexOf(valRepo) == 2) valSize = 32;
		else valSize = 64;

		// fetch author ID:
		try {
			valAuth = client.users.cache.find(u => u.tag === valAuth).id;
		} catch(error) {
			console.log('\n\n -------------- USER NOT FOUND IN CACHE --------------\n');
			console.error(error);
			console.log('\n -----------------------------------------------------');
			return warnUser(message, strings.PUSH_USER_NOT_FOUND);
		}

		// Start search trough JAVA textures:
		fileHandle = jsonContributionsJava;
		textures   = await fileHandle.read();

		for (const i in textures) {
			if (textures[i].version[strings.LATEST_MC_JE_VERSION].includes(valPath)) {
				valIndex = i;
				valType  = 'java';
				break;
			}
		}

		fileHandle.release();

		// Start search trough BEDROCK textures:
		if (!valType) {
			fileHandle = jsonContributionsBedrock;
			textures   = await fileHandle.read();

			for (const i in textures) {
				if (textures[i].version[strings.LATEST_MC_BE_VERSION].includes(valPath)) {
					valIndex = i;
					valType  = 'bedrock';
					break;
				}
			}

			fileHandle.release();
		}

		if (!valType) return warnUser(message, strings.PUSH_TEXTURE_NOT_FOUND)
		else {
			await setAuthor(valType, valIndex, valAuth, valSize);
			await download(message, valType, valIndex, valRepo, valSize);
			await doPush(`Manual Push for ${valPath.split('/').pop()} executed by: ${message.author.username}`);
			await message.react('✅');
		}

		// console.log(valAuth, valRepo, valPath, valIndex, valType, valSize);
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