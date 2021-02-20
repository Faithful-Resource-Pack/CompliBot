const prefix = process.env.PREFIX;

const Discord  = require('discord.js');
const settings = require('../../settings.js');
const colors   = require('../../res/colors');

module.exports = {
	name: 'ping',
	description: 'Pong!',
	guildOnly: false,
	uses: 'Anyone',
	syntax: `${prefix}ping`,
	async execute(client, message, args) {
		const m = new Discord.MessageEmbed().setTitle('Ping?')

		message.channel.send(m).then(async m => {
		const embed = new Discord.MessageEmbed()
			.setTitle('Pong!')
			.setColor(colors.BLUE)
			.setDescription(`Latency: ${m.createdTimestamp - message.createdTimestamp}ms \nAPI Latency: ${Math.round(client.ws.ping)}ms`)
			.setFooter('CompliBot', settings.BOT_IMG);
		await m.edit(embed);
		await m.react('🗑️');
		const filter = (reaction, user) => {
			return ['🗑️'].includes(reaction.emoji.name) && user.id === message.author.id;
		};

		m.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
			.then(async collected => {
				const reaction = collected.first();
				if (reaction.emoji.name === '🗑️') {
					await m.delete();
					if (!message.deleted) await message.delete();
				}
			})
			.catch(async collected => {
				await m.reactions.cache.get('🗑️').remove();
			});
		})
	}
};
