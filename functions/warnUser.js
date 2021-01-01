const Discord  = require('discord.js');
const settings = require('../settings.js');
const colors   = require('../res/colors');
const strings   = require('../res/strings');

async function warnUser(message,text) {
	var embed = new Discord.MessageEmbed()
		.setColor(colors.RED)
		.setTitle(strings.BOT_ERROR)
		.setDescription(text)
		.setFooter('Type /help to get more information', settings.BOT_IMG)

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
		.catch(async () => {
			await embedMessage.reactions.cache.get('🗑️').remove();
		});
}

exports.warnUser = warnUser;
