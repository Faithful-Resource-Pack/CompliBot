const Discord  = require('discord.js');
const settings = require('../../settings.js');
const colors   = require('../../res/colors.js');
const fs       = require('fs');
const fetch    = require('node-fetch');
const { getMessages } = require('../getMessages.js');

async function getResults(client, inputID, OFFSET_DAY = 0) {

	// get contributors files:
	var texturesBedrock = JSON.parse(fs.readFileSync('./contributors/java.json'));
	var texturesJava    =	JSON.parse(fs.readFileSync('./contributors/bedrock.json'));

	// set offset (used for developpment);
	var offsetDate = new Date();
	offsetDate.setDate(offsetDate.getDate() - OFFSET_DAY);

	// get messages list:
	let messages = await getMessages(client, inputID);

	for (var i in messages) {
		let message     = messages[i];
		let messageDate = new Date(message.createdTimestamp);

		// if : message is an embed && offset date == message date && embed color is green
		if (
			message.embeds[0] != undefined &&
			message.embeds[0].color == 5025616 && 
			messageDate.getDate() == offsetDate.getDate() && messageDate.getMonth() == offsetDate.getMonth()
		) {
			if (message.embeds[0].color == 5025616) {// 5025616 == #50AF4C == colors.GREEN

				var textureAuthor = message.embeds[0].author.name;
				var textureName   = message.embeds[0].fields[0].value.replace('.png','') + '.png';
				var textureFolder = message.embeds[0].fields[1].value;
				var textureType   = undefined;
				var textureIndex  = -1;

				var searchJava    = undefined;
				var searchBedrock = undefined; 

				// Search inside java.json contributors:
				if (textureFolder.includes('realms')) searchJava = `realms/textures/${textureFolder.replace('realms/textures/','')}/${textureName}`;
				else searchJava = `minecraft/textures/${textureFolder.replace('minecraft/textures/','')}/${textureName}`;

				for (var i = 0; i < texturesJava.length; i++) {
					if (texturesJava[i].path.includes(searchJava)) {
						textureIndex = i;
						if (inputID == settings.C32_RESULTS) textureType = 'c32';
						if (inputID == settings.C64_RESULTS) textureType = 'c64';
						break;
					}
				}

				// Search inside bedrock.json if java.json doesn't have the texture
				if (textureIndex == -1) {
					var searchBedrock = `textures/${textureFolder.replace('textures/','')}/${textureName}`;

					for (var i = 0; i < texturesBedrock.length; i++) {
						if (texturesBedrock[i].path.includes(searchBedrock)) {
							textureIndex = i;
							if (inputID == settings.C32_RESULTS) textureType = 'c32-bedrock';
							if (inputID == settings.C64_RESULTS) textureType = 'c64-bedrock';
							break;
						}
					}
				}

				// Texture not found:
				if (textureIndex == -1) errorAutoPush(client, inputID, message, textureAuthor, textureName, textureFolder, `Texture not found, check spelling or folder`);
				if (textureIndex != -1 && textureType == undefined) errorAutoPush(client, inputID, message, textureAuthor, textureName, textureFolder, `Can't find default repository for this texture, contact Juknum if it's not a Zip archive`);

				// Texture found:
				if (textureIndex != 1 && textureType != undefined) {
					// Update contributors
					if (textureType == 'c32') {
						if (texturesJava[textureIndex].c32.author == undefined) texturesJava[textureIndex].c32.author = [textureAuthor];
						else if (!texturesJava[textureIndex].c32.author.includes(textureAuthor)) texturesJava[textureIndex].c32.author.push(textureAuthor);

						if (!texturesJava[textureIndex].c32.date == undefined) texturesJava[textureIndex].c32.date = date();
					}
					if (textureType == 'c64') {
						if (texturesJava[textureIndex].c64.author == undefined) texturesJava[textureIndex].c64.author = [textureAuthor];
						else if (!texturesJava[textureIndex].c64.author.includes(textureAuthor)) texturesJava[textureIndex].c64.author.push(textureAuthor);

						if (!texturesJava[textureIndex].c64.date == undefined) texturesJava[textureIndex].c64.date = date();
					}
					if (textureType == 'c32-bedrock') {
						if (texturesBedrock[textureIndex].c32.author == undefined) texturesBedrock[textureIndex].c32.author = [textureAuthor];
						else if (!texturesBedrock[textureIndex].c32.author.includes(textureAuthor)) texturesBedrock[textureIndex].c32.author.push(textureAuthor);

						if (!texturesBedrock[textureIndex].c32.date == undefined) texturesBedrock[textureIndex].c32.date = date();
					}
					if (textureType == 'c64-bedrock') {
						if (texturesBedrock[textureIndex].c64.author == undefined) texturesBedrock[textureIndex].c64.author = [textureAuthor];
						else if (!texturesBedrock[textureIndex].c64.author.includes(textureAuthor)) texturesBedrock[textureIndex].c64.author.push(textureAuthor);

						if (!texturesBedrock[textureIndex].c64.date == undefined) texturesBedrock[textureIndex].c64.date = date();
					}

					// Update Complibot files:
					if (textureType == 'c32-bedrock' || textureType == 'c64-bedrock') await fs.writeFileSync('./contributors/bedrock.json', JSON.stringify(texturesBedrock, null, 2));
					else if (textureType == 'c32' || textureType == 'c64') await fs.writeFileSync('./contributors/java.json', JSON.stringify(texturesJava, null, 2));

					// Download file into Complibot files:
					if (textureType == 'c32-bedrock' || textureType == 'c64-bedrock') await download(message.embeds[0].image.url, textureType, searchBedrock, textureName);
					else if (textureType == 'c32' || textureType == 'c64') await download(message.embeds[0].image.url, textureType, searchJava, textureName);
				}
			}

		}
	}
}

function date() {
	var today = new Date();
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = today.getFullYear();
	return mm + '/' + dd + '/' + yyyy;
}

async function errorAutoPush(client, inputID, message, author, name, folder, error) {
	var errorChannel = client.channels.cache.get(settings.C32_AUTOPUSH_FAIL);
	if (inputID == settings.C64_RESULTS) errorChannel = client.channels.cache.get(settings.C64_AUTOPUSH_FAIL);

	embed = new Discord.MessageEmbed()
		.setColor(colors.YELLOW)
		.setAuthor(author, message.embeds[0].author.iconURL)
		.setDescription(`Something went wrong during autopush:\nError: ${error}`)
		.addFields(
			{ name: 'Name:', value: name, inline: true },
			{ name: 'Folder:', value: folder, inline: true },
		)
		.setFooter('CompliBot', settings.BOT_IMG)
		
		if (message.embeds[0].title) {
			embed.setTitle(message.embeds[0].title).setURL(message.embeds[0].url);
		}
		else embed.setImage(message.embeds[0].image.url);

	await errorChannel.send(embed)
}

async function download(textureUrl, textureType, texturePath, textureName) {
	var localPath = undefined;
	if (textureType == 'c32') localPath = `./texturesPush/Compliance-Java-32x/assets/${texturePath}`
	if (textureType == 'c64') localPath = `./texturesPush/Compliance-Java-64x/assets/${texturePath}`
	if (textureType == 'c32-bedrock') localPath = `./texturesPush/Compliance-Bedrock-32x/${texturePath}`
	if (textureType == 'c64-bedrock') localPath = `./texturesPush/Compliance-Bedrock-64x/${texturePath}`

	const response = await fetch(textureUrl);
	const buffer   = await response.buffer();
	await fs.promises.mkdir(localPath.replace(`/${textureName}`,''), {recursive: true}).catch(console.error);
	await fs.writeFile(localPath, buffer, () => console.log(`ADDED: ${textureName}\nTO: ${localPath}\n`));
}

exports.getResults = getResults;