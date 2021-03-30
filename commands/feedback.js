const prefix = process.env.PREFIX;

const Discord = require("discord.js");
const colors  = require('../res/colors');
const strings = require('../res/strings');

const { warnUser } = require('../functions/warnUser.js');

module.exports = {
	name: 'feedback',
	description: strings.HELP_DESC_FEEDBACK,
	guildOnly: false,
	uses: strings.COMMAND_USES_ANYONE,
	syntax: `${prefix}feedback [message]`,
	async execute(client, message, args) {
		const channel = client.channels.cache.get('821793794738749462');

		if (!args[0]) return warnUser(message, strings.FEEDBACK_NO_ARGS_GIVEN);

		var embed = new Discord.MessageEmbed()
			.setAuthor(`Feedback from ${message.author.tag}`, message.author.displayAvatarURL())
			.setColor(colors.BLUE)
			.setDescription(`\`\`\`${args.join(' ')}\`\`\``)
			.setTimestamp()

		var embed2 = new Discord.MessageEmbed()
			.setColor(colors.BLUE)
			.setDescription(strings.FEEDBACK_SUCCESS_DESCRPTION)
			.setTimestamp()

		await channel.send(embed);
		await message.channel.send(embed2);
	}
};
