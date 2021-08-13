const prefix = process.env.PREFIX

const Discord = require('discord.js')
const strings = require('../../resources/strings')
const colors  = require('../../resources/colors')

const { Permissions } = require('discord.js');
const { warnUser }    = require('../../helpers/warnUser')
const { modLog }      = require('../../functions/moderation/modLog')

module.exports = {
	name: 'ban',
	description: strings.HELP_DESC_BAN,
	guildOnly: true,
	uses: strings.COMMAND_USES_ADMINS,
	syntax: `${prefix}ban <@user> <reason>`,
	example: `${prefix}ban @RobertR11#7841 breaking rule 69`,
	async execute(client, message, args) {
		if (!message.member.roles.cache.some(role => role.name.includes("Administrator") || role.name.includes("God"))) return warnUser(message, strings.COMMAND_NO_PERMISSION)

		const member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
		const reason = args.slice(1).join(' ') || 'Not Specified'
		const bob    = message.guild.members.cache.get(client.user.id)

		if (!bob.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) return await warnUser(message, strings.BAN_BOT_NO_PERMISSION)
		if (!args.length) return warnUser(message, strings.COMMAND_NO_ARGUMENTS_GIVEN)
		if (!member) return await warnUser(message, strings.BAN_SPECIFY_USER)
		if (member.id === message.author.id) return await warnUser(message, strings.BAN_CANT_BAN_SELF)
		if (member.id === client.user.id) return await message.channel.send({content: strings.COMMAND_NOIDONTTHINKIWILL_LMAO})
		if (!member.bannable) return await warnUser(message, strings.BAN_NOT_BANNABLE)

		message.guild.members.cache.get(member.id).ban({reason: reason})

		modLog(client, message, member, reason, 'none', 'banned')
				
		var embed = new Discord.MessageEmbed()
			.setAuthor(message.author.tag, message.author.displayAvatarURL())
			.setDescription(`Banned ${member} \nReason: ${reason}`)
			.setColor(colors.BLUE)
			.setTimestamp()

		await message.reply({embeds: [embed]})
	}
}