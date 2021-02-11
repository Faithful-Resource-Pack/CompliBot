const Discord = require('discord.js');
const colors = require('../../res/colors');
const prefix = process.env.PREFIX;

const fs      = require('fs');
const fetch   = require('node-fetch');
const strings = require('../../res/strings');

const { warnUser } = require('../../functions/warnUser.js');
const { doPush }   = require('../../functions/doPush.js');

module.exports = {
	name: 'push',
	description: 'Push file to GitHub & update contributors list',
	uses: 'Moderators',
	syntax: `${prefix}push <repo> <author> <folder> <texturename> + attach file`,

	async execute(client, message, args) {

		if (message.member.hasPermission('ADMINISTRATOR')) {
			if (Array.isArray(args) && args[0] != undefined) {

				const repositories = ['Compliance-Java-32x','Compliance-Java-64x','Compliance-Bedrock-32x','Compliance-Bedrock-64x'];
				if (!repositories.includes(args[0])) return warnUser(message, 'This repository isn\'t supported');
				if (message.attachments.size == 0) return warnUser(message, 'You did not attached the texture!');

				var textures        = JSON.parse(fs.readFileSync('./json/contributors/java.json'));
				var texturesBedrock = JSON.parse(fs.readFileSync('./json/contributors/bedrock.json'));

				var textureAuthor   = args[1];
				var textureAuthorID = client.users.cache.find(u => u.tag === args[1]).id
				var folder = args[2];
				var name   = args[3].replace('.png','') + '.png';
				var index  = -1;
				var type   = undefined;

				if (folder.includes("realms")) search = "realms/textures/" + folder.replace("realms/textures/","") + "/" + name;
				else search = "minecraft/textures/" + folder.replace("minecraft/textures/","") + "/" + name;

				// JAVA
				for (var i = 0; i < textures.length; i++) {
					if (textures[i].version[strings.LATEST_MC_JE_VERSION].includes(search)) {
						index = i;
						type  = 'java';
						break;
					}
				}

				// BEDROCK
				if (index == -1) {
					var searchBedrock = "textures/" + folder.replace("textures/","") + "/" + name;
					for (var i = 0; i < texturesBedrock.length; i++) {
						if (texturesBedrock[i].path.includes(searchBedrock)) {
							index = i;
							type  = 'bedrock';
							break;
						}
					}
				}

				// NOT FOUND
				if (index == -1) return warnUser(message, 'Texture not found.');

				// ADD CONTRIBUTORS TO JSON
				if (type == 'bedrock' && args[0].includes('32x')) {
					if (texturesBedrock[index].c32.author == undefined) {
						texturesBedrock[index].c32.author = [ textureAuthorID ];
					}
					else {
						var authors = texturesBedrock[index].c32.author;
						if (authors.includes(textureAuthorID) == false) {
							texturesBedrock[index].c32.author.push(textureAuthorID);
						}
					}

					if (texturesBedrock[index].c32.date == undefined) texturesBedrock[index].c32.date = date();
				}
				if (type == 'bedrock' && args[0].includes('64x')) {
					if (texturesBedrock[index].c64.author == undefined) {
						texturesBedrock[index].c64.author = [ textureAuthorID ];
					}
					else {
						var authors = texturesBedrock[index].c64.author;
						if (authors.includes(textureAuthorID) == false) {
							texturesBedrock[index].c64.author.push(textureAuthorID);
						}
					}

					if (texturesBedrock[index].c64.date == undefined) texturesBedrock[index].c64.date = date();
				}
				if (type == 'java' && args[0].includes('32x')) {
					if (textures[index].c32.author == undefined) {
						textures[index].c32.author = [ textureAuthorID ];
					}
					else {
						var authors = textures[index].c32.author;
						if (authors.includes(textureAuthorID) == false) {
							textures[index].c32.author.push(textureAuthorID);
						}
					}

					if (textures[index].c32.date == undefined) textures[index].c32.date = date();
				}
				if (type == 'java' && args[0].includes('64x')) {
					if (textures[index].c64.author == undefined) {
						textures[index].c64.author = [ textureAuthorID ];
					}
					else {
						var authors = textures[index].c64.author;
						if (authors.includes(textureAuthorID) == false) {
							textures[index].c64.author.push(textureAuthorID);
						}
					}

					if (textures[index].c64.date == undefined) textures[index].c64.date = date();
				}

				// UPDATE JSON
				path = undefined;
				if (type == 'bedrock') {
					let data = JSON.stringify(texturesBedrock, null, 2);
					fs.writeFileSync('./json/contributors/bedrock.json', data);
					path = searchBedrock;
				} else if (type == 'java') {
					let data = JSON.stringify(textures, null, 2);
					fs.writeFileSync('./json/contributors/java.json', data);
					path = search;
				}

				if (type == 'java') {
					await download_branch(message.attachments.first().url, textures[index].version['1.17'],   args[0], name, '1.17');
					await download_branch(message.attachments.first().url, textures[index].version['1.16.5'], args[0], name, '1.16.5');
					await download_branch(message.attachments.first().url, textures[index].version['1.15.2'], args[0], name, '1.15.2');
					await download_branch(message.attachments.first().url, textures[index].version['1.14.4'], args[0], name, '1.14.4');
					await download_branch(message.attachments.first().url, textures[index].version['1.13.2'], args[0], name, '1.13.2');
					await download_branch(message.attachments.first().url, textures[index].version['1.12.2'], args[0], name, '1.12.2');
				}
				else if (type == 'bedrock') {
					await download(message.attachments.first().url, args[0], path, name);
				}

				await doPush(`Manual Push for ${name} executed by: ${message.author.username}`);
				await message.react('✅');
				
			} else return warnUser(message,'You did not provide args!');
		} else return warnUser(message,strings.COMMAND_NO_PERMISSION);
	}
}

async function download_branch(url, path, type, name, branch) {
	if (path == null || path == undefined) return;

	var localPath = undefined;
	if (type != undefined) localPath = `./texturesPush/${type}/${branch}/assets/${path}`;
	else return warnUser(message, 'localPath undefined!');

	const response = await fetch(url);
	const buffer   = await response.buffer();
	await fs.promises.mkdir(localPath.replace(`/${name}`,''), {recursive: true}).catch(console.error);
	await fs.writeFile(localPath, buffer, () => console.log(`ADDED: ${name}\nTO: ${localPath}\n`));
}

async function download(url, type, path, name) {
	var localPath = undefined;
	if (type == 'Compliance-Bedrock-32x') localPath = `./texturesPush/Compliance-Bedrock-32x/${path}`
	else if (type == 'Compliance-Bedrock-64x') localPath = `./texturesPush/Compliance-Bedrock-64x/${path}`
	else return warnUser(message, 'Something went wrong');

 	const response = await fetch(url);
	const buffer   = await response.buffer();
	await fs.promises.mkdir(localPath.replace(`/${name}`,''), { recursive: true }).catch(console.error);
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