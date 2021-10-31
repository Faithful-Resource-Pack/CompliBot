const prefix = process.env.PREFIX;

const Discord = require('discord.js');
const strings = require('../../resources/strings.json');

const { warnUser } = require('../../helpers/warnUser');

module.exports = {
	name: 'slowmode',
	aliases: ['slow'],
	description: strings.command.description.slowmode,
	category: 'Moderation',
	guildOnly: true,
	uses: strings.command.use.mods,
	syntax: `${prefix}slowmode <time in seconds/off/disable/stop>`,
	example: `${prefix}slowmode 10`,
	async execute(client, message, args) {
		if (!message.member.roles.cache.some(role => role.name.includes("Administrator") || role.name.includes("Moderator") || role.id === '747839021421428776')) return warnUser(message, strings.command.no_permission)
		if (!args.length) return warnUser(message, strings.command.args.none_given);

		if (args == 'off' || args == 'disable' || args == 'stop') {
			await message.channel.setRateLimitPerUser("0", `${message.author.tag} has used the slowmode command`);
			let embed = new Discord.MessageEmbed()
				.setAuthor(message.author.tag, message.author.displayAvatarURL())
				.setColor(settings.colors.blue)
				.setDescription(`Disabled slowmode.`)
				.setTimestamp();

			return await message.reply({ embeds: [embed] });
		}

		if (args > 21600) return warnUser(message, strings.command.slowmode.too_big)
		if (isNaN(args)) return await warnUser(message, strings.command.args.invalid.not_number)

		else {
			await message.channel.setRateLimitPerUser(parseInt(args[0]), `${message.author.tag} has used the slowmode command`);
			let embed = new Discord.MessageEmbed()
				.setAuthor(message.author.tag, message.author.displayAvatarURL())
				.setColor(settings.colors.blue)
				.setDescription(`Slowmode set to **${parseInt(args[0])} seconds**.`)
				.setTimestamp();

			return await message.reply({ embeds: [embed] });
		}
	}
};
