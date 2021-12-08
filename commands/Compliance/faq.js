const prefix = process.env.PREFIX

const Discord = require("discord.js")
const settings = require('../../resources/settings.json')
const strings = require('../../resources/strings.json')
const { warnUser } = require('../../helpers/warnUser')

const FAQS = Object.values(strings.faq)

module.exports = {
	name: 'faq',
	answer: strings.command.description.faq,
	category: 'Compliance',
	guildOnly: true,
	uses: strings.command.use.anyone,
	syntax: `${prefix}faq [keyword]`,
	example: `${prefix}faq bot offline\n${prefix}faq submit\n\nADMINS ONLY:\n${prefix}faq all`,
	async execute(client, message, args) {
		let color = settings.colors.council

		switch (message.guild.id) {
			case settings.guilds.c32.id:
				color = settings.colors.c32
				break
			case settings.guilds.c64.id:
				color = settings.colors.c32
				break
			case settings.guilds.cextras.id:
				color = settings.colors.caddons
				break

			default:
				color = settings.colors.c32
				break
		}

		let embed
		if (args[0] == 'all') {
			if (message.member.roles.cache.some(role => role.name.includes("Administrator") || role.id === '747839021421428776')) {
				for (let i = 0; i < FAQS.length; i++) {
					embed = new Discord.MessageEmbed()
						.setTitle(FAQS[i].question)
						.setColor(color)
						.setDescription(FAQS[i].answer)
						.setFooter(`Keywords: ${Object.values(FAQS[i].keywords).join(' | ')}`)
					await message.channel.send({ embeds: [embed] })
				}
				if (!message.deleted) await message.delete()

			} else warnUser(message, "Only Administrators can do that!")
		} else {
			args = args.join(' ')
			for (let i = 0; i < FAQS.length; i++) {
				if (Object.values(FAQS[i].keywords).includes(args.toLowerCase())) {
					embed = new Discord.MessageEmbed()
						.setTitle(`FAQ: ${FAQS[i].question}`)
						.setThumbnail(settings.images.question)
						.setColor(settings.colors.blue)
						.setDescription(FAQS[i].answer)
						.setFooter(`Keywords: ${Object.values(FAQS[i].keywords).join(' | ')}`)
					await message.reply({ embeds: [embed] })
				}
			}

			if (embed === undefined) return warnUser(message, 'This keyword does not exist or is not attributed!')
		}


	}
}