const prefix = process.env.PREFIX;
const axios  = require('axios');

const Discord = require("discord.js");
const colors  = require('../res/colors');
const strings = require('../res/strings');

const { warnUser } = require('../functions/warnUser.js');

module.exports = {
	name: 'skin',
	description: strings.HELP_DESC_SKIN,
	guildOnly: false,
	uses: strings.COMMAND_USES_ANYONE,
	syntax: `${prefix}skin [minecraft username]`,
	example: `${prefix}skin Pomik108`,
	async execute(client, message, args) {
			if (!args.length) return await warnUser(message, strings.COMMAND_NO_ARGUMENTS_GIVEN);

			axios.get(`https://api.mojang.com/users/profiles/minecraft/${args[0]}`)
			.then(async function (response) {
				if (response.data.id == undefined) return await warnUser(message, 'That player doesn\'t exist!');

				var embed = new Discord.MessageEmbed()
					.setAuthor('This command is still experimental, skins may not load!')
					.setTitle(`${args[0]}'s Skin`)
					.setColor(colors.BLUE)
					.setDescription(`UUID: ${response.data.id}`)
					.setImage(`https://visage.surgeplay.com/full/512/${response.data.id}`)
					.setThumbnail(`https://visage.surgeplay.com/skin/512/${response.data.id}`)
					.setFooter('Powered by visage.surgeplay.com', 'https://visage.surgeplay.com/steve.png')

					const embedMessage = await message.inlineReply(embed);
					await embedMessage.react('🗑️');

					const filter = (reaction, user) => {
						return ['🗑️'].includes(reaction.emoji.name) && user.id === message.author.id;
					};

					embedMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
						.then(async collected => {
							const reaction = collected.first();
							if (reaction.emoji.name === '🗑️') {
								await embedMessage.delete();
								if (!message.deleted && message.channel.type !== 'dm') await message.delete();
							}
						})
						.catch(async () => {
							if (!message.deleted && message.channel.type !== 'dm') await embedMessage.reactions.cache.get('🗑️').remove();
						});
			})
			.catch(async function (error) {
				return await warnUser(message, 'That player doesn\'t exist!');
			});
	}
};
