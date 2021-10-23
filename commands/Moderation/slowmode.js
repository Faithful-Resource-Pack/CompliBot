const prefix  = process.env.PREFIX;

const Discord = require('discord.js');
const strings = require('../../resources/strings');
const colors  = require('../../resources/colors');

const { warnUser } = require('../../helpers/warnUser');

module.exports = {
	name: 'slowmode',
	aliases: ['slow'],
	description: strings.HELP_DESC_SLOWMODE,
	guildOnly: true,
	uses: strings.COMMAND_USES_MODS,
	category: 'Moderation',
	syntax: `${prefix}slowmode <time in seconds/off/disable/stop>`,
	example: `${prefix}slowmode 10`,
	async execute(client, message, args) {
		if (!message.member.roles.cache.some(role => role.name.includes("Administrator") || role.name.includes("Moderator") || role.id === '747839021421428776')) return warnUser(message, strings.COMMAND_NO_PERMISSION)
		if (!args.length) return warnUser(message, strings.COMMAND_NO_ARGUMENTS_GIVEN);

    if (args == 'off' || args == 'disable' || args == 'stop') {
			await message.channel.setRateLimitPerUser("0", `${message.author.tag} has used the slowmode command`);
			let embed = new Discord.MessageEmbed()
				.setAuthor(message.author.tag, message.author.displayAvatarURL())
				.setColor(colors.BLUE)
				.setDescription(`Disabled slowmode.`)
				.setTimestamp();

			return await message.reply({embeds: [embed]});
		}

    if (args > 21600) return warnUser(message, strings.SLOWMODE_TOO_BIG)
		if (isNaN(args)) return await warnUser(message, strings.COMMAND_NOT_A_NUMBER)

		else {
			await message.channel.setRateLimitPerUser(parseInt(args[0]), `${message.author.tag} has used the slowmode command`);
			let embed = new Discord.MessageEmbed()
				.setAuthor(message.author.tag, message.author.displayAvatarURL())
				.setColor(colors.BLUE)
				.setDescription(`Slowmode set to **${parseInt(args[0])} seconds**.`)
				.setTimestamp();

			return await message.reply({embeds: [embed]});
		}
	}
};
