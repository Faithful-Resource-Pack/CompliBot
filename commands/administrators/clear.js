const prefix = process.env.PREFIX;

const Discord = require('discord.js');
const colors  = require('../../resources/colors');
const strings = require('../../resources/strings');

const { warnUser } = require('../../helpers/warnUser');

module.exports = {
	name: 'clear',
	description: strings.HELP_DESC_CLEAR,
	guildOnly: true,
	uses: strings.COMMAND_USES_MODS,
	syntax: `${prefix}clear <amount>`,
	example: `${prefix}clear 10`,
	async execute(client, message, args) {
		if (!message.member.roles.cache.some(role => role.name.includes("Administrator") || role.name.includes("God"))) return warnUser(message, strings.COMMAND_NO_PERMISSION)

		if (!args.length) return warnUser(message, strings.COMMAND_NO_ARGUMENTS_GIVEN);
		if (isNaN(args)) return await message.reply({content: strings.COMMAND_NOT_A_NUMBER});
		if (args > 100) return await message.reply({content: strings.CLEAR_TOO_MUCH});
		if (args < 1) return await message.reply({content: strings.CLEAR_NOT_ENOUGH});

		var amount = (parseInt(args, 10) + 1) > 100 ? 100 : parseInt(args, 10) + 1
		const messages = await message.channel.messages.fetch({ limit: amount });
		await message.channel.bulkDelete(messages);
		var embed = new Discord.MessageEmbed()
			.setAuthor(`${message.author.tag} bulk deleted ${args} messages!`)
			.setColor(colors.RED)
			.setThumbnail(message.author.displayAvatarURL())
			.setDescription(`[Jump to location](${message.url})\n\n**Server**: ${message.guild}\n\n**Channel**: <#${message.channel.id}>`)
			.setTimestamp()

		await client.channels.cache.get('798676864599195655').send(embed);
	}
};
