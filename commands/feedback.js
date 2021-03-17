const prefix = process.env.PREFIX;

const Discord = require("discord.js");
const colors  = require('../res/colors');
const strings = require('../res/strings');

const { warnUser } = require('../functions/warnUser.js');

module.exports = {
	name: 'feedback',
	description: strings.HELP_DESC_FEEDBACK,
	guildOnly: false,
	uses: 'Anyone',
	syntax: `${prefix}feedback [message]`,
	async execute(client, message, args) {
		const channel = client.channels.cache.get('821793794738749462');

		if (!args[0]) return warnUser(message, 'Please write some feedback and don\'t just leave it empty!');

		var embed = new Discord.MessageEmbed()
			.setAuthor(`Feedback from ${message.author.tag}`, message.author.displayAvatarURL())
			.setColor(colors.BLUE)
			.setDescription(`\`\`\`${args.join(' ')}\`\`\``)
			.setTimestamp()

		var embed2 = new Discord.MessageEmbed()
			.setColor(colors.BLUE)
			.setDescription(`Your feedback has been sent to the developers!`)
			.setTimestamp()

		await channel.send(embed);
		await message.channel.send(embed2);
	}
};
