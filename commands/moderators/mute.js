const prefix = process.env.PREFIX;

const Discord  = require('discord.js');
const strings  = require('../../res/strings');
const colors   = require('../../res/colors');
const settings = require('../../settings.js');
const fs       = require('fs');

const { jsonModeration } = require('../../helpers/fileHandler');
const { warnUser }       = require('../../functions/warnUser.js');
const { modLog }         = require('../../functions/moderation/modLog.js');
const { addMutedRole }   = require('../../functions/moderation/addMutedRole.js');

module.exports = {
	name: 'mute',
	description: strings.HELP_DESC_MUTE,
	guildOnly: true,
	uses: strings.COMMAND_USES_MODS,
	syntax: `${prefix}mute <@user> <time> <reason>`,
	example: `${prefix}mute @Domi#5813 3h posting memes in #general`,
	async execute(client, message, args) {

		if (!message.member.hasPermission('BAN_MEMBERS')) return await warnUser(message, strings.COMMAND_NO_PERMISSION);
		if (!args.length) return warnUser(message, strings.COMMAND_NO_ARGUMENTS_GIVEN);

		let userID = undefined
		try {
			let member = message.mentions.member.first() || message.guild.members.cache.get(args[0])
			userID = member.id
		}
		catch (err) {
			userID = args[0].replace('<!@', '').replace('<@', '').replace('>', '')
		}

		if (userID.startsWith('!')) userID = userID.replace('!', '')

		const reason = args.slice(2).join(' ') || 'Not Specified'
		let time = args[1] || -100

		if (typeof time === 'string') {
			if (time.includes('s') || time.includes('seconds'))        time = parseInt(time, 10)
			else if (time.includes('min') || time.includes('minutes')) time = 60 * parseInt(time, 10)
			else if (time.includes('h') || time.includes('hour'))      time = 3600 * parseInt(time, 10)
			else if (time.includes('d') || time.includes('day'))       time = 86400 * parseInt(time, 10)
			else if (time.includes('w') || time.includes('week'))      time = 604800 * parseInt(time, 10)
			else if (time.includes('m') || time.includes('month'))     time = 2592000 * parseInt(time, 10)
			else if (time.includes('y') || time.includes('year'))      time = 31536000 * parseInt(time, 10)
			else return await warnUser(message, strings.MUTE_NOT_VALID_TIME)
		}

		if (!userID) return await warnUser(message, strings.MUTE_SPECIFY_USER)
		if (userID === message.author.id) return await warnUser(message, strings.MUTE_CANT_MUTE_SELF)
		if (userID === client.user.id) return await message.channel.send(strings.COMMAND_NOIDONTTHINKIWILL_LMAO)

		if (isNaN(time)) return await warnUser(message, strings.MUTE_SPECIFY_INTEGER)		
		else {
			var timeout = undefined
			if (time < 0) timeout = 'Unlimited'
			else timeout = `${time}`

			addMutedRole(client, userID, time)
			
			var endsAt = new Date()
			endsAt.setSeconds(endsAt.getSeconds() + time)
			if (time < 0) endsAt = "Never"
			else endsAt = `${endsAt.getUTCDate()}/${endsAt.getUTCMonth() + 1}/${endsAt.getUTCFullYear()} ${endsAt.getUTCHours()}:${endsAt.getUTCMinutes()}:${endsAt.getUTCSeconds()} UTC`

			var embed = new Discord.MessageEmbed()
				.setAuthor(message.author.tag, message.author.displayAvatarURL())
				.setTitle(`Muted someone:`)
				.setDescription(`**User:** <@!${userID}>\n**Reason:** \`${reason}\`\n**Time:** \`${timeout != 'Unlimited' ? timeout + ' seconds' : 'Unlimited'}\`\n**Ends at:** \`${endsAt}\``)
				.setColor(colors.BLACK)
				.setTimestamp()

			await message.inlineReply(embed)

			modLog(client, message, userID, reason, time, 'muted')
		}
	}
};