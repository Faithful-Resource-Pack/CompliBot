const prefix = process.env.PREFIX
const Discord = require('discord.js')

const strings = require('../../resources/strings.json')
const settings = require('../../resources/settings.json')

const { warnUser } = require('../../helpers/warnUser')

module.exports = {
	name: 'bean',
	description: strings.command.description.bean,
	category: 'Fun',
	guildOnly: true,
	uses: strings.command.use.mods,
	syntax: `${prefix}bean <@user> <reason>`,
	example: `${prefix}bean @Sei#0721 spilling the beans`,
	async execute(client, message, args) {
		if (!message.member.roles.cache.some(role => role.name.includes("Administrator") || role.name.includes("Moderator") || role.id === '747839021421428776')) return warnUser(message, strings.command.no_permission)
		if (!args.length) return warnUser(message, strings.command.args.none_given)

		const member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
		const reason = args.slice(1).join(' ') || 'Not Specified'

		if (!member) return warnUser(message, strings.command.bean.specify_user)
		if (member.id === message.author.id) return warnUser(message, strings.command.bean.cant_bean_self)
		if (member.id === client.user.id) return await message.channel.send({ content: strings.command.no_i_dont_think_i_will })

		else {
			const embed = new Discord.MessageEmbed()
				.setAuthor(message.author.tag, message.author.displayAvatarURL())
				.setDescription(`Beaned ${member} \nReason: ${reason}`)
				.setColor(settings.colors.blue)
				.setTimestamp()
			await message.reply({ embeds: [embed] })
		}
	}
}
