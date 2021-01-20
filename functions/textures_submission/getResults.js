const Discord         = require('discord.js');
const { autoPush }    = require('../autoPush.js');
const { getMessages } = require('../getMessages');
const settings        = require('../../settings');
const colors          = require('../../res/colors');
const fs              = require('fs');
const fetch           = require('node-fetch');

const BRANCH_BEDROCK = "Jappa-1.16.200"
const BRANCH_JAVA    = "Jappa-1.17"
const COMMIT_MESSAGE = `AutoPush passed textures from ${date()}`

async function getResults(client, inputID) {

	var type = undefined
	if (inputID == settings.C32_RESULTS) type = "c32";
	if (inputID == settings.C64_RESULTS) type = "c64";

	var textures = JSON.parse(fs.readFileSync('./contributors.json'));
	var texturesBedrock = JSON.parse(fs.readFileSync('./contributorsBedrock.json'));

	limitDate = new Date();
	limitDate.setDate(limitDate.getDate() - 0);

	let messages = await getMessages(client,inputID);
	for (var i in messages) {

		let message = messages[i];
		let messageDate = new Date(message.createdTimestamp);

		if (message.embeds[0] !== undefined && messageDate.getDate() == limitDate.getDate() && messageDate.getMonth() == limitDate.getMonth()) {
			// Discord colors is messed up #50AF4C (colors.GREEN) correspond to 5025616
			if (message.embeds[0].color == 5025616) {
				var textureAuthor = message.embeds[0].author.name;
				var name   = message.embeds[0].fields[0].value + '.png';
				var folder = message.embeds[0].fields[1].value;
				var found  = false;
				var index  = -1;

				// JAVA :
				if (folder.includes("realms")) search = "realms/textures/" + folder.replace("realms/textures/","") + "/" + name;
				else search = "minecraft/textures/" + folder.replace("minecraft/textures/","") + "/" + name;

				for (var i = 0; i < textures.length; i++) {
					if (textures[i].path.includes(search)) {
						index = i;
						break;
					}
				}

				// BEDROCK :
				if (index == -1) {

					var searchBedrock = "textures/" + folder.replace("textures/","") + "/" + name;

					for (var i = 0; i < texturesBedrock.length; i++) {
						if (texturesBedrock[i].path.includes(searchBedrock)) {
							index = i;
							type = undefined;
							if (inputID == settings.C32_RESULTS) type = "c32-bedrock";
							if (inputID == settings.C64_RESULTS) type = "c64-bedrock";

							break;
						}
					}
				}

				// ANYTHING ELSE :
				if (index == -1) errorAutoPush(client, message, textureAuthor, name, folder, `Texture not found (check spelling/folder)`);
				
				/*
				  "minecraft/textures/block/warped_stem.png": {
						"c32": {
							"author": [ "Author1", "Author2" ],
							"date": "01/19/21"
						}
					}
				*/
				if (type == undefined) {
					errorAutoPush(client, message, textureAuthor, name, folder, 'No type defined for this texture');
				}
				else if (index != -1){

					// UPDATE CONTRIBUTORS LIST
					if (type == 'c32') {
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

					if (type == 'c32-bedrock') {
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

					if (type == 'c64') {
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

					if (type == 'c64-bedrock') {
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

					// UPDATE CONTRIBUTORS LIST IN LOCAL FILES
					var path = undefined
					if (type.endsWith('bedrock')) {
						let data = JSON.stringify(texturesBedrock, null, 2);
						fs.writeFileSync('./contributorsBedrock.json', data);
						path = searchBedrock;
					} else {
						let data = JSON.stringify(textures, null, 2);
						fs.writeFileSync('./contributors.json', data);
						path = search;
					}

					// UPLOAD FILE LOCALLY
					await download(message.embeds[0].image.url, type, path, name);
				}
			}
		}

	}

	// PUSH TO GITHUB
	await generatePush();

}

function generatePush() {
	const directories = ['Compliance-Java-32x','Compliance-Java-64x','Compliance-Bedrock-32x','Compliance-Bedrock-64x'];

	directories.forEach(dir => {
		if (dir.includes('Bedrock')) {
			if(!isEmptyDir(`./texturesPush/${dir}/textures`)) {
				autoPush('Compliance-Resource-Pack', dir, BRANCH_BEDROCK, COMMIT_MESSAGE).then(() => {
					fs.rmdirSync(`./texturesPush/${dir}/textures/`, { recursive: true });
					console.log(`PUSHED TO GITHUB: ${dir}`);
				});
			}
		}
		else {
			if(!isEmptyDir(`./texturesPush/${dir}/assets`)) {
				autoPush('Compliance-Resource-Pack', dir, BRANCH_JAVA, COMMIT_MESSAGE).then(() => {
					fs.rmdirSync(`./texturesPush/${dir}/assets/`, { recursive: true });
					console.log(`PUSHED TO GITHUB: ${dir}`);
				});
			}
		}
	});

}

function isEmptyDir(dirname){
	if (!fs.existsSync(dirname)) return true;
	else return false;
}

async function download(url, type, path, name) {
	var localPath = undefined;
	if (type == 'c32') localPath = `./texturesPush/Compliance-Java-32x/assets/${path}`
	if (type == 'c64') localPath = `./texturesPush/Compliance-Java-64x/assets/${path}`
	if (type == 'c32-bedrock') localPath = `./texturesPush/Compliance-Bedrock-32x/${path}`
	if (type == 'c64-bedrock') localPath = `./texturesPush/Compliance-Bedrock-64x/${path}`

 	const response = await fetch(url);
  const buffer   = await response.buffer();
	await fs.promises.mkdir(localPath.replace("/"+name,""), { recursive: true }).catch(console.error);
  await fs.writeFile(localPath, buffer, () => console.log(`ADDED: ${name}\nTO: ${localPath}\n`));

	return true;
}

function date() {
	var today = new Date();
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = today.getFullYear();
	return mm + '/' + dd + '/' + yyyy;
}

async function errorAutoPush(client, message, author, name, folder, error) {
	let errorChannel = client.channels.cache.get(settings.C32_AUTOPUSH_FAIL);
	embed = new Discord.MessageEmbed()
		.setColor(colors.YELLOW)
		.setAuthor(author, message.embeds[0].author.iconURL)
		.setDescription(`Something went wrong during autopush:\nError: ${error}`)
		.addFields(
			{ name: 'Name:', value: name, inline: true },
			{ name: 'Folder:', value: folder, inline: true },
		)
		.setFooter('CompliBot', settings.BOT_IMG)
		.setImage(message.embeds[0].image.url);

	await errorChannel.send(embed)
}

exports.getResults = getResults;