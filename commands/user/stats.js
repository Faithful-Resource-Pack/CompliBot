const prefix = process.env.PREFIX;

const Discord  = require("discord.js");
const os       = require('os');
const settings = require('../../resources/settings');
const colors   = require('../../resources/colors');
const strings  = require('../../resources/strings');

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
		let hours   = Math.floor(minutes / 60);
		let days    = Math.floor(hours / 24);

		let tseconds = 'seconds';
		let tminutes = 'minutes';
		let thours   = 'hours';
		let tdays    = 'days';

		seconds %= 60;
		minutes %= 60;
		hours   %= 24;

		if (seconds == 1) tseconds = 'second';
		if (minutes == 1) tminutes = 'minute';
		if (hours == 1)   thours = 'hour';
		if (days == 1)    thours = 'day';

		const embed = new Discord.MessageEmbed()
			.setTitle(`${message.client.user.username} Stats:`)
			.setThumbnail(settings.BOT_IMG)
			.setColor(colors.BLUE)
			.addFields(
				{ name: 'Uptime', value: `${days} ${tdays}, ${hours} ${thours}, ${minutes} ${tminutes}, ${seconds} ${tseconds}`},
				{ name: 'RAM usage', value: `${((process.memoryUsage().heapUsed / 1024) / 1024).toFixed(2)} MB`},
				{ name: 'Operating system', value: os.version()},
				{ name: 'Discord library', value: `discord.js ${Discord.version}`},
				{ name: 'Node.js', value: `Version ${process.version}`},
				{ name: 'In guilds', value: client.guilds.cache.size},
			)

		if (message.channel.type !== 'dm') await message.author.send(embed);
		else await message.inlineReply(embed);
	}
};
