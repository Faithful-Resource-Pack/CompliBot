const Discord = require('discord.js');
const prefix = process.env.PREFIX;

const strings = require('../res/strings');
const colors = require('../res/colors');
const { warnUser } = require('../functions/warnUser.js');

module.exports = {
	name: 'slowmode',
	aliases: ['slow'],
	description: 'Enable or disable the slowmode',
	uses: 'Moderators',
	syntax: `${prefix}slowmode <time in seconds/off/disable/stop>`,

	async execute(client, message, args) {
    if (!message.guild) return;

		if (message.member.hasPermission('MANAGE_CHANNELS')) {
			if (args != '') {
        		if (args == 'off' || args == 'disable' || args == 'stop') {
					await message.channel.setRateLimitPerUser("0", `${message.author.tag} has used the slowmode command`);
					var embed = new Discord.MessageEmbed()
						.setAuthor(message.author.tag, message.author.displayAvatarURL())
						.setColor(colors.BLUE)
						.setDescription(`Disabled slowmode.`)
						.setTimestamp();

					return await message.channel.send(embed);
				}

        		if (args > 21600) return warnUser(message, 'The number can\'t be bigger than 21600!')
				if (isNaN(args)) return await warnUser(message, "The amount parameter isn't a number!")

				else {
					await message.channel.setRateLimitPerUser(parseInt(args[0]), `${message.author.tag} has used the slowmode command`);
					var embed = new Discord.MessageEmbed()
						.setAuthor(message.author.tag, message.author.displayAvatarURL())
						.setColor(colors.BLUE)
						.setDescription(`Slowmode set to **${parseInt(args[0])} seconds**.`)
						.setTimestamp();

					return await message.channel.send(embed);
				}

			} else return warnUser(message,strings.COMMAND_PROVIDE_A_NUMBER);
		} else return warnUser(message,strings.COMMAND_NO_PERMISSION);
	}
};
