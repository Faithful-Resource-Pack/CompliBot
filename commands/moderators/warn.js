const prefix  = process.env.PREFIX;
const Discord = require('discord.js');
const strings = require('../../ressources/strings');
const colors  = require('../../ressources/colors');
const users   = require('../../helpers/firestorm/users.js')

const { warnUser }     = require('../../helpers/warnUser.js');
const { modLog }       = require('../../functions/moderation/modLog.js');
const { addMutedRole } = require('../../functions/moderation/addMutedRole.js');

module.exports = {
	name: 'warn',
	description: strings.HELP_DESC_WARN,
	guildOnly: true,
	uses: strings.COMMAND_USES_MODS,
	syntax: `${prefix}warn <@user> <reason>`,
	example: `${prefix}warn @Juknum#6148 breaking the bot`,
	async execute(client, message, args) {

		if (!message.member.hasPermission('BAN_MEMBERS')) return await warnUser(message, strings.COMMAND_NO_PERMISSION)
		if (!args.length) return warnUser(message, strings.COMMAND_NO_ARGUMENTS_GIVEN)

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

		if (!userID) return await warnUser(message, strings.WARN_SPECIFY_USER)
		if (userID === message.author.id) return await warnUser(message, strings.WARN_CANT_WARN_SELF)
		if (userID === client.user.id) return await message.channel.send(strings.COMMAND_NOIDONTTHINKIWILL_LMAO)

		// get the user from the db
		let user = await users.searchKeys([userID])

		// if the user doesn't exist, create a new one (add username for a better readability when looking at the db)
		if (!user[0]) {
			const discord_user = await client.users.cache.find(user => user.id === userID)

			user[0] = {
				username: discord_user.username
			}
		}

		// get user warns
		let warns = user[0].warns || new Array()

		// add warn to the warns array
		warns.push(reason)

		// update the db
		user[0].warns = warns
		users.set(userID, user[0])

		// mute the user if warns >= 3
		let time = 0
		if (warns.length >= 3) {
			time = 86400 * 10 * ((warns.length) - 2) // 10 days * number of warn

			var mutedEmbed = new Discord.MessageEmbed()
				.setAuthor(message.author.tag, message.author.displayAvatarURL())
				.setDescription(`After ${warns.length} warns, <@!${userID}> has been muted for \`${time / 86400}\` days`)
				.setColor(colors.BLACK)
				.setTimestamp();

			for (let i = 0; i < warns[i]; i++) {
				mutedEmbed.addFields({
					name: `Reason ${i + 1}`, value: warns[i]
				})
			}

			addMutedRole(client, userID, time);
		}

		var embed = new Discord.MessageEmbed()
			.setAuthor(message.author.tag, message.author.displayAvatarURL())
			.setTitle(`Warned someone:`)
			.setDescription(`**User:** <@!${userID}>\n**Reason:** \`${reason}\``)
			.setColor(colors.BLACK)
			.setTimestamp()
		await message.inlineReply(embed)

		if (mutedEmbed) await message.channel.send(mutedEmbed) // send it after the warn message
		modLog(client, message, userID, reason, time, 'warned')
	}
};