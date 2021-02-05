const Discord  = require('discord.js');
const settings = require('../../settings.js');
const colors   = require('../../res/colors.js');
const fs       = require('fs');
const fetch    = require('node-fetch');
const { getMessages } = require('../getMessages.js');

async function getResults(client, inputID, OFFSET_DAY = 0) {

	// get contributors files:
	var texturesBedrock = JSON.parse(fs.readFileSync('./json/contributors/bedrock.json'));
	var texturesJava    =	JSON.parse(fs.readFileSync('./json/contributors/java.json'));

	// set offset (used for developpment);
	var offsetDate = new Date();
	offsetDate.setDate(offsetDate.getDate() - OFFSET_DAY);

	// get messages list:
	let messages = await getMessages(client, inputID);

	for (var i in messages) {
		let message     = messages[i];
		let messageDate = new Date(message.createdTimestamp);

		// if : message is an embed && offset date == message date && embed color is green
		if (message.embeds[0] != undefined && message.embeds[0].color == 5025616 && messageDate.getDate() == offsetDate.getDate() && messageDate.getMonth() == offsetDate.getMonth()) {
			var textureAuthor = message.embeds[0].author.name;
			var textureName   = message.embeds[0].fields[0].value.replace('.png','') + '.png';
			var textureFolder = message.embeds[0].fields[1].value;
			var textureType   = message.embeds[0].fields[2].value || undefined;
			var textureSize   = undefined;
			var textureIndex  = -1;

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
					if (texturesJava[i].path.includes(search)) {
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

			if (textureIndex != 1 && (textureType == 'java' || textureType == 'bedrock')) {
				if (textureSize == 32 && textureType == 'java') {
					if (texturesJava[textureIndex].c32.author == undefined) texturesJava[textureIndex].c32.author = [textureAuthor];
					else if (!texturesJava[textureIndex].c32.author.includes(textureAuthor)) texturesJava[textureIndex].c32.author.push(textureAuthor);
					if (!texturesJava[textureIndex].c32.date == undefined) texturesJava[textureIndex].c32.date = date();

				}
				if (textureSize == 64 && textureType == 'java') {
					if (texturesJava[textureIndex].c64.author == undefined) texturesJava[textureIndex].c64.author = [textureAuthor];
					else if (!texturesJava[textureIndex].c64.author.includes(textureAuthor)) texturesJava[textureIndex].c64.author.push(textureAuthor);
					if (!texturesJava[textureIndex].c64.date == undefined) texturesJava[textureIndex].c64.date = date();
				}
				if (textureSize == 32 && textureType == 'bedrock') {
					if (texturesBedrock[textureIndex].c32.author == undefined) texturesBedrock[textureIndex].c32.author = [textureAuthor];
					else if (!texturesBedrock[textureIndex].c32.author.includes(textureAuthor)) texturesBedrock[textureIndex].c32.author.push(textureAuthor);
					if (!texturesBedrock[textureIndex].c32.date == undefined) texturesBedrock[textureIndex].c32.date = date();
				}
				if (textureSize == 64 && textureType == 'bedrock') {
					if (texturesBedrock[textureIndex].c64.author == undefined) texturesBedrock[textureIndex].c64.author = [textureAuthor];
					else if (!texturesBedrock[textureIndex].c64.author.includes(textureAuthor)) texturesBedrock[textureIndex].c64.author.push(textureAuthor);
					if (!texturesBedrock[textureIndex].c64.date == undefined) texturesBedrock[textureIndex].c64.date = date();
				}
			
				await download(message.embeds[0].image.url, search, textureType, textureSize, textureName);
			}
		}
	}

	await fs.writeFileSync('./json/contributors/bedrock.json', JSON.stringify(texturesBedrock, null, 2));
	await fs.writeFileSync('./json/contributors/java.json',    JSON.stringify(texturesJava,    null, 2));
}

function date() {
	var today = new Date();
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = today.getFullYear();
	return mm + '/' + dd + '/' + yyyy;
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

async function download(textureUrl, texturePath, textureType, textureSize, textureName) {
	var localPath = undefined;
	if (textureType == 'java' && textureSize == 32) localPath = `./texturesPush/Compliance-Java-32x/assets/${texturePath}`
	if (textureType == 'java' && textureSize == 64) localPath = `./texturesPush/Compliance-Java-64x/assets/${texturePath}`
	if (textureType == 'bedrock' && textureSize == 32) localPath = `./texturesPush/Compliance-Bedrock-32x/${texturePath}`
	if (textureType == 'bedrock' && textureSize == 64) localPath = `./texturesPush/Compliance-Bedrock-64x/${texturePath}`

	if (localPath == undefined) {
		return errorAutoPush(client, 0, 'localPath cannot be found', textureUrl, textureName, texturePath, textureType, 'Yes, im working on it.\nJuknum');
	}

	const response = await fetch(textureUrl);
	const buffer   = await response.buffer();
	await fs.promises.mkdir(localPath.replace(`/${textureName}`,''), {recursive: true}).catch(console.error);
	await fs.writeFile(localPath, buffer, () => console.log(`ADDED: ${textureName}\nTO: ${localPath}\n`));
}

exports.getResults = getResults;