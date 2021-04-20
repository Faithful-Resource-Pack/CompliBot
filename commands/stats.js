const prefix = process.env.PREFIX;

const Discord  = require("discord.js");
const settings = require('../settings.js');
const colors   = require('../res/colors');
const strings  = require('../res/strings');

module.exports = {
	name: 'stats',
	aliases: ['botstats'],
	description: strings.HELP_DESC_STATS,
	guildOnly: false,
	uses: strings.COMMAND_USES_ANYONE,
	syntax: `${prefix}stats`,
	async execute(client, message, args) {
		if (message.channel.type !== 'dm') await message.inlineReply('Please check your dm\'s!');

		let seconds = Math.floor(message.client.uptime / 1000);
		let minutes = Math.floor(seconds / 60);
		let hours = Math.floor(minutes / 60);
		let days = Math.floor(hours / 24);

		seconds %= 60;
		minutes %= 60;
		hours %= 24;

		const embed = new Discord.MessageEmbed()
			.setTitle(`${message.client.user.username} Stats:`)
			.setThumbnail(settings.BOT_IMG)
			.setColor(colors.BLUE)
			.addFields(
				{ name: 'Uptime', value: `${days} day(s), ${hours} hours, ${minutes} minutes, ${seconds} seconds`},
				{ name: 'RAM Usage', value: `${((process.memoryUsage().heapUsed / 1024) / 1024).toFixed(2)} MB`},
				{ name: 'Discord Library', value: `discord.js ${Discord.version}`},
				{ name: 'Node.js', value: `Version ${process.version}`},
				{ name: 'InGuilds', value: client.guilds.cache.size},
			)
			//.setFooter(`Bot Uptime: ${days} day(s), ${hours} hours, ${minutes} minutes, ${seconds} seconds`)

		if (message.channel.type !== 'dm') await message.author.send(embed);
		else await message.inlineReply(embed);
	}
};
