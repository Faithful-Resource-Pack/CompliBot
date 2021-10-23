const prefix = process.env.PREFIX;

const Discord  = require("discord.js");
const os       = require('os');
const moment   = require('moment');
const settings = require('../../resources/settings');
const colors   = require('../../resources/colors');
const strings  = require('../../resources/strings');
const { get: getCommandProcessed } = require("../../functions/commandProcess");

module.exports = {
	name: 'stats',
	aliases: ['botstats'],
	description: strings.HELP_DESC_STATS,
	guildOnly: false,
	uses: strings.COMMAND_USES_ANYONE,
	category: 'Bot',
	syntax: `${prefix}stats`,
	/**
	 * @param {Discord.Client} client 
	 * @param {Discord.Message} message
	 */
	async execute(client, message) {

		let sumMembers = 0
		
		client.guilds.cache.each(guild => {
			sumMembers += guild.memberCount
		})

		const number = await getCommandProcessed()

		const embed = new Discord.MessageEmbed()
			.setTitle(`${message.client.user.username} Stats`)
			.setThumbnail(settings.BOT_IMG)
			.setColor(colors.BLUE)
			.addFields(
				{ name: 'Prefix', value: prefix, inline: true },
				{ name: 'Uptime', value: moment.duration(message.client.uptime).humanize(), inline: true },
				{ name: 'Guild Count', value: client.guilds.cache.size.toString(), inline: true },

				{ name: 'RAM used', value: `${((process.memoryUsage().heapUsed / 1024) / 1024).toFixed(2)} MB`, inline: true},
				{ name: 'Discord Library', value: `discord.js ${Discord.version}`, inline: true},
				{ name: 'Node.js', value: `${process.version}`, inline: true },

				{ name: "Total\nCommands", value: '' + client.commands.size, inline: true},
				{ name: "Messages\nSent", value: '' + number, inline: true},
				{ name: "Members\nAcross Guilds", value: '' + sumMembers, inline: true},

				{ name: 'Operating System', value: os.version()},
			)
			.setFooter('Bot made with love', 'https://static.wikia.nocookie.net/minecraft_gamepedia/images/0/06/Heart_(icon).png')

		return message.reply({embeds: [embed]});
	}
};
