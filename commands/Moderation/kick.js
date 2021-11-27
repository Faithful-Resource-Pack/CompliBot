const prefix = process.env.PREFIX

const strings = require('../../resources/strings.json')
const settings = require('../../resources/settings.json')

const { MessageEmbed } = require('discord.js')
const { Permissions } = require('discord.js');
const { warnUser } = require('../../helpers/warnUser')
const { modLog } = require('../../functions/moderation/modLog')

module.exports = {
	name: 'kick',
	description: strings.command.description.kick,
	category: 'Moderation',
	guildOnly: true,
	uses: strings.command.use.mods,
	syntax: `${prefix}kick <@user> <reason>`,
	example: `${prefix}kick @RobertR11#7841 breaking rule 2`,
	async execute(client, message, args) {
		if (!message.member.roles.cache.some(role => role.name.includes("Administrator") || role.name.includes("Moderator") || role.id === '747839021421428776')) return warnUser(message, strings.command.no_permission)

		const member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
		const reason = args.slice(1).join(' ') || 'Not Specified'
		const bob = message.guild.members.cache.get(client.user.id)

		if (!bob.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) return await warnUser(message, strings.command.kick.bot_no_permission)
		if (!args.length) return warnUser(message, strings.command.args.none_given)
		if (!member) return await warnUser(message, strings.command.kick.specify_user)
		if (member.id === message.author.id) return await warnUser(message, strings.command.kick.cant_kick_self)
		if (member.id === client.user.id) return await message.channel.send({ content: strings.command.no_i_dont_think_i_will })
		if (!member.kickable) return await warnUser(message, strings.command.kick.unkickable)

		message.guild.members.cache.get(member.id).kick({ reason: reason })

		modLog(client, message, member.id, reason, 'none', 'kicked')

		var embed = new MessageEmbed()
			.setAuthor(message.author.tag, message.author.displayAvatarURL())
			.setDescription(`Kicked ${member} \nReason: ${reason}`)
			.setColor(settings.colors.blue)
			.setTimestamp()

		await message.reply({ embeds: [embed] })
	}
}