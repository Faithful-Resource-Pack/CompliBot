const prefix = process.env.PREFIX
const Discord = require("discord.js")
const strings = require('../../resources/strings.json')
const { warnUser } = require('../../helpers/warnUser')

module.exports = {
	name: 'modping',
	aliases: ['moderators', 'pingmods'],
	description: strings.command.description.modping,
	category: 'Moderation',
	guildOnly: true,
	uses: strings.command.use.anyone,
	syntax: `${prefix}modping`,
	/**
	 * @param {Discord.Client} client 
	 * @param {Discord.Message} message 
	 * @param {Array<string>} args
	 */
	async execute(client, message, args) {

		const MOD_ROLE = message.guild.roles.cache.find(role => role.name.includes("Moderator"))
		console.log(MOD_ROLE)
		if (MOD_ROLE === undefined) return warnUser(message, 'There is no "Moderator" role on this server')
		const MODERATORS_ID = message.guild.roles.cache.find(role => role.name.includes("Moderator")).members.map(member => member.user.id)

		let embed = new Discord.MessageEmbed()
		if (args.includes('urgent') || args.includes('important') || args.includes('urgents')) {
			embed.setAuthor(message.author.tag, message.author.displayAvatarURL())
				.setTitle('Moderators:')
				.setDescription('You demanded that all moderators be present. You must have a good reason or penalties may be taken.')
				.setColor('#22202C')
				.setFooter(`use ${prefix}modping to call mods for help!`)

			await message.reply({ embeds: [embed] })
			return message.channel.send({ content: `<@&${MOD_ROLE.id}>` })
		}

		let MODERATORS_DND = new Array()
		let MODERATORS_ONLINE = new Array()

		for (let i = 0; i < MODERATORS_ID.length; i++) {
			const mod = message.guild.members.cache.get(MODERATORS_ID[i])
			const mod_pres = mod.presence // offline members seems to have null as presence in discord.js v13
			const mod_status = mod_pres !== null ? mod_pres.status : 'offline'

			if (mod_status === 'online')
				MODERATORS_ONLINE.push(`<@${MODERATORS_ID[i]}>`)
			else if (mod_status && mod_status !== 'offline')
				MODERATORS_DND.push(`<@${MODERATORS_ID[i]}>`)
		}

		if (MODERATORS_ONLINE.length > 0) {
			embed.setAuthor(message.author.tag, message.author.displayAvatarURL())
				.setTitle('Moderators:')
				.setDescription(`There ${MODERATORS_ONLINE.length > 1 ? "are" : "is"} **${MODERATORS_ONLINE.length} Moderator${MODERATORS_ONLINE.length > 1 ? "s" : ""} online**.`)
				.setColor('#22202C')
				.setFooter(`use ${prefix}modping to call mods for help!`)

			await message.reply({ embeds: [embed] })

			return message.channel.send({ content: MODERATORS_ONLINE.join(', ') })
		}

		if (MODERATORS_DND.length > 0) {
			embed.setAuthor(message.author.tag, message.author.displayAvatarURL())
				.setTitle('Moderators:')
				.setDescription(`There ${MODERATORS_DND.length > 1 ? "are" : "is"} **${MODERATORS_DND.length} Moderators in do not disturb / AFK **, they may not respond.`)
				.setColor('#22202C')
				.setFooter(`use ${prefix}modping to call mods for help!`)

			await message.reply({ embeds: [embed] })

			return message.channel.send({ content: MODERATORS_DND.join(', ') })
		}

		// No moderators online
		embed.setAuthor(message.author.tag, message.author.displayAvatarURL())
			.setTitle('Moderators:')
			.setDescription('There are currently no moderators online ¯\\_(ツ)_/¯, I\'m going to ping them all.')
			.setColor('#22202C')
			.setFooter(`use ${prefix}modping to call mods for help!`)

		await message.reply({ embeds: [embed] })
		message.channel.send({ content: `<@&${MOD_ROLE.id}>` })

	}
}