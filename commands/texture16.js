const Discord  = require('discord.js');
const axios    = require('axios').default;
const https    = require('https');
const sizeOf   = require('image-size');
const fs       = require('fs');
const speech   = require('../messages');
const settings = require('../settings.js');

module.exports = {
	name: 'texture16',
	aliases: ['textures16'],
	description: 'Displays a specified texture from Compliance!\nYou can ask for a texture name, or using ``_`` at the begining to ask for non-complete name (such as _swords).\nYou can also use ``/`` at the begining to specify a folder instead of a texture name.',
	uses: 'Anyone',
	syntax: `${prefix}texture16 <texture_name>\n${prefix}texture <_name>\n${prefix}texture </folder/>`,
	async execute(client, message, args) {

		// SEARCH:
		let rawdata  = fs.readFileSync('textures.json');
		let textures = JSON.parse(rawdata);
		var results  = [];

		if (args != '') {

			// begin with _, is inside : be able to search for _sword : sort all swords
			if (String(args).startsWith('_')) {
				for (var i=0 ; i < textures.length ; i++){
					if (textures[i].split("/").pop().includes(args)) {
						results.push(textures[i]);
					}
				}
			}
			// begin with /, is in subfolder
			if (String(args).startsWith('/')) {
				if (!String(args).endsWith('/')) {
					args = args + '/'; // to only check folder and not texture with the same name as folder
				} 
				for (var i=0 ; i < textures.length ; i++) {
					if (textures[i].includes(args)) {
						results.push(textures[i]);
					}
				}
			}
			else {
				for (var i=0 ; i < textures.length ; i++){
					if (textures[i].split("/").pop().startsWith(args)) {
						results.push(textures[i]);
					}
				}
			}

			if (results.length == 1) return GetTexture(results[0], message);

			// Multiple texture found:
			if (results.length > 1) {

				const emoji_num = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','🇦','🇧','🇨','🇩','🇪','🇫','🇬','🇭','🇮','🇯'];

				var embed = new Discord.MessageEmbed()
					.setTitle(results.length + ' results for "' + args + '"')
          .setFooter('CompliBot', settings.BOT_IMG);

				var description = 'Choose one texture using emoji reactions.\nIf you don\'t see what you\'re looking for, be more specific\n\n';
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
							GetTexture( results[emoji_num.indexOf(reaction.emoji.name)], message );
						}
					}).catch(async collected => {
						for (var i = 0; i < emoji_num.length; i++) {
							await embedMessage.reactions.cache.get(emoji_num[i]).remove();
						}
					});
			}
			// No textures found:
			else {
				var embed = new Discord.MessageEmbed()
	        .setColor(settings.COLOR_RED)
          .setTitle(speech.BOT_ERROR)
          .setDescription(speech.TEXTURE_DOESNT_EXIST);
        
				const embedMessage = await message.channel.send(embed);
        await embedMessage.react('🗑️');
        
				const filter = (reaction, user) => {
			    return ['🗑️'].includes(reaction.emoji.name) && user.id === message.author.id;
	    	};

        embedMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
			  	.then(async collected => {
				    const reaction = collected.first();
				  	if (reaction.emoji.name === '🗑️') {
				     	await embedMessage.delete();
              await message.delete();
				    }
			    })
          .catch(async collected => {
		        await embedMessage.reactions.cache.get('🗑️').remove();
	        });
			}
		}
	}
}

//Return Image size, need url.
function GetMeta(imgUrl) {
	return new Promise(function(resolve, reject) {
		https.get(imgUrl, function (response) {
			var chunks = [];
			response.on('data', function (chunk) {
				chunks.push(chunk);
			}).on('end', function() {
				var buffer = Buffer.concat(chunks);
				resolve(sizeOf(buffer));
			});
		}).on('error', function(error) {
			reject(error);
		});
	});
}

function GetTexture(texture, message) {
	const imgURL = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/master/assets/minecraft/textures/' + texture;
	
	axios.get(imgURL).then(function (response) {
		GetMeta(imgURL).then(async function (dimension) {
			const size = dimension.width + 'x' + dimension.height;

			var embed = new Discord.MessageEmbed()
				.setTitle(texture)
				.setURL(imgURL)
				.setImage(imgURL)
				.addFields(
					// { name: 'Author:', value: 'WIP' },
					{ name: 'Resolution:', value: size, inline:true }
				)
				.setFooter('CompliBot', settings.BOT_IMG);
				
			const embedMessage = await message.channel.send(embed);
			await embedMessage.react('🗑️');
					
			const filter = (reaction, user) => {
				return ['🗑️'].includes(reaction.emoji.name) && user.id === message.author.id;
			};

			embedMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
				.then(async collected => {
					const reaction = collected.first();
					if (reaction.emoji.name === '🗑️') {
						await embedMessage.delete();
						await message.delete();
					}
				})
				.catch(async collected => {
					await embedMessage.reactions.cache.get('🗑️').remove();
				});

		}).catch(function(error) {
    	console.log(error);
    });
	
	}).catch(async function(error) {
		var embed = new Discord.MessageEmbed()
	    .setColor(settings.COLOR_RED)
      .setTitle(speech.BOT_ERROR)
      .setDescription(speech.TEXTURE_FAILED_LOADING);
        
			const embedMessage = await message.channel.send(embed);
      await embedMessage.react('🗑️');
        
			const filter = (reaction, user) => {
			  return ['🗑️'].includes(reaction.emoji.name) && user.id === message.author.id;
	    };

      embedMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
				.then(async collected => {
					const reaction = collected.first();
					if (reaction.emoji.name === '🗑️') {
						await embedMessage.delete();
						await message.delete();
					}
				})
        .catch(async collected => {
		    	await embedMessage.reactions.cache.get('🗑️').remove();
	      });
	});
}