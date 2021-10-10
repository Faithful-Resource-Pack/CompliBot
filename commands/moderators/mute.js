const prefix = process.env.PREFIX;

const Discord = require('discord.js');
const strings = require('../../resources/strings');
const colors  = require('../../resources/colors');

const { warnUser }     = require('../../helpers/warnUser');
const { modLog }       = require('../../functions/moderation/modLog');
const { addMutedRole } = require('../../functions/moderation/addMutedRole');

module.exports = {
	name: 'mute',
	description: strings.HELP_DESC_MUTE,
	guildOnly: true,
	uses: strings.COMMAND_USES_MODS,
	syntax: `${prefix}mute <@user> <time> <reason>`,
	example: `${prefix}mute @Domi#5813 3h posting memes in #general`,
	async execute(client, message, args) {
		if (!message.member.roles.cache.some(role => role.name.includes("Administrator") || role.name.includes("Moderator") || role.id === '747839021421428776')) return warnUser(message, strings.COMMAND_NO_PERMISSION)
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
		let timeOr = args[1] || -100
		let timeDur = 'undefined'

		if (typeof time === 'string') {
			if (time.includes('s') || time.includes('second')) {
				time = parseInt(time, 10)
				if (parseInt(timeOr, 10) == 1) timeDur = 'second'
				else timeDur = 'seconds'
			} else if (time.includes('min') || time.includes('minute')) {
				time = 60 * parseInt(time, 10)
				if (parseInt(timeOr, 10) == 1) timeDur = 'minute'
				else timeDur = 'minutes'
			} else if (time.includes('h') || time.includes('hour')) {
				time = 3600 * parseInt(time, 10)
				if (parseInt(timeOr, 10) == 1) timeDur = 'hour'
				else timeDur = 'hours'
			} else if (time.includes('d') || time.includes('day')) {
				time = 86400 * parseInt(time, 10)
				if (parseInt(timeOr, 10) == 1) timeDur = 'day'
				else timeDur = 'days'
			} else if (time.includes('w') || time.includes('week')) {
				time = 604800 * parseInt(time, 10)
				if (parseInt(timeOr, 10) == 1) timeDur = 'week'
				else timeDur = 'weeks'
			} else if (time.includes('m') || time.includes('month')) {
				time = 2592000 * parseInt(time, 10)
				if (parseInt(timeOr, 10) == 1) timeDur = 'month'
				else timeDur = 'months'
			} else if (time.includes('y') || time.includes('year')) {
				time = 31536000 * parseInt(time, 10)
				if (parseInt(timeOr, 10) == 1) timeDur = 'year'
				else timeDur = 'years'
			}
			else return await warnUser(message, strings.MUTE_NOT_VALID_TIME)
		}

		if (!userID) return await warnUser(message, strings.MUTE_SPECIFY_USER)
		if (userID === message.author.id) return await warnUser(message, strings.MUTE_CANT_MUTE_SELF)
		if (userID === client.user.id) return await message.channel.send({content: strings.COMMAND_NOIDONTTHINKIWILL_LMAO})

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
				.setDescription(`**User:** <@!${userID}>\n**Reason:** \`${reason}\`\n**Time:** \`${timeout != 'Unlimited' ? parseInt(timeOr, 10) + ` ${timeDur}` : 'Unlimited'}\`\n**Ends at:** \`${endsAt}\``)
				.setColor(colors.BLACK)
				.setTimestamp()

			await message.reply({embeds: [embed]})

			modLog(client, message, userID, reason, `${parseInt(timeOr, 10)} ${timeDur}`, 'muted')
		}
	}
};