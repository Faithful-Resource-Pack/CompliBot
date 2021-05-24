const prefix = process.env.PREFIX;

const Discord  = require('discord.js');
const settings = require('../../settings.js');
const colors   = require('../../res/colors');
const strings  = require('../../res/strings');

module.exports = {
	name: 'ping',
	description: strings.HELP_DESC_PING,
	guildOnly: false,
	uses: strings.COMMAND_USES_ANYONE,
	syntax: `${prefix}ping`,
	async execute(client, message, args) {
		const m = new Discord.MessageEmbed().setTitle('Ping?')

		message.inlineReply(m).then(async m => {
		const embed = new Discord.MessageEmbed()
			.setTitle('Pong!')
			.setColor(colors.BLUE)
			.setDescription(`Latency: ${m.createdTimestamp - message.createdTimestamp}ms \nAPI Latency: ${Math.round(client.ws.ping)}ms`)
			.setFooter(message.client.user.username, settings.BOT_IMG);
		await m.edit(embed);
		if (message.channel.type !== 'dm') await m.react('🗑️');

		const filter = (reaction, user) => {
			return ['🗑️'].includes(reaction.emoji.name) && user.id === message.author.id;
		};

		m.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
			.then(async collected => {
				const reaction = collected.first();
				if (reaction.emoji.name === '🗑️') {
					await m.delete();
					if (!message.deleted && message.channel.type !== 'dm') await message.delete();
				}
			})
			.catch(async collected => {
				if (!embedMessage.deleted && message.channel.type !== 'dm') await m.reactions.cache.get('🗑️').remove();
			});
		})
	}
};
