const Discord = require('discord.js');
const prefix  = process.env.PREFIX;

const strings      = require('../../res/strings');
const colors       = require('../../res/colors');
const { warnUser } = require('../../functions/warnUser.js');

module.exports = {
	name: 'slowmode',
	aliases: ['slow'],
	description: strings.HELP_DESC_SLOWMODE,
	guildOnly: true,
	uses: strings.COMMAND_USES_MODS,
	syntax: `${prefix}slowmode <time in seconds/off/disable/stop>`,
	example: `${prefix}slowmode 10`,
	async execute(client, message, args) {

		if (!message.member.hasPermission('MANAGE_CHANNELS')) return await warnUser(message, strings.COMMAND_NO_PERMISSION);

		if (!args.length) return warnUser(message, strings.COMMAND_NO_ARGUMENTS_GIVEN);

    if (args == 'off' || args == 'disable' || args == 'stop') {
			await message.channel.setRateLimitPerUser("0", `${message.author.tag} has used the slowmode command`);
			var embed = new Discord.MessageEmbed()
				.setAuthor(message.author.tag, message.author.displayAvatarURL())
				.setColor(colors.BLUE)
				.setDescription(`Disabled slowmode.`)
				.setTimestamp();

			return await message.inlineReply(embed);
		}

    if (args > 21600) return warnUser(message, strings.SLOWMODE_TOO_BIG)
		if (isNaN(args)) return await warnUser(message, strings.COMMAND_NOT_A_NUMBER)

		else {
			await message.channel.setRateLimitPerUser(parseInt(args[0]), `${message.author.tag} has used the slowmode command`);
			var embed = new Discord.MessageEmbed()
				.setAuthor(message.author.tag, message.author.displayAvatarURL())
				.setColor(colors.BLUE)
				.setDescription(`Slowmode set to **${parseInt(args[0])} seconds**.`)
				.setTimestamp();

			return await message.inlineReply(embed);
		}
	}
};
