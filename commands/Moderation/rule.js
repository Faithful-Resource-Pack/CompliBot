const prefix = process.env.PREFIX;

const Discord = require("discord.js")
const strings = require('../../resources/strings.json')
const settings = require('../../resources/settings.json')
const { warnUser } = require('../../helpers/warnUser')

module.exports = {
	name: 'rule',
	aliases: ['rules'],
	description: strings.command.description.rules,
	category: 'Moderation',
	guildOnly: true,
	uses: strings.command.use.mods,
	syntax: `${prefix}rule <n>`,
	flags: '',
	example: `${prefix}rule 1`,
	async execute(client, message, args) {
		if (!message.member.roles.cache.some(role => role.name.includes("Administrator") || role.name.includes("Moderator") || role.id === '747839021421428776')) return warnUser(message, strings.command.no_permission)

		const RULES = Object.values(strings.rules)

		let thumbnail = client.user.displayAvatarURL()
		let color = settings.colors.council

		switch (message.guild.id) {
			case settings.guilds.c32.id:
				color = settings.colors.c32
				thumbnail = settings.images.c32;
				break
			case settings.guilds.c64.id:
				color = settings.colors.c32
				thumbnail = settings.images.c64;
				break
			case settings.guilds.cextras.id:
				color = settings.colors.c32
				thumbnail = settings.images.cextras;
				break

			default:
				color = settings.colors.c32
				break
		}

		let rule;

		if (message.member.roles.cache.some(role => role.name.includes("Administrator") || role.id === '747839021421428776')) {
			if (args[0] == 'all') rule = -1;
		} else warnUser(message, "Only Administrators can do that!")

		if (rule != -1) rule = parseInt(args[0], 10)

		if (rule <= RULES.length && rule > 0) {
			const embed = new Discord.MessageEmbed()
				.setTitle(`${RULES[rule - 1].number} ${RULES[rule - 1].title}`)
				.setColor(color)
				.setThumbnail(settings.images.rules)
				.setDescription(RULES[rule - 1].description);

			return await message.reply({ embeds: [embed] });
		}

		else if (rule == -1) {

			let embed = new Discord.MessageEmbed()
				.setTitle(`Rules of the Compliance Discord's Servers`)
				.setColor(color)
				.setThumbnail(thumbnail)
				.setDescription(`**Ignoring, not knowing and/or bypassing the rules, as well as not listening to the moderators is not an excuse for misbehaving.**\nRemember, by talking in this server you're agreeing to follow these rules.`)
			await message.channel.send({ embeds: [embed] })

			for (let i = 0; i < RULES.length; i++) {
				if (RULES[i].date == undefined) { // skip changes note
					let embedRule = new Discord.MessageEmbed()
						.setColor(color)
						.setTitle(`${RULES[i].number} ${RULES[i].title}`)
						.setDescription(RULES[i].description)

					await message.channel.send({ embeds: [embedRule] });
				}

				else if (RULES[i].enabled == "true" || RULES[i].enabled == true) { // only for the changes note
					const embedChanges = new Discord.MessageEmbed()
						.setTitle(`Latest changes as of the ${RULES[i].date}`)
						.setColor(color)
						.setDescription(RULES[i].description + '\n\n> Please understand that failing to comply to these rules will result in an adequate punishment.')
						.setFooter(`The rules are subject to change.`, thumbnail)

					await message.channel.send({ embeds: [embedChanges] })
				}
			}

			if (!message.deleted) await message.delete();
		}

		// number is out of range
		else return warnUser(message, `You have to specify a number between 1 and ${RULES.length} included.`)

	}
}
