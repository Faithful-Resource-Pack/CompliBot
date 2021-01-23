const Discord = require('discord.js');
const colors = require('../../res/colors');
const prefix = process.env.PREFIX;

const fs      = require('fs');
const fetch   = require('node-fetch');
const strings = require('../../res/strings');

const BRANCH_JAVA    = 'Jappa-1.17';
const BRANCH_BEDROCK = 'Jappa-1.16.200';

const { warnUser } = require('../../functions/warnUser.js');
const { autoPush } = require('../../functions/autoPush.js');

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

				var textures        = JSON.parse(fs.readFileSync('./contributors/java.json'));
				var texturesBedrock = JSON.parse(fs.readFileSync('./contributors/bedrock.json'));

				var textureAuthor = args[1];
				var folder = args[2];
				var name   = args[3].replace('.png','') + '.png';
				var index  = -1;
				var type   = undefined;

				if (folder.includes("realms")) search = "realms/textures/" + folder.replace("realms/textures/","") + "/" + name;
				else search = "minecraft/textures/" + folder.replace("minecraft/textures/","") + "/" + name;

				// JAVA
				for (var i = 0; i < textures.length; i++) {
					if (textures[i].path.includes(search)) {
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
						texturesBedrock[index].c32.author = [ textureAuthor ];
					}
					else {
						var authors = texturesBedrock[index].c32.author;
						if (authors.includes(textureAuthor) == false) {
							texturesBedrock[index].c32.author.push(textureAuthor);
						}
					}

					if (texturesBedrock[index].c32.date == undefined) texturesBedrock[index].c32.date = date();
				}
				if (type == 'bedrock' && args[0].includes('64x')) {
					if (texturesBedrock[index].c64.author == undefined) {
						texturesBedrock[index].c64.author = [ textureAuthor ];
					}
					else {
						var authors = texturesBedrock[index].c64.author;
						if (authors.includes(textureAuthor) == false) {
							texturesBedrock[index].c64.author.push(textureAuthor);
						}
					}

					if (texturesBedrock[index].c64.date == undefined) texturesBedrock[index].c64.date = date();
				}
				if (type == 'java' && args[0].includes('32x')) {
					if (textures[index].c32.author == undefined) {
						textures[index].c32.author = [ textureAuthor ];
					}
					else {
						var authors = textures[index].c32.author;
						if (authors.includes(textureAuthor) == false) {
							textures[index].c32.author.push(textureAuthor);
						}
					}

					if (textures[index].c32.date == undefined) textures[index].c32.date = date();
				}
				if (type == 'java' && args[0].includes('64x')) {
					if (textures[index].c64.author == undefined) {
						textures[index].c64.author = [ textureAuthor ];
					}
					else {
						var authors = textures[index].c64.author;
						if (authors.includes(textureAuthor) == false) {
							textures[index].c64.author.push(textureAuthor);
						}
					}

					if (textures[index].c64.date == undefined) textures[index].c64.date = date();
				}

				// UPDATE JSON
				path = undefined;
				if (type == 'bedrock') {
					let data = JSON.stringify(texturesBedrock, null, 2);
					fs.writeFileSync('./contributorsBedrock.json', data);
					path = searchBedrock;
				} else {
					let data = JSON.stringify(textures, null, 2);
					fs.writeFileSync('./contributors.json', data);
					path = search;
				}

				await download(message.attachments.first().url, args[0], path, name);
				await generatePush(args[0], `Manual Push for ${name} executed by: ${message.author.username}`);
				await message.react('✅');
				
			} else return warnUser(message,'You did not provide args!');
		} else return warnUser(message,strings.COMMAND_NO_PERMISSION);
	}
}

function generatePush(dir, commit_message) {
	
	if (dir.includes('Bedrock')) {
		if (!isEmptyDir(`./texturesPush/${dir}/textures`)) {
			autoPush('Compliance-Resource-Pack', dir, BRANCH_BEDROCK, commit_message, `./texturesPush/${dir}`).then(() => {
				fs.rmdirSync(`./texturesPush/${dir}/textures/`, { recursive: true });
				console.log(`PUSHED TO GITHUB: ${dir}`);
			});
		}
	}
	else {
		if(!isEmptyDir(`./texturesPush/${dir}/assets`)) {
			autoPush('Compliance-Resource-Pack', dir, BRANCH_JAVA, commit_message, `./texturesPush/${dir}`).then(() => {
				fs.rmdirSync(`./texturesPush/${dir}/assets/`, { recursive: true });
				console.log(`PUSHED TO GITHUB: ${dir}`);
			});
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

async function download(url, type, path, name) {
	var localPath = undefined;
	if (type == 'Compliance-Java-32x') localPath = `./texturesPush/Compliance-Java-32x/assets/${path}`
	if (type == 'Compliance-Java-64x') localPath = `./texturesPush/Compliance-Java-64x/assets/${path}`
	if (type == 'Compliance-Bedrock-32x') localPath = `./texturesPush/Compliance-Bedrock-32x/${path}`
	if (type == 'Compliance-Bedrock-64x') localPath = `./texturesPush/Compliance-Bedrock-64x/${path}`

 	const response = await fetch(url);
  const buffer   = await response.buffer();
	await fs.promises.mkdir(localPath.replace("/"+name,""), { recursive: true }).catch(console.error);
  await fs.writeFile(localPath, buffer, () => console.log(`ADDED: ${name}\nTO: ${localPath}\n`));

	return true;
}

function isEmptyDir(dirname){
	if (!fs.existsSync(dirname)) return true;
	else return false;
}