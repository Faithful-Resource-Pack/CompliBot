const prefix = process.env.PREFIX;

const Discord  = require('discord.js');
const axios    = require('axios').default;
const fs       = require('fs');
const strings  = require('../../res/strings');
const colors   = require('../../res/colors');
const settings = require('../../settings.js');

const { magnify }  = require('../../functions/magnify.js');
const { getMeta }  = require('../../functions/getMeta.js');
const { warnUser } = require('../../functions/warnUser.js');

module.exports = {
	name: 'texture',
	description: 'Displays a specified texture from Compliance!\nYou can ask for a texture name, or using ``_`` at the begining to ask for non-complete name (such as _sword).\nYou can also use ``/`` at the begining to specify a folder instead of a texture name.',
	uses: 'Anyone',
	syntax: `${prefix}texture <vanilla/32/64> <texture_name>\n${prefix}texture <vanilla/32/64> <_name>\n${prefix}texture <vanilla/32/64> </folder/>`,
	async execute(client, message, args) {

		let rawdata  = fs.readFileSync('textures.json');
		let textures = JSON.parse(rawdata);
		var results  = [];

		if (args != '') {
			if (args[0] == 'vanilla' || args[0] == '16' || args[0] == '32' || args[0] == '64') {
				if (args[0] == '16') args[0] = 'vanilla';
				if (args[1]) {
					// begin with _, is inside : be able to search for _sword : sort all swords
					if (String(args[1]).startsWith('_')) {
						for (var i=0 ; i < textures.length ; i++){
							if (textures[i].split("/").pop().includes(args[1])) {
								results.push(textures[i]);
							}
						}
					}
					// ends with /, is in subfolder
					if (String(args[1]).endsWith('/')) {
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
					if (results.length == 0) return warnUser(message,strings.TEXTURE_DOESNT_EXIST);
				}
				else return warnUser(message,strings.COMMAND_NOT_ENOUGH_ARGUMENTS_GIVEN);
			}
			else return warnUser(message,strings.COMMAND_WRONG_ARGUMENTS_GIVEN);
		}
		else return warnUser(message,strings.COMMAND_NO_ARGUMENTS_GIVEN);

		/*
		 * ASK USER TO CHOOSE BETWEEN MULTIPLE TEXTURES
		*/
		async function getMultipleTexture(size,results) {
			// max amount of reactions reached
			const emoji_num = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','🇦','🇧','🇨','🇩','🇪','🇫','🇬','🇭','🇮','🇯'];

			var embed = new Discord.MessageEmbed()
				.setTitle(results.length + ' results for "' + args[1] + '" in '+args[0])
        .setFooter('CompliBot', settings.BOT_IMG);

			var description = 'Choose one texture using emoji reactions.\nIf you don\'t see what you\'re looking for, be more specific.\n\n';
			for (var i=0; i < results.length; i++){
				if (i < emoji_num.length) {
					description += emoji_num[i] + ' — ' + results[i].replace(args, '**'+args+'**').replace(/_/g, '＿') + '\n';
				}
			}
			embed.setDescription(description);

			const embedMessage = await message.channel.send(embed);

      asyncReaction(embedMessage, results, emoji_num);

			const filter_num = (reaction, user) => {
				return emoji_num.includes(reaction.emoji.name) && user.id === message.author.id;
			}

			embedMessage.awaitReactions(filter_num, { max: 1, time: 60000, errors: ['time'] })
				.then(async collected => {
					const reaction = collected.first();
					if (emoji_num.includes(reaction.emoji.name)) {
						embedMessage.delete();
						getTexture( size, results[emoji_num.indexOf(reaction.emoji.name)] );
					}
				}).catch(async () => {
					for (var i = 0; i < results.length; i++) {
						if (i < emoji_num.length) {
							embedMessage.reactions.cache.get(emoji_num[i]).remove();
						}
					}
				});
		}

    /*
     * The reaction hack
     */
    async function asyncReaction(embedMessage, results, emoji_num) {
      var hasBeenDeleted = false;
			for (var i = 0; i < results.length; i++){
				if (i < emoji_num.length && !hasBeenDeleted) {
					await embedMessage.react(emoji_num[i]).catch(() => {
            hasBeenDeleted = true
            console.warn('The message has already been deleted!')
          });
				} else {
          return;
        }
			}
    }

		/*
		 * SHOW ASKED TEXTURE
		*/
		function getTexture(textureSize, texture) {
			var imgURL = undefined;
			if (textureSize == 'vanilla') imgURL = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/20w51a/assets/' + texture;
			if (textureSize == '32') imgURL = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Compliance-Java-32x/Jappa-1.17/assets/' + texture;
			if (textureSize == '64') imgURL = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Compliance-Java-64x/Jappa-1.17/assets/' + texture;

			axios.get(imgURL).then((response) => {
				getMeta(imgURL).then(async dimension => {
					const size = dimension.width + 'x' + dimension.height;

					var embed = new Discord.MessageEmbed()
						.setTitle(texture)
						.setColor(colors.BLUE)
						.setURL(imgURL)
						.setImage(imgURL)
						.addFields(
							{ name: 'Resolution:', value: size, inline:true }
						)

					if (textureSize == 'vanilla') embed.setFooter('Vanilla Texture', settings.VANILLA_IMG);
					if (textureSize == '32') embed.setFooter('Compliance 32x', settings.C32_IMG)//.addFields({name: 'Author', value:'WIP'});
					if (textureSize == '64') embed.setFooter('Compliance 64x', settings.C64_IMG)//.addFields({name: 'Author', value:'WIP'});

					const embedMessage = await message.channel.send(embed);
					embedMessage.react('🗑️');
					if (dimension.width < 129 && dimension.height < 129) {
						embedMessage.react('🔎');
					}
					embedMessage.react('🌀');

					const filter = (reaction, user) => {
						return ['🗑️','🔎','🌀'].includes(reaction.emoji.name) && user.id === message.author.id;
					};

					embedMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
						.then(async collected => {
							const reaction = collected.first();
							if (reaction.emoji.name === '🗑️') {
								embedMessage.delete();
								message.delete();
							}
							if (reaction.emoji.name === '🔎') {
                if (size == '8x8')     return magnify(message, 64, embedMessage.embeds[0].image.url);
								if (size == '16x16')   return magnify(message, 32, embedMessage.embeds[0].image.url);
								if (size == '32x32')   return magnify(message, 16, embedMessage.embeds[0].image.url);
								if (size == '64x64')   return magnify(message,  8, embedMessage.embeds[0].image.url);
								if (size == '128x128') return magnify(message,  4, embedMessage.embeds[0].image.url);
								if (size == '256x256') return magnify(message,  2, embedMessage.embeds[0].image.url);
								return magnify(message, 8, embedMessage.embeds[0].image.url);
							}
							if (reaction.emoji.name === '🌀') {
								if (textureSize == 'vanilla') return getTexture('32', texture);
								if (textureSize == '32')      return getTexture('64', texture);
								if (textureSize == '64')      return getTexture('vanilla', texture);
							}
						})
						.catch(async () => {
							embedMessage.reactions.cache.get('🗑️').remove();
							if (dimension.width < 129 && dimension.height < 129) {
								embedMessage.reactions.cache.get('🔎').remove();
							}
							embedMessage.reactions.cache.get('🌀').remove();
						});

				});
			}).catch((error) => {
				return warnUser(message,strings.TEXTURE_FAILED_LOADING+'\n'+error);
			});
		}

	}
}
