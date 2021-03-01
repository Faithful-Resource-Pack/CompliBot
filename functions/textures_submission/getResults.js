const Discord  = require('discord.js');
const settings = require('../../settings.js');
const colors   = require('../../res/colors.js');
const strings  = require('../../res/strings.js');
const fs       = require('fs');
const fetch    = require('node-fetch');

const { date } = require('../utility/date.js');
const { getMessages } = require('../getMessages.js');
const { jsonContributionsBedrock, jsonContributionsJava } = require('../../helpers/fileHandler.js');

async function getResults(client, inputID, OFFSET_DAY = 0) {

	// get contributor files:
	var texturesBedrock = await jsonContributionsBedrock.read();
	var texturesJava    = await jsonContributionsJava.read();

	// invisible try
	try {

	// set offset (used for development);
	var offsetDate = new Date();
	offsetDate.setDate(offsetDate.getDate() - OFFSET_DAY);

	// get message list:
	let messages = await getMessages(client, inputID);

	for (var i in messages) {
		let message     = messages[i];
		let messageDate = new Date(message.createdTimestamp);

		// if message is an embed && offset date == message date && embed color is green
		if (
			message.embeds[0] != undefined && 
			message.embeds[0].color == 5025616 && 
			messageDate.getDate() == offsetDate.getDate() && 
			messageDate.getMonth() == offsetDate.getMonth()) 
		{
			var textureAuthor   = message.embeds[0].author.name;
			var textureName   = message.embeds[0].fields[0].value.replace('.png','') + '.png';
			var textureFolder = message.embeds[0].fields[1].value;
			var textureType   = message.embeds[0].fields[2].value || undefined;
			var textureSize   = undefined;
			var textureIndex  = -1;

			try {
				var textureAuthorID = client.users.cache.find(u => u.tag === textureAuthor).id || undefined
			} catch (e) {
				errorAutoPush(client, inputID, message, textureAuthor, textureName, textureFolder, textureType, `Can't find user ID! the user may have changed his nickname, Juknum#6148 ≠ juknum#6148`)
			}

			var folder = undefined;
			var search = undefined;

			if (textureType == 'java') {
				if (textureFolder.includes('realms')) {
					folder = textureFolder.replace('realms/textures/','');
					search = `realms/textures/${folder}/${textureName}`;
				} else {
					folder = textureFolder.replace('minecraft/textures/','');
					search = `minecraft/textures/${folder}/${textureName}`;
				}

				for (var i = 0; i < texturesJava.length; i++) {
					if (texturesJava[i].version[strings.LATEST_MC_JE_VERSION].includes(search)) {
						textureIndex = i;
						if (inputID == settings.C32_RESULTS) textureSize = 32;
						if (inputID == settings.C64_RESULTS) textureSize = 64;
						break;
					}
				}
			} else if (textureType == 'bedrock') {
				folder = textureFolder.replace('textures/','');
				search = `textures/${folder}/${textureName}`;
					for (var i = 0; i < texturesBedrock.length; i++) {
					if (texturesBedrock[i].path.includes(search)) {
						textureIndex = i;
						if (inputID == settings.C32_RESULTS) textureSize = 32;
						if (inputID == settings.C64_RESULTS) textureSize = 64;
						break;
					}
				}
			} else errorAutoPush(client, inputID, message, textureAuthor, textureName, textureFolder, textureType, `No Resource Pack type set up!`);

			if (textureIndex == -1 && (textureType == 'java' || textureType == 'bedrock')) {
				errorAutoPush(client, inputID, message, textureAuthor, textureName, textureFolder, textureType, `Texture not found, check spelling or folder`);
			}

			if (textureIndex != -1 && (textureType == 'java' || textureType == 'bedrock')) {
				//////////////////////////////////////////
				if (textureSize == 32 && textureType == 'java') {
					if (texturesJava[textureIndex].c32.author == undefined) texturesJava[textureIndex].c32.author = [textureAuthorID];
					else if (!texturesJava[textureIndex].c32.author.includes(textureAuthorID)) texturesJava[textureIndex].c32.author.push(textureAuthorID);
					if (!texturesJava[textureIndex].c32.date == undefined) texturesJava[textureIndex].c32.date = date();

				}
				if (textureSize == 64 && textureType == 'java') {
					if (texturesJava[textureIndex].c64.author == undefined) texturesJava[textureIndex].c64.author = [textureAuthorID];
					else if (!texturesJava[textureIndex].c64.author.includes(textureAuthorID)) texturesJava[textureIndex].c64.author.push(textureAuthorID);
					if (!texturesJava[textureIndex].c64.date == undefined) texturesJava[textureIndex].c64.date = date();
				}
				//////////////////////////////////////////
				if (textureSize == 32 && textureType == 'bedrock') {
					if (texturesBedrock[textureIndex].c32.author == undefined) texturesBedrock[textureIndex].c32.author = [textureAuthorID];
					else if (!texturesBedrock[textureIndex].c32.author.includes(textureAuthorID)) texturesBedrock[textureIndex].c32.author.push(textureAuthorID);
					if (!texturesBedrock[textureIndex].c32.date == undefined) texturesBedrock[textureIndex].c32.date = date();
				}
				if (textureSize == 64 && textureType == 'bedrock') {
					if (texturesBedrock[textureIndex].c64.author == undefined) texturesBedrock[textureIndex].c64.author = [textureAuthorID];
					else if (!texturesBedrock[textureIndex].c64.author.includes(textureAuthorID)) texturesBedrock[textureIndex].c64.author.push(textureAuthorID);
					if (!texturesBedrock[textureIndex].c64.date == undefined) texturesBedrock[textureIndex].c64.date = date();
				}
				//////////////////////////////////////////
				if (textureType == 'java') {

					if (texturesJava[textureIndex] == undefined) {
						console.log(`textureIndex failed: ${textureIndex} - ${textureSize} - ${textureName}`);
						break;
					}

					await download_branch(message.embeds[0].image.url, texturesJava[textureIndex].version['1.17'],   textureSize, textureName, '1.17');
					await download_branch(message.embeds[0].image.url, texturesJava[textureIndex].version['1.16.5'], textureSize, textureName, '1.16.5');
					await download_branch(message.embeds[0].image.url, texturesJava[textureIndex].version['1.15.2'], textureSize, textureName, '1.15.2');
					await download_branch(message.embeds[0].image.url, texturesJava[textureIndex].version['1.14.4'], textureSize, textureName, '1.14.4');
					await download_branch(message.embeds[0].image.url, texturesJava[textureIndex].version['1.13.2'], textureSize, textureName, '1.13.2');
					await download_branch(message.embeds[0].image.url, texturesJava[textureIndex].version['1.12.2'], textureSize, textureName, '1.12.2');

				}
				else if (textureType == 'bedrock') {
					await download(message.embeds[0].image.url, search, textureType, textureSize, textureName);
				}
			}
		}
	}

	await jsonContributionsBedrock.write(texturesBedrock);
	await jsonContributionsJava.write(texturesJava);

	// invisible catch
	} catch(_error) {
		jsonContributionsJava.release();
		jsonContributionsBedrock.release();
	}
}

async function download_branch(textureURL, texturePath, textureSize, textureName, branch) {
	if (texturePath == null || texturePath == undefined) return;

	var localPath = undefined;
	if      (textureSize == 32) localPath = `./texturesPush/Compliance-Java-32x/${branch}/assets/${texturePath}`;
	else if (textureSize == 64) localPath = `./texturesPush/Compliance-Java-64x/${branch}/assets/${texturePath}`;

	else if (localPath == undefined) {
		return errorAutoPush(client, 0, 'localPath undefined', textureUrl, textureName, texturePath, textureSize, 'localPath == undefined');
	}

	const response = await fetch(textureURL);
	const buffer   = await response.buffer();
	await fs.promises.mkdir(localPath.substr(0, localPath.lastIndexOf('/')), {recursive: true}).catch(console.error);
	await fs.writeFile(localPath, buffer, () => console.log(`ADDED: ${textureName}\nTO: ${localPath}\n`));
}

async function download(textureUrl, texturePath, textureType, textureSize, textureName) {
	var localPath = undefined;
	
	if (textureSize == 32) localPath = `./texturesPush/Compliance-Bedrock-32x/${texturePath}`
	else if (textureSize == 64) localPath = `./texturesPush/Compliance-Bedrock-64x/${texturePath}`

	else if (localPath == undefined) {
		return errorAutoPush(client, 0, 'localPath undefined', textureUrl, textureName, texturePath, textureType, 'localPath == undefined');
	}

	const response = await fetch(textureUrl);
	const buffer   = await response.buffer();
	await fs.promises.mkdir(localPath.substr(0, localPath.lastIndexOf('/')), {recursive: true}).catch(console.error);
	await fs.writeFile(localPath, buffer, () => console.log(`ADDED: ${textureName}\nTO: ${localPath}\n`));
}

async function errorAutoPush(client, inputID, message, author, name, folder, type, error) {
	var errorChannel = client.channels.cache.get(settings.C32_AUTOPUSH_FAIL);
	if (inputID == settings.C64_RESULTS) errorChannel = client.channels.cache.get(settings.C64_AUTOPUSH_FAIL);

	embed = new Discord.MessageEmbed()
		.setColor(colors.YELLOW)
		.setAuthor(author, message.embeds[0].author.iconURL)
		.setDescription(`Something went wrong during autopush:\nError: ${error}`)
		.addFields(
			{ name: 'Name:',   value: name,   inline: true },
			{ name: 'Folder:', value: folder, inline: true },
			{ name: 'Type:',   value: type,   inline: true }
		)
		.setFooter('CompliBot', settings.BOT_IMG)
		
		if (message.embeds[0].title) {
			embed.setTitle(message.embeds[0].title).setURL(message.embeds[0].url);
		}
		else embed.setImage(message.embeds[0].image.url);

	await errorChannel.send(embed)
}

exports.getResults = getResults;