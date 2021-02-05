const prefix = process.env.PREFIX;

const Discord  = require('discord.js');
const axios    = require('axios').default;
const fs       = require('fs');
const strings  = require('../../res/strings');
const colors   = require('../../res/colors');
const settings = require('../../settings.js');

const { magnify }  = require('../../functions/magnify.js');
const { palette }  = require('../../functions/palette.js');
const { getMeta }  = require('../../functions/getMeta.js');
const { warnUser } = require('../../functions/warnUser.js');

module.exports = {
	name: 'texture',
	aliases: [ 'textures' ],
	description: 'Displays a specified texture from Compliance!\nYou can ask for a texture name, or using ``_`` at the begining to ask for non-complete name (such as _sword).\nYou can also use ``/`` at the begining to specify a folder instead of a texture name.',
	uses: 'Anyone',
	syntax: `${prefix}texture <vanilla/32/64> <texture_name>\n${prefix}texture <vanilla/32/64> <_name>\n${prefix}texture <vanilla/32/64> </folder/>`,
	async execute(client, message, args) {

		var textures        = JSON.parse(fs.readFileSync('./json/contributors/java.json'));
		var texturesBedrock = JSON.parse(fs.readFileSync('./json/contributors/bedrock.json'));
		var results = [];
		var index   = [];

		const allowed = ['vanilla','vanillabedrock','16','16j','16b','32','32j','32b','64','64j','64b'];
		const java    = ['16','32','64'];
		const bedrock = ['16b','32b','64b'];

		if (args != '') {
			if (allowed.includes(args[0])) {
				if (args[0] == 'vanilla') args[0] = '16';
				if (args[0] == 'vanillabedrock') args[0] = '16b';
				if (args[0] == '16j') args[0] = '16';
				if (args[0] == '32j') args[0] = '32';
				if (args[0] == '64j') args[0] = '64';

				if (args[1] && java.includes(args[0])){
					// begin with _, is inside : be able to search for _sword : sort all swords
					if (String(args[1]).startsWith('_')) {
						for (var i=0 ; i < textures.length ; i++){
							if (textures[i].path.split("/").pop().includes(args[1])) {
								results.push(textures[i].path);
								index.push(i);
							}
						}
					}
					// ends with /, is in subfolder
					if (String(args[1]).endsWith('/')) {
						for (var i=0 ; i < textures.length ; i++) {
							if (textures[i].path.includes(args[1])) {
								results.push(textures[i].path);
								index.push(i);
							}
						}
					}
					// classic search
					else {
						for (var i=0 ; i < textures.length ; i++){
							if (textures[i].path.split("/").pop().startsWith(args[1])) {
								results.push(textures[i].path);
								index.push(i);
							}
						}
					}

					// one texture found
					if (results.length == 1) return getTexture(args[0],results[0],index[0]);

					// multiple texture found
					if (results.length > 1) return getMultipleTexture(args[0],results,index);

					// no texture found
					if (results.length == 0) return warnUser(message,strings.TEXTURE_DOESNT_EXIST);
				}
				else if (args[1] && bedrock.includes(args[0])) {
					// begin with _, is inside : be able to search for _sword : sort all swords
					if (String(args[1]).startsWith('_')) {
						for (var i=0 ; i < texturesBedrock.length ; i++){
							if (texturesBedrock[i].path.split("/").pop().includes(args[1])) {
								results.push(texturesBedrock[i].path);
								index.push(i);
							}
						}
					}
					// ends with /, is in subfolder
					if (String(args[1]).endsWith('/')) {
						for (var i=0 ; i < texturesBedrock.length ; i++) {
							if (texturesBedrock[i].path.includes(args[1])) {
								results.push(texturesBedrock[i].path);
								index.push(i);
							}
						}
					}
					// classic search
					else {
						for (var i=0 ; i < texturesBedrock.length ; i++){
							if (texturesBedrock[i].path.split("/").pop().startsWith(args[1])) {
								results.push(texturesBedrock[i].path);
								index.push(i);
							}
						}
					}

					// one texture found
					if (results.length == 1) return getTexture(args[0],results[0],index[0]);

					// multiple texture found
					if (results.length > 1) return getMultipleTexture(args[0],results,index);

					// no texture found
					if (results.length == 0) return warnUser(message,strings.TEXTURE_DOESNT_EXIST);
				} else return warnUser(message,strings.COMMAND_NOT_ENOUGH_ARGUMENTS_GIVEN);
			}
			else return warnUser(message,strings.COMMAND_WRONG_ARGUMENTS_GIVEN);
		}
		else return warnUser(message,strings.COMMAND_NO_ARGUMENTS_GIVEN);

		/*
		 * ASK USER TO CHOOSE BETWEEN MULTIPLE TEXTURES
		*/
		async function getMultipleTexture(size,results,index) {
			// max amount of reactions reached
			const emoji_num = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','🇦','🇧','🇨','🇩','🇪','🇫','🇬','🇭','🇮','🇯'];

			var embed = new Discord.MessageEmbed()
				.setTitle(results.length + ' results for "' + args[1] + '" in '+args[0].replace('b'," Bedrock"))
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
						getTexture( size, results[emoji_num.indexOf(reaction.emoji.name)], index[emoji_num.indexOf(reaction.emoji.name)] );
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
            //console.warn('The message has already been deleted!')
          });
				} else {
          return;
        }
			}
    }

		/*
		 * SHOW ASKED TEXTURE
		*/
		function getTexture(type, name, index) {
			var imgURL = undefined;

			if (type == '16') imgURL = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/21w05a/assets/' + name;
			if (type == '32') imgURL = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Compliance-Java-32x/Jappa-1.17/assets/' + name;
			if (type == '64') imgURL = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Compliance-Java-64x/Jappa-1.17/assets/' + name;

			if (type == '16b') imgURL = 'https://raw.githubusercontent.com/ZtechNetwork/MCBVanillaResourcePack/master/' + name;
			if (type == '32b') imgURL = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Compliance-Bedrock-32x/Jappa-1.16.200/' + name;
			if (type == '64b') imgURL = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Compliance-Bedrock-64x/Jappa-1.16.200/' + name;

			axios.get(imgURL).then((response) => {
				getMeta(imgURL).then(async dimension => {
					const size = dimension.width + 'x' + dimension.height;

					var embed = new Discord.MessageEmbed()
						.setTitle(name)
						.setColor(colors.BLUE)
						.setURL(imgURL)
						.setImage(imgURL)
						.addFields(
							{ name: 'Resolution:', value: size, inline:true }
						)

					if (type == '16' || type == '16b') embed.setFooter('Vanilla Texture', settings.VANILLA_IMG);
					if (type == '32' || type == '32b') embed.setFooter('Compliance 32x', settings.C32_IMG)
					if (type == '64' || type == '64b') embed.setFooter('Compliance 64x', settings.C64_IMG)

					if (type == '32') {
						embed.addFields(
							{ name: 'Author(s)', value: authorsList(client, textures[index].c32.author), inline: true},
							{ name: 'Added', value: isValidDate(textures[index].c32.date), inline: true},
						);
					}

					if (type == '64') {
						embed.addFields(
							{ name: 'Author(s)', value: authorsList(client, textures[index].c64.author), inline: true},
							{ name: 'Added', value: isValidDate(textures[index].c64.date), inline: true},
						);
					}

					if (type == '32b') {
						embed.addFields(
							{ name: 'Author(s)', value: authorsList(client, texturesBedrock[index].c32.author), inline: true},
							{ name: 'Added', value: isValidDate(texturesBedrock[index].c32.date), inline: true},
						);
					}

					if (type == '64b') {
						embed.addFields(
							{ name: 'Author(s)', value: authorsList(client, texturesBedrock[index].c64.author), inline: true},
							{ name: 'Added', value: isValidDate(texturesBedrock[index].c64.date), inline: true},
						);
					}

					const embedMessage = await message.channel.send(embed);
					embedMessage.react('🗑️');
					if (dimension.width < 129 && dimension.height < 129) {
						embedMessage.react('🔎');
            embedMessage.react('🌀');
					}
					embedMessage.react('🎨');

					const filter = (reaction, user) => {
						return ['🗑️','🔎','🌀','🎨'].includes(reaction.emoji.name) && user.id === message.author.id;
					};

					embedMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
						.then(async collected => {
							const reaction = collected.first();
							if (reaction.emoji.name === '🗑️') {
								embedMessage.delete();
								message.delete();
							}
							if (reaction.emoji.name === '🎨') {
								return palette(message, embedMessage.embeds[0].image.url);
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
							if (reaction.emoji.name === '🌀' && java.includes(type)) {
								if (type == '16') return getTexture('32', name, index);
								if (type == '32') return getTexture('64', name, index);
								if (type == '64') return getTexture('16', name, index);
							}
							if (reaction.emoji.name === '🌀' && bedrock.includes(type)) {
								if (type == '16b') return getTexture('32b', name, index);
								if (type == '32b') return getTexture('64b', name, index);
								if (type == '64b') return getTexture('16b', name, index);
							}
						})
						.catch(async () => {
							embedMessage.reactions.cache.get('🗑️').remove();
							if (dimension.width < 129 && dimension.height < 129) {
								embedMessage.reactions.cache.get('🔎').remove();
							}
							embedMessage.reactions.cache.get('🌀').remove();
							embedMessage.reactions.cache.get('🎨').remove();
						});

				});
			}).catch((error) => {
				return warnUser(message,strings.TEXTURE_FAILED_LOADING+'\n'+error);
			});
		}

	}
}

function mentionFromUserTag(client, UserTag) {
	try {
		client.users.cache.find(u => u.tag === UserTag).id
	} catch (error) {
		return UserTag;
	}
	return `<@${client.users.cache.find(u => u.tag === UserTag).id}>`;
}

function authorsList(client, array) {
	if (array != undefined) {
		string = '';
		for (var i = 0; i < array.length; i++) {
			if (i != array.length - 1) string += `${mentionFromUserTag(client, array[i])}\n`;
			else string += `${mentionFromUserTag(client, array[i])}`;
		}
		return string;
	}
	else return `None`;
}

function isValidDate(string) {
	if (string != undefined) return string;
	else return `No date`;
}