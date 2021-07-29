const prefix  = process.env.PREFIX;

const Discord = require("discord.js");
const colors  = require('../../resources/colors');
const strings = require('../../resources/strings');

const { warnUser } = require('../../helpers/warnUser');

module.exports = {
	name: 'feedback',
	description: strings.HELP_DESC_FEEDBACK,
	guildOnly: false,
	uses: strings.COMMAND_USES_ANYONE,
	syntax: `${prefix}feedback [message]`,
	example: `${prefix}feedback Give the bot more beans`,
	async execute(client, message, args) {
		const channel = client.channels.cache.get('821793794738749462');

		if (!args[0]) return warnUser(message, strings.FEEDBACK_NO_ARGS_GIVEN);

		var embed = new Discord.MessageEmbed()
			.setAuthor(`Feedback from ${message.author.tag}`, message.author.displayAvatarURL())
			.setColor(colors.BLUE)
			.setDescription(`[Jump to message](${message.url})\n\n\`\`\`${args.join(' ')}\`\`\``)
			.setTimestamp()

		if (message.channel.type === 'dm') embed.addField('Channel:', '`Private message (DM)`')
		else {
			embed.addFields(
				{ name: 'Server:', value: `\`${message.guild.name}\`` },
				{ name: 'Channel:', value: `<#${message.channel.id}>` }
			)
		}

		var embed2 = new Discord.MessageEmbed()
			.setColor(colors.BLUE)
			.setDescription(strings.FEEDBACK_SUCCESS_DESCRPTION)
			.setTimestamp()

		await channel.send({embeds: [embed]});
		await message.reply({embeds: [embed2]});
	}
};
