const Discord  = require('discord.js');
const axios    = require('axios').default;
const https    = require('https');
const sizeOf   = require('image-size');
const fs       = require('fs');
const speech   = require('../messages');
const settings = require('../settings.js');

const { magnify }  = require('../functions/magnify.js');
const { getMeta }  = require('../functions/getMeta.js');
const { warnUser } = require('../functions/warnUser.js');

module.exports = {
	name: 'texture',
	description: 'Displays a specified texture from Compliance!\nYou can ask for a texture name, or using ``_`` at the begining to ask for non-complete name (such as _swords).\nYou can also use ``/`` at the begining to specify a folder instead of a texture name.',
	uses: 'Anyone',
	syntax: `${prefix}texture <vanilla/32> <texture_name>\n${prefix}texture <vanilla/32> <_name>\n${prefix}texture <vanilla/32> </folder/>`,
	async execute(client, message, args) {
		
		let rawdata  = fs.readFileSync('textures.json');
		let textures = JSON.parse(rawdata);
		var results  = [];

		if (args != '') {
			if (args[0] == 'vanilla' || args[0] == '32') {
				if (args[1]) {
					// begin with _, is inside : be able to search for _sword : sort all swords
					if (String(args[1]).startsWith('_')) {
						for (var i=0 ; i < textures.length ; i++){
							if (textures[i].split("/").pop().includes(args[1])) {
								results.push(textures[i]);
							}
						}
					}
					// begin with /, is in subfolder
					if (String(args[1]).startsWith('/')) {
						if (!String(args[1]).endsWith('/')) {
							args[1] = args[1] + '/'; // to only check folder and not texture with the same name as folder
						} 
						for (var i=0 ; i < textures.length ; i++) {
							if (textures[i].includes(args[1])) {
								results.push(textures[i]);
							}
						}
					}
					// classic search
					else {
						for (var i=0 ; i < textures.length ; i++){
							if (textures[i].split("/").pop().startsWith(args[1])) {
								results.push(textures[i]);
							}
						}
					}

					// one texture found
					if (results.length == 1) return getTexture(args[0],results[0]);

					// multiple texture found
					if (results.length > 1) return getMultipleTexture(args[0],results);
					
					// no texture found
					if (results.length == 0) return warnUser(message,speech.TEXTURE_DOESNT_EXIST);
				}
				else return warnUser(message,speech.COMMAND_NOT_ENOUGH_ARGUMENTS_GIVEN);
			}
			else return warnUser(message,speech.COMMAND_WRONG_ARGUMENTS_GIVEN);
		}
		else return warnUser(message,speech.COMMAND_NO_ARGUMENTS_GIVEN);

		/*
		 * ASK USER TO CHOOSE BETWEEN MULTIPLE TEXTURES 
		*/
		async function getMultipleTexture(size,results) {
			// max amount of reactions reached
			const emoji_num = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','🇦','🇧','🇨','🇩','🇪','🇫','🇬','🇭','🇮','🇯'];

			var embed = new Discord.MessageEmbed()
				.setTitle(results.length + ' results for "' + args[1] + '" in Compliance '+args[0])
        .setFooter('CompliBot', settings.BOT_IMG);

			var description = 'Choose one texture using emoji reactions.\nIf you don\'t see what you\'re looking for, be more specific.\n\n';
			for (var i=0; i < results.length; i++){
				if (i < emoji_num.length) {
					description += emoji_num[i] + ' — ' + results[i].replace(args, '**'+args+'**').replace(/_/g, '＿') + '\n';
				}
			}
			embed.setDescription(description);
				
			const embedMessage = await message.channel.send(embed);

			for (var i=0; i < results.length; i++){
				if (i < emoji_num.length) {
					await embedMessage.react(emoji_num[i]);
				}
			}

			const filter_num = (reaction, user) => {
				return emoji_num.includes(reaction.emoji.name) && user.id === message.author.id;
			}

			embedMessage.awaitReactions(filter_num, { max: 1, time: 60000, errors: ['time'] })
				.then(async collected => {
					const reaction = collected.first();
					if (emoji_num.includes(reaction.emoji.name)) {
						await embedMessage.delete();
						getTexture( size, results[emoji_num.indexOf(reaction.emoji.name)] );
					}
				}).catch(async collected => {
					for (var i = 0; i < emoji_num.length; i++) {
						await embedMessage.reactions.cache.get(emoji_num[i]).remove();
					}
				});	
		}

		/*
		 * SHOW ASKED TEXTURE 
		*/
		function getTexture(textureSize, texture) {
			var imgURL = undefined;
			if (textureSize == 'vanilla') imgURL = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/20w51a/assets/minecraft/textures/' + texture;
			if (textureSize == '32') imgURL = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Compliance-Java-32x/Jappa-1.17/assets/minecraft/textures/' + texture;

			axios.get(imgURL).then(function (response) {
				getMeta(imgURL).then(async function (dimension) {
					const size = dimension.width + 'x' + dimension.height;

					var embed = new Discord.MessageEmbed()
						.setTitle(texture)
						.setColor(settings.COLOR_GREEN)
						.setURL(imgURL)
						.setImage(imgURL)
						.addFields(
							{ name: 'Resolution:', value: size, inline:true }
						)

					if (textureSize == 'vanilla') embed.setFooter('Defaults Texture');
					if (textureSize == '32') embed.setFooter('Compliance 32x', settings.C32_IMG)//.addFields({name: 'Author', value:'WIP'});
						
					const embedMessage = await message.channel.send(embed);
					await embedMessage.react('🗑️');
					if (dimension.width < 129 && dimension.height < 129) {
						await embedMessage.react('🔎');
					}
					await embedMessage.react('🌀');
					
					const filter = (reaction, user) => {
						return ['🗑️','🔎','🌀'].includes(reaction.emoji.name) && user.id === message.author.id;
					};

					embedMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
						.then(async collected => {
							const reaction = collected.first();
							if (reaction.emoji.name === '🗑️') {
								await embedMessage.delete();
								await message.delete();
							}
							if (reaction.emoji.name === '🔎') {
								if (size == '8x8')     return magnify(message, 32, embedMessage.embeds[0].image.url);
								if (size == '16x16')   return magnify(message, 16, embedMessage.embeds[0].image.url);
								if (size == '32x32')   return magnify(message,  8, embedMessage.embeds[0].image.url);
								if (size == '64x64')   return magnify(message,  4, embedMessage.embeds[0].image.url);
								if (size == '128x128') return magnify(message,  2, embedMessage.embeds[0].image.url);
								return magnify(message, 8, embedMessage.embeds[0].image.url);
							}
							if (reaction.emoji.name === '🌀') {
								if (textureSize == 'vanilla') return getTexture('32', texture);
								if (textureSize == '32')      return getTexture('vanilla', texture);
							}
						})	
						.catch(async collected => {
							await embedMessage.reactions.cache.get('🗑️').remove();
							if (dimension.width < 129 && dimension.height < 129) {
								await embedMessage.reactions.cache.get('🔎').remove();
							}
							await embedMessage.reactions.cache.get('🌀').remove();
						});

				}).catch(function(error) {
					console.log(error);
				});
			});
		}

	}
}