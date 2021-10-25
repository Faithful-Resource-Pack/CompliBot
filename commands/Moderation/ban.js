const prefix = process.env.PREFIX

const Discord = require('discord.js')
const { string } = require('../../resources/strings')
const colors = require('../../resources/colors')

const { Permissions } = require('discord.js');
const { warnUser } = require('../../helpers/warnUser')
const { modLog } = require('../../functions/moderation/modLog')

module.exports = {
	name: 'ban',
	description: string('command.description.ban'),
	guildOnly: true,
	uses: string('command.use.admins'),
	category: 'Moderation',
	syntax: `${prefix}ban <@user> <reason>`,
	example: `${prefix}ban @RobertR11#7841 breaking rule 2`,
	async execute(client, message, args) {
		if (!message.member.roles.cache.some(role => role.name.includes("Administrator") || role.id === '747839021421428776')) return warnUser(message, string('command.no_permission'))

		const member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
		const reason = args.slice(1).join(' ') || 'Not Specified'
		const bob = message.guild.members.cache.get(client.user.id)

		if (!bob.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) return await warnUser(message, string('command.ban.bot_no_permission'))
		if (!args.length) return warnUser(message, string('command.args.none_given'))
		if (!member) return await warnUser(message, string('command.ban.specify_user'))
		if (member.id === message.author.id) return await warnUser(message, string('command.ban.cant_ban_self'))
		if (member.id === client.user.id) return await message.channel.send({ content: string('command.no_i_dont_think_i_will') })
		if (!member.bannable) return await warnUser(message, string('command.ban.unbannable'))

		message.guild.members.cache.get(member.id).ban({ reason: reason })

		modLog(client, message, member, reason, 'none', 'banned')

		var embed = new Discord.MessageEmbed()
			.setAuthor(message.author.tag, message.author.displayAvatarURL())
			.setDescription(`Banned ${member} \nReason: ${reason}`)
			.setColor(colors.BLUE)
			.setTimestamp()

		await message.reply({ embeds: [embed] })
	}
}