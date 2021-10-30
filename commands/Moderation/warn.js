const prefix = process.env.PREFIX;

const Discord = require('discord.js');
const { string } = require('../../resources/strings');
const colors = require('../../resources/colors');
const users = require('../../helpers/firestorm/users')

const { warnUser } = require('../../helpers/warnUser');
const { modLog } = require('../../functions/moderation/modLog');
const { addMutedRole } = require('../../functions/moderation/addMutedRole');

module.exports = {
	name: 'warn',
	description: string('command.description.warn'),
	category: 'Moderation',
	guildOnly: true,
	uses: string('command.use.mods'),
	syntax: `${prefix}warn <@user> <reason>`,
	example: `${prefix}warn @Juknum#6148 breaking the bot`,
	async execute(client, message, args) {
		if (!message.member.roles.cache.some(role => role.name.includes("Administrator") || role.name.includes("Moderator") || role.id === '747839021421428776')) return warnUser(message, string('command.no_permission'))
		if (!args.length) return warnUser(message, string('command.args.none_given'))

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

		if (!userID) return await warnUser(message, string('command.warn.specify_user'))
		if (userID === message.author.id) return await warnUser(message, string('command.warn.cant_warn_self'))
		if (userID === client.user.id) return await message.channel.send({ embeds: string('command.no_i_dont_think_i_will') })

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

		// mute the user if warns % 3 == 0 (each 3 warns)
		let time = 0
		if (warns.length % 3 == 0) {
			time = 86400 * 5 // 5 days of mute

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
		await message.reply({ embeds: [embed] })

		if (mutedEmbed) await message.channel.send({ embeds: [mutedEmbed] }) // send it after the warn message
		modLog(client, message, userID, reason, time, 'warned')
	}
};