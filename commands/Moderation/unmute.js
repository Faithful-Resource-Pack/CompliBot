const prefix = process.env.PREFIX

const Discord = require('discord.js')
const strings = require('../../resources/strings.json')

const { warnUser } = require('../../helpers/warnUser')
const { modLog } = require('../../functions/moderation/modLog')
const { removeMutedRole } = require('../../functions/moderation/removeMutedRole')

module.exports = {
	name: 'unmute',
	aliases: ['pardon'],
	description: strings.command.description.unmute,
	category: 'Moderation',
	guildOnly: true,
	uses: strings.command.use.mods,
	syntax: `${prefix}unmute <@user> <reason>`,
	example: `${prefix}unmute @Domi#5813 not posting memes in #general`,
	async execute(client, message, args) {
		if (!message.member.roles.cache.some(role => role.name.includes("Administrator") || role.name.includes("Moderator") || role.id === '747839021421428776')) return warnUser(message, strings.command.no_permission)
		if (!args.length) return warnUser(message, strings.command.args.none_given)

		let userID = undefined
		try {
			let member = message.mentions.member.first() || message.guild.members.cache.get(args[0])
			userID = member.id
		}
		catch (err) {
			userID = args[0].replace('<!@', '').replace('<@', '').replace('>', '')
		}

		if (userID.startsWith('!')) userID = userID.replace('!', '')

		const reason = args.slice(1).join(' ') || 'Not Specified'

		if (!userID) return await warnUser(message, strings.command.unmute.specify_user);

		removeMutedRole(client, userID);

		var embed = new Discord.MessageEmbed()
			.setAuthor(message.author.tag, message.author.displayAvatarURL())
			.setDescription(`Unmuted <@!${userID}> \nReason: ${reason}`)
			.setColor(settings.colors.black)
			.setTimestamp();

		await message.reply({ embeds: [embed] });

		modLog(client, message, userID, reason, 0, 'unmuted')
	}

}
