const prefix = process.env.PREFIX;

const Discord = require("discord.js");
const os = require('os');
const moment = require('moment');
const settings = require('../../resources/settings.json')
const strings = require('../../resources/strings.json')

const { addDeleteReact } = require('../../helpers/addDeleteReact');
const { get: getCommandProcessed } = require("../../functions/commandProcess");

module.exports = {
	name: 'stats',
	aliases: ['botstats'],
	description: strings.command.description.stats,
	category: 'Bot',
	guildOnly: false,
	uses: strings.command.use.anyone,
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
			.setTitle(`${client.user.username} Stats`)
			.setThumbnail(client.user.displayAvatarURL())
			.setColor(settings.colors.blue)
			.addFields(
				{ name: 'Prefix', value: prefix, inline: true },
				{ name: 'Uptime', value: moment.duration(message.client.uptime).humanize(), inline: true },
				{ name: 'Guild Count', value: client.guilds.cache.size.toString(), inline: true },

				{ name: 'RAM used', value: `${((process.memoryUsage().heapUsed / 1024) / 1024).toFixed(2)} MB`, inline: true },
				{ name: 'Discord Library', value: `discord.js ${Discord.version}`, inline: true },
				{ name: 'Node.js', value: `${process.version}`, inline: true },

				{ name: "Total\nCommands", value: '' + client.commands.size, inline: true },
				{ name: "Commands\nProcessed", value: '' + number, inline: true },
				{ name: "Members\nAcross Guilds", value: '' + sumMembers, inline: true },

				{ name: 'Operating System', value: os.version() },
			)
			.setFooter('Bot made with love', 'https://static.wikia.nocookie.net/minecraft_gamepedia/images/0/06/Heart_(icon).png')

		const embedMessage = await message.reply({ embeds: [embed] });
		await addDeleteReact(embedMessage, message, true);
	}
};
