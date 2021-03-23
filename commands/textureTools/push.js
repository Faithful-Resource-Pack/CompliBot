const prefix = process.env.PREFIX;

const Discord = require('discord.js');
const fs      = require('fs');
const fetch   = require('node-fetch');
const strings = require('../../res/strings');
const colors  = require('../../res/colors');

const { warnUser } = require('../../functions/warnUser.js');
const { doPush }   = require('../../functions/doPush.js');
const { jsonContributionsJava, jsonContributionsBedrock } = require('../../helpers/fileHandler');

const TEXTURE_NOT_FOUND = -1

module.exports = {
	name: 'push',
	description: strings.HELP_DESC_PUSH,
	guildOnly: false,
	uses: strings.COMMAND_USES_MODS,
	syntax: `${prefix}push <repo> <author> <folder> <texturename> + attach file\n${prefix}push done`,
	async execute(client, message, args) {
		// if not administrator get out
		if(!message.member.hasPermission('ADMINISTRATOR'))
			return warnUser(message,strings.COMMAND_NO_PERMISSION)

		// if incorrect args get out
		if((!Array.isArray(args)) || args[0] === undefined)
			return warnUser(message,strings.COMMAND_NO_ARGUMENTS_GIVEN)

		const repoArg = args[0]
		const repositories = ['Compliance-Java-32x','Compliance-Java-64x','Compliance-Bedrock-32x','Compliance-Bedrock-64x']
		if (!repositories.includes(repoArg))
			return warnUser(message, 'This repository isn\'t supported')
		if (message.attachments.size == 0)
			return warnUser(message, 'You did not attached the texture!')

		// find good author
		const textureAuthorArg = args[1]
		let textureAuthorID
		try {
			const tmpAuthorId = client.users.cache.find(u => u.tag === textureAuthorArg).id
			textureAuthorID = tmpAuthorId
		} catch(error) {
			return warnUser(message, 'User not found in cache')
		}

		let texturePath = args[2]
		let textureFilename = args[3].replace('.png','') + '.png'

		let textures
		let texturesBedrock
		let fileHandle = undefined

		let searchPath

		let i
		let textureIndex = TEXTURE_NOT_FOUND
		let textureEdition = undefined

		// Realms path tweaks
		if (texturePath.includes("realms"))
			searchPath = "realms/textures/" + texturePath.replace("realms/textures/","") + "/" + textureFilename
		else
			searchPath = "minecraft/textures/" + texturePath.replace("minecraft/textures/","") + "/" + textureFilename
		
		fileHandle = jsonContributionsJava
		textures = await fileHandle.read()

		try {
			// find in JAVA edition
			i = 0
			while (i < textures.length && textureIndex === TEXTURE_NOT_FOUND) {
				if (textures[i].version[strings.LATEST_MC_JE_VERSION].includes(searchPath)) {
					textureIndex = i
					textureEdition  = 'java'
				}
				++i
			}

			// if not found in java release the lock
			if(textureIndex === TEXTURE_NOT_FOUND) {
				fileHandle.release()

				// find in BEDROCK edition
				fileHandle = jsonContributionsBedrock
				texturesBedrock = await fileHandle.read()

				const searchBedrock = "textures/" + texturePath.replace("textures/","") + "/" + textureFilename;
				i = 0
				while(i < texturesBedrock.length && textureIndex === TEXTURE_NOT_FOUND) {
					if (texturesBedrock[i].version[LATEST_MC_BE_VERSION].includes(searchBedrock)) {
						textureIndex   = i;
						textureEdition = 'bedrock';
					}
					++i
				}
			}

			// if still after bedrock and java not found, throw exception
			if(textureIndex === TEXTURE_NOT_FOUND)
				throw 'Texture not found.'

			// ADD CONTRIBUTORS TO JSON
			if (textureEdition == 'bedrock' && args[0].includes('32x')) {
				if (texturesBedrock[textureIndex].c32.author == undefined) {
					texturesBedrock[textureIndex].c32.author = [ textureAuthorID ];
				}
				else {
					var authors = texturesBedrock[textureIndex].c32.author;
					if (authors.includes(textureAuthorID) == false) {
						texturesBedrock[textureIndex].c32.author.push(textureAuthorID);
					}
				}

				if (texturesBedrock[textureIndex].c32.date == undefined) texturesBedrock[textureIndex].c32.date = date();
			}
			if (textureEdition == 'bedrock' && args[0].includes('64x')) {
				if (texturesBedrock[textureIndex].c64.author == undefined) {
					texturesBedrock[textureIndex].c64.author = [ textureAuthorID ];
				}
				else {
					var authors = texturesBedrock[textureIndex].c64.author;
					if (authors.includes(textureAuthorID) == false) {
						texturesBedrock[textureIndex].c64.author.push(textureAuthorID);
					}
				}

				if (texturesBedrock[textureIndex].c64.date == undefined) texturesBedrock[textureIndex].c64.date = date();
			}
			if (textureEdition == 'java' && args[0].includes('32x')) {
				if (textures[textureIndex].c32.author == undefined) {
					textures[textureIndex].c32.author = [ textureAuthorID ];
				}
				else {
					var authors = textures[textureIndex].c32.author;
					if (authors.includes(textureAuthorID) == false) {
						textures[textureIndex].c32.author.push(textureAuthorID);
					}
				}

				if (textures[textureIndex].c32.date == undefined) textures[textureIndex].c32.date = date();
			}
			if (textureEdition == 'java' && args[0].includes('64x')) {
				if (textures[textureIndex].c64.author == undefined) {
					textures[textureIndex].c64.author = [ textureAuthorID ];
				}
				else {
					var authors = textures[textureIndex].c64.author;
					if (authors.includes(textureAuthorID) == false) {
						textures[textureIndex].c64.author.push(textureAuthorID);
					}
				}

				if (textures[textureIndex].c64.date == undefined) textures[textureIndex].c64.date = date();
			}

			// UPDATE JSON
			path = undefined;
			if (textureEdition == 'bedrock') {
				await jsonContributionsBedrock.write(texturesBedrock);
				path = searchBedrock;
			} else if (textureEdition == 'java') {
				await jsonContributionsJava.write(textures);
				path = searchPath;
			}
	
			if (textureEdition == 'java') {
				await download_branch(message.attachments.first().url, textures[textureIndex].version['1.17'],   args[0], textureFilename, '1.17'  , 'java');
				await download_branch(message.attachments.first().url, textures[textureIndex].version['1.16.5'], args[0], textureFilename, '1.16.5', 'java');
				await download_branch(message.attachments.first().url, textures[textureIndex].version['1.15.2'], args[0], textureFilename, '1.15.2', 'java');
				await download_branch(message.attachments.first().url, textures[textureIndex].version['1.14.4'], args[0], textureFilename, '1.14.4', 'java');
				await download_branch(message.attachments.first().url, textures[textureIndex].version['1.13.2'], args[0], textureFilename, '1.13.2', 'java');
				await download_branch(message.attachments.first().url, textures[textureIndex].version['1.12.2'], args[0], textureFilename, '1.12.2', 'java');
			}
			else if (textureEdition == 'bedrock') {
				await download_branch(message.attachments.first().url, texturesBedrock[textureIndex].version['1.16.210'], args[0], textureFilename, '1.16.210', 'bedrock');
			}
			
			await doPush(`Manual Push for ${textureFilename} executed by: ${message.author.username}`);
			await message.react('✅');
		} catch (error) {
			if(fileHandle !== undefined)
				fileHandle.release()
			warnUser(message, error.toString())
		}
	}
}

async function download_branch(url, path, type, name, branch, type) {
	if (path == null || path == undefined) return;

	var localPath = undefined;
	if      (type == 32 && type == 'java')    localPath = `./texturesPush/Compliance-Java-32x/${branch}/assets/${path}`;
	else if (type == 64 && type == 'java')    localPath = `./texturesPush/Compliance-Java-64x/${branch}/assets/${path}`;
	else if (type == 32 && type == 'bedrock') localPath = `./texturesPush/Compliance-Bedrock-32x/${branch}/${path}`;
	else if (type == 64 && type == 'bedrock') localPath = `./texturesPush/Compliance-Bedrock-64x/${branch}/${path}`;

	const response = await fetch(url);
	const buffer   = await response.buffer();
	await fs.promises.mkdir(localPath.substr(0, localPath.lastIndexOf('/')), {recursive: true}).catch(console.error);
	await fs.writeFile(localPath, buffer, () => console.log(`ADDED: ${name}\nTO: ${localPath}\n`));
}

async function download(url, type, path, name) {
	var localPath = undefined;
	if (type == 'Compliance-Bedrock-32x') localPath = `./texturesPush/Compliance-Bedrock-32x/${path}`
	else if (type == 'Compliance-Bedrock-64x') localPath = `./texturesPush/Compliance-Bedrock-64x/${path}`
	else return warnUser(message, 'Something went wrong');

 	const response = await fetch(url);
	const buffer   = await response.buffer();
	await fs.promises.mkdir(localPath.substr(0, localPath.lastIndexOf('/')), { recursive: true }).catch(console.error);
	await fs.writeFile(localPath, buffer, () => console.log(`ADDED: ${name}\nTO: ${localPath}\n`));
}

function date() {
	var today = new Date();
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = today.getFullYear();
	return mm + '/' + dd + '/' + yyyy;
}

function isEmptyDir(dirname){
	if (!fs.existsSync(dirname)) return true;
	else return false;
}